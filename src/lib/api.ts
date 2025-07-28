import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { sanitizeInput, validateInput, securityHeaders, csrfToken } from './security';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Create axios instance with security headers
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    ...securityHeaders,
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token and security headers
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CSRF token for state-changing requests
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      const csrf = csrfToken.get();
      if (csrf) {
        config.headers['X-CSRF-Token'] = csrf;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log error for debugging (simplified to avoid circular references)
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
    });

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token } = response.data;
          
          Cookies.set('access_token', access_token);
          Cookies.set('refresh_token', refresh_token);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Refresh failed, redirect to login
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        Cookies.remove('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Secure Auth API
export const authAPI = {
  register: (data: { email: string; password: string; name?: string; role?: string }) => {
    // Validate and sanitize inputs
    const emailValidation = validateInput.email(data.email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.error);
    }
    
    const passwordValidation = validateInput.password(data.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.error);
    }
    
    const sanitizedData = {
      email: sanitizeInput.email(data.email),
      password: data.password, // Don't sanitize password, just validate
      name: data.name ? sanitizeInput.text(data.name) : undefined,
      role: data.role ? sanitizeInput.text(data.role) : undefined,
    };
    
    return api.post('/auth/register', sanitizedData);
  },
  
  login: (data: { email: string; password: string }) => {
    // Validate and sanitize inputs
    const emailValidation = validateInput.email(data.email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.error);
    }
    
    const passwordValidation = validateInput.password(data.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.error);
    }
    
    const sanitizedData = {
      email: sanitizeInput.email(data.email),
      password: data.password, // Don't sanitize password, just validate
    };
    
    return api.post('/auth/login', sanitizedData);
  },
  
  logout: () => api.post('/auth/logout'),
  
  getProfile: () => api.get('/auth/profile'),
  
  refreshToken: (refreshToken: string) => {
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new Error('Invalid refresh token');
    }
    return api.post('/auth/refresh', { refresh_token: refreshToken });
  },
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  activate: (id: string) => api.patch(`/users/${id}/activate`),
  deactivate: (id: string) => api.patch(`/users/${id}/deactivate`),
};

// Posts API
export const postsAPI = {
  getAll: () => api.get('/posts'),
  getMyPosts: () => api.get('/posts/my-posts'),
  getById: (id: string) => api.get(`/posts/${id}`),
  create: (data: { title: string; content?: string; published?: boolean }) =>
    api.post('/posts', data),
  update: (id: string, data: any) => api.patch(`/posts/${id}`, data),
  delete: (id: string) => api.delete(`/posts/${id}`),
};

// Files API
export const filesAPI = {
  uploadImage: (formData: FormData) =>
    api.post('/upload/images/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  uploadDocument: (formData: FormData) =>
    api.post('/upload/documents/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  getMyImages: () => api.get('/upload/images/my-images'),
  getMyDocuments: () => api.get('/upload/documents/my-documents'),
  
  deleteFile: (fileId: string, type: 'images' | 'documents') =>
    api.delete(`/upload/${type}/${fileId}`),
  
  getFileInfo: (fileId: string) => api.get(`/files/info/${fileId}`),
  listFiles: () => api.get('/files/list'),
};

// Health API
export const healthAPI = {
  basic: () => api.get('/health'),
  detailed: () => api.get('/health/detailed'),
  errors: () => api.get('/health/errors'),
};