import axios from 'axios';

// Use environment variable or fallback to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  updatePortfolio: (portfolioData) => api.put('/users/portfolio', portfolioData),
};

// Admin API
export const adminAPI = {
  getUsers: (adminKey) => api.get('/admin/users', {
    headers: { 'X-Admin-Key': adminKey }
  }),
  getAnalytics: (adminKey) => api.get('/admin/analytics', {
    headers: { 'X-Admin-Key': adminKey }
  }),
  deleteUser: (userId, adminKey) => api.delete(`/admin/users/${userId}`, {
    headers: { 'X-Admin-Key': adminKey }
  }),
  getActiveUsers: () => api.get('/admin/active-users'),
  getUserCredentials: () => api.get('/admin/user-credentials'),
};

export default api;