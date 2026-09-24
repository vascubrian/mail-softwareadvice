import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('leadflow_token') || sessionStorage.getItem('leadflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('leadflow_token'); localStorage.removeItem('leadflow_user');
    sessionStorage.removeItem('leadflow_token'); sessionStorage.removeItem('leadflow_user');
    if (!location.pathname.startsWith('/login')) location.replace('/login');
  }
  return Promise.reject(error);
});
export default api;
