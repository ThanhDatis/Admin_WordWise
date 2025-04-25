import axios from 'axios';

// Create an axios instance with base configuration
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://api.wordwise.com', // Replace with your actual API base URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to attach auth token for protected routes
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authService = {
  // Login
  login: async (credentials) => {
    try {
      const response = await API.post('/Auth/login', credentials);
      // Store token and user info in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify({
          userId: response.data.userId,
          email: response.data.email,
          roles: response.data.roles,
        }));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user has role
  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user && user.roles && user.roles.includes(role);
  }
};

// User management API calls
export const userService = {
  // Get all users (admin only)
  getAllUsers: async (page = 1, itemPerPage = 20, emailUser = '', roleFilter = '') => {
    try {
      const response = await API.get('/Auth/get-all-user', {
        params: { page, itemPerPage, emailUser, roleFilter }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get paginated list of users
  getUserList: async (page = 0, pageSize = 20) => {
    try {
      const response = await API.get('/Auth/get-users', {
        params: { page, pageSize }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Register new admin user (SuperAdmin only)
  registerAdmin: async (adminData) => {
    try {
      const response = await API.post('/Auth/register-admin', adminData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await API.get(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Create new user
  createUser: async (userData) => {
    try {
      const response = await API.post('/api/users', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Update user
  updateUser: async (userId, userData) => {
    try {
      const response = await API.put(`/api/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await API.delete(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// FlashCard sets API calls
export const flashCardService = {
  // Get all flashcard sets for a specific user
  getUserFlashcardSets: async (userId, page = 1, itemPerPage = 5) => {
    try {
      const response = await API.get(`/api/FlashCardSet/GetAll/${userId}`, {
        params: { page, itemPerPage }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get public flashcard sets (for explore page)
  getPublicFlashcardSets: async (page = 1, itemPerPage = 5) => {
    try {
      const response = await API.get('/api/FlashCardSet/Explore', {
        params: { page, itemPerPage }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Content report API calls
export const reportService = {
  // Get all content reports with filtering options (admin only)
  getAllReports: async (filters = {}) => {
    const { 
      reportId, 
      userId, 
      contentType, 
      status, 
      sortBy, 
      isDesc, 
      currentPage = 1, 
      itemPerPage = 20 
    } = filters;
    
    try {
      const response = await API.get('/api/ContentReport/GetAllReport', {
        params: { 
          reportId, 
          userId, 
          contentType, 
          status, 
          sortBy, 
          isDesc, 
          currentPage, 
          itemPerPage 
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Update report status
  updateReportStatus: async (reportId, newStatus) => {
    try {
      const response = await API.put(`/api/ContentReport/ApproveReport/${reportId}`, null, {
        params: { reportStatus: newStatus }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get report details by ID
  getReportById: async (reportId) => {
    try {
      const response = await API.get(`/api/ContentReport/${reportId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default API; 