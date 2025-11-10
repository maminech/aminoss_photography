import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Replace with your actual production URL
const API_BASE_URL = 'https://aminossphotography-pzcspo5w5-aminech990000-6355s-projects.vercel.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('admin-session');
    if (token) {
      config.headers['Cookie'] = `admin-session=${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear session and redirect to login
      await AsyncStorage.removeItem('admin-session');
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/admin/auth/login', { email, password });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/api/admin/auth/logout');
    return response.data;
  },
  checkSession: async () => {
    const response = await api.get('/api/admin/auth/me');
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/api/admin/dashboard/stats');
    return response.data;
  },
};

// Invoices API
export const invoicesAPI = {
  getAll: async () => {
    const response = await api.get('/api/admin/invoices');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/api/invoices/invoice/${id}`);
    return response.data;
  },
  markAsPaid: async (id: string) => {
    const response = await api.patch(`/api/invoices/invoice/${id}`, {
      paymentStatus: 'paid',
      paymentDate: new Date().toISOString(),
    });
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.patch(`/api/invoices/invoice/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/api/invoices/invoice/${id}`);
    return response.data;
  },
};

// Bookings API
export const bookingsAPI = {
  getAll: async () => {
    const response = await api.get('/api/bookings');
    return response.data;
  },
  approve: async (id: string) => {
    const response = await api.post(`/api/bookings/${id}/approve`);
    return response.data;
  },
  reject: async (id: string, reason: string) => {
    const response = await api.post(`/api/bookings/${id}/reject`, { reason });
    return response.data;
  },
};

// Photobooks API
export const photobooksAPI = {
  getAll: async () => {
    const response = await api.get('/api/admin/photobooks');
    return response.data;
  },
  updateStatus: async (id: string, status: string, adminNotes?: string) => {
    const response = await api.patch(`/api/admin/photobooks/${id}`, { 
      status, 
      adminNotes 
    });
    return response.data;
  },
};

// Photos API
export const photosAPI = {
  getAll: async () => {
    const response = await api.get('/api/photos');
    return response.data;
  },
  sync: async () => {
    const response = await api.post('/api/admin/sync-photos');
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/api/photos/${id}`);
    return response.data;
  },
};

// Clients API
export const clientsAPI = {
  getAll: async () => {
    const response = await api.get('/api/admin/clients');
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/api/admin/clients', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.patch(`/api/admin/clients/${id}`, data);
    return response.data;
  },
};

// Expenses API
export const expensesAPI = {
  getAll: async () => {
    const response = await api.get('/api/admin/expenses');
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/api/admin/expenses', data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/api/admin/expenses/${id}`);
    return response.data;
  },
};

// Messages API
export const messagesAPI = {
  getAll: async () => {
    const response = await api.get('/api/messages');
    return response.data;
  },
  markAsRead: async (id: string) => {
    const response = await api.patch(`/api/messages/${id}`, { status: 'read' });
    return response.data;
  },
};

// Galleries API
export const galleriesAPI = {
  getAll: async () => {
    const response = await api.get('/api/admin/galleries');
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/api/admin/galleries', data);
    return response.data;
  },
};
