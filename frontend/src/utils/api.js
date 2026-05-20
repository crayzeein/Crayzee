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

// Helper: update tokens in localStorage
const updateTokens = (token, refreshToken) => {
  try {
    const storage = getStoreData();
    if (storage) {
      storage.state.token = token;
      storage.state.refreshToken = refreshToken;
      localStorage.setItem('crayzee-storage', JSON.stringify(storage));
    }
  } catch {}
};

// Helper: force logout
const forceLogout = () => {
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
  // Redirect to login
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

      // Update stored tokens
      updateTokens(data.token, data.refreshToken);

      // Update the Zustand store's user data too
      if (storage) {
        storage.state.user = {
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          createdAt: data.createdAt,
        };
        storage.state.token = data.token;
        storage.state.refreshToken = data.refreshToken;
        localStorage.setItem('crayzee-storage', JSON.stringify(storage));
      }

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

export default API;
