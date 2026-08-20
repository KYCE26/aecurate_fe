// src/services/api.ts
import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

// Auto-handle 401 Unauthorized
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore().logout(); // Tendang ke login kalau token kadaluwarsa
    }
    return Promise.reject(err);
  }
);
export default api;