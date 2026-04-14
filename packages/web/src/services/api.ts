import axios from 'axios';

// Strategy: 
// - Development: use /api proxy (configured in vite.config.ts)
// - Production: use VITE_API_URL or construct from window location
const getApiUrl = () => {
  // In development, use the Vite proxy
  if (import.meta.env.DEV) {
    return '/api';
  }

  // In production, respect the env variable or use the current host
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }

  // Fallback: construct from window location (works on any host on the network)
  const protocol = window.location.protocol;
  const host = window.location.host;
  return `${protocol}//${host}`;
};

const API_URL = getApiUrl();

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export const getMediaUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads')) {
    // In development, uploads endpoint is proxied
    if (import.meta.env.DEV) {
      return url;
    }
    // In production, prepend the API URL
    return `${API_URL}${url}`;
  }
  return url;
};

export default api;
