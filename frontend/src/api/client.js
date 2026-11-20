import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ff_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('ff_refresh_token');
      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE_URL}/accounts/refresh/`, { refresh });
          const newAccess = res.data.access;
          localStorage.setItem('ff_access_token', newAccess);
          if (res.data.refresh) {
            localStorage.setItem('ff_refresh_token', res.data.refresh);
          }
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('ff_access_token');
          localStorage.removeItem('ff_refresh_token');
          localStorage.removeItem('ff_user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const extractResults = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

export default api;
