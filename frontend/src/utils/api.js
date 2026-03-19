import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

// Add token to requests
API.interceptors.request.use((req) => {
  const storage = localStorage.getItem('crayzee-storage');
  if (storage) {
    const { state } = JSON.parse(storage);
    if (state.token) {
      req.headers.Authorization = `Bearer ${state.token}`;
    }
  }
  return req;
});

export default API;
