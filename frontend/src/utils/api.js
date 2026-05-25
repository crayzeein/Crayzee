import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

// Flag to prevent multiple refresh calls at the same time
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Helper: get store data from localStorage
const getStoreData = () => {
  try {
    const storage = localStorage.getItem('crayzee-storage');
    if (storage) return JSON.parse(storage);
  } catch {}
  return null;
};

// Helper: update tokens in BOTH localStorage AND Zustand in-memory store
const updateTokens = (data) => {
  try {
    // 1. Update localStorage directly (for interceptor reads)
    const storage = getStoreData();
    if (storage) {
      storage.state.token = data.token;
      storage.state.refreshToken = data.refreshToken;
      storage.state.user = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        createdAt: data.createdAt,
      };
      localStorage.setItem('crayzee-storage', JSON.stringify(storage));
    }

    // 2. Update Zustand in-memory store (prevents Zustand from overwriting localStorage with stale tokens)
    const { useStore } = require('@/store/useStore');
    const store = useStore.getState();
    if (store && store.setUser) {
      store.setUser(
        { _id: data._id, name: data.name, email: data.email, role: data.role, createdAt: data.createdAt },
        data.token,
        data.refreshToken
      );
    }
  } catch (e) {
    // Fallback: at minimum localStorage was updated above
    console.warn('Token sync warning:', e.message);
  }
};

// Helper: force logout — only called when refresh token itself is invalid/expired
const forceLogout = () => {
  try {
    // Clear Zustand store
    const { useStore } = require('@/store/useStore');
    const store = useStore.getState();
    if (store && store.logout) {
      // Use a simplified logout that doesn't call API (we're already in a failed auth state)
      store.setUser?.(null, null, null);
    }
  } catch {}

  try {
    const storage = getStoreData();
    if (storage) {
      storage.state.user = null;
      storage.state.token = null;
      storage.state.refreshToken = null;
      storage.state.cart = [];
      storage.state.wishlist = [];
      localStorage.setItem('crayzee-storage', JSON.stringify(storage));
    }
  } catch {}

  // Redirect to login — but ONLY if not already on login page
  if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
    window.location.href = '/login?expired=1';
  }
};

// REQUEST INTERCEPTOR: Add access token to every request
API.interceptors.request.use((req) => {
  const storage = getStoreData();
  if (storage?.state?.token) {
    req.headers.Authorization = `Bearer ${storage.state.token}`;
  }
  return req;
});

// RESPONSE INTERCEPTOR: Handle 401 errors with silent token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh on login/register/refresh-token endpoints
    const skipRefreshUrls = ['/auth/login', '/auth/register', '/auth/google', '/auth/refresh-token'];
    if (skipRefreshUrls.some(url => originalRequest.url?.includes(url))) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return API(originalRequest);
      }).catch(err => {
        return Promise.reject(err);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const storage = getStoreData();
      const refreshToken = storage?.state?.refreshToken;

      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      // Call refresh endpoint
      const { data } = await axios.post(
        `${API.defaults.baseURL}/auth/refresh-token`,
        { refreshToken }
      );

      // Update BOTH localStorage AND Zustand in-memory store
      updateTokens(data);

      // Process queued requests with new token
      processQueue(null, data.token);

      // Retry original request with new token
      originalRequest.headers.Authorization = `Bearer ${data.token}`;
      return API(originalRequest);

    } catch (refreshError) {
      // Refresh failed — force logout
      processQueue(refreshError, null);
      forceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ─── PROACTIVE TOKEN REFRESH ───
// Refresh the token BEFORE it expires so users never see a 401
let proactiveRefreshTimer = null;

const scheduleProactiveRefresh = () => {
  // Clear any existing timer
  if (proactiveRefreshTimer) {
    clearTimeout(proactiveRefreshTimer);
    proactiveRefreshTimer = null;
  }

  const storage = getStoreData();
  const token = storage?.state?.token;
  const refreshToken = storage?.state?.refreshToken;

  if (!token || !refreshToken) return;

  try {
    // Decode JWT to get expiry time (without verifying — that's the backend's job)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = payload.exp * 1000; // Convert to ms
    const now = Date.now();
    // Refresh 5 minutes before expiry
    const refreshIn = Math.max(expiresAt - now - 5 * 60 * 1000, 10000); // At least 10 seconds

    proactiveRefreshTimer = setTimeout(async () => {
      try {
        const currentStorage = getStoreData();
        const currentRefreshToken = currentStorage?.state?.refreshToken;
        if (!currentRefreshToken) return;

        const { data } = await axios.post(
          `${API.defaults.baseURL}/auth/refresh-token`,
          { refreshToken: currentRefreshToken }
        );

        updateTokens(data);

        // Schedule the next proactive refresh
        scheduleProactiveRefresh();
      } catch (err) {
        // Silent fail — the response interceptor will handle it on next API call
        console.warn('Proactive refresh failed, will retry on next API call');
      }
    }, refreshIn);
  } catch {
    // Token decode failed — skip proactive refresh
  }
};

// Start proactive refresh when the module loads (client-side only)
if (typeof window !== 'undefined') {
  // Schedule on initial load
  setTimeout(scheduleProactiveRefresh, 2000);

  // Also re-schedule whenever localStorage changes (e.g., after login)
  window.addEventListener('storage', (e) => {
    if (e.key === 'crayzee-storage') {
      scheduleProactiveRefresh();
    }
  });
}

// Export helper so login/signup pages can trigger proactive refresh after login
export const startTokenRefreshTimer = () => scheduleProactiveRefresh();

export default API;
