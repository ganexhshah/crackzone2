import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Use your backend URL - configured for mobile access
const API_BASE_URL = 'http://192.168.18.13:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request tracking for rate limiting protection
const requestTracker = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // Max 30 requests per minute

// Add request tracking to prevent rate limiting
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Only log in development mode
      if (__DEV__) {
        console.log('Auth token added to request:', token.substring(0, 20) + '...');
      }
    }
  } catch (error) {
    // Silent error handling for auth token retrieval
    if (__DEV__) {
      console.log('Error getting auth token:', error);
    }
  }

  // Rate limiting protection
  const now = Date.now();
  const endpoint = config.url;
  const requestHistory = requestTracker.get(endpoint) || [];
  
  // Remove old requests outside the window
  const recentRequests = requestHistory.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    console.warn(`Rate limit protection: Too many requests to ${endpoint}`);
    return Promise.reject(new Error('Rate limit protection: Please wait before making more requests'));
  }
  
  // Track this request
  recentRequests.push(now);
  requestTracker.set(endpoint, recentRequests);
  
  return config;
});

// Handle auth errors and rate limiting
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.log('API Error:', error.response?.status, error.response?.data, error.config?.url);
    
    if (error.response?.status === 401) {
      console.log('Unauthorized - clearing auth data');
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('user');
      // Navigate to login screen - this will be handled by the auth context
    } else if (error.response?.status === 429) {
      console.warn('Rate limited by server - backing off');
      // Clear request history for this endpoint to reset tracking
      const endpoint = error.config?.url;
      if (endpoint) {
        requestTracker.delete(endpoint);
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  completeProfile: (profileData) => api.post('/auth/complete-profile', profileData),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
};

// Tournaments API
export const tournamentsAPI = {
  getAll: () => api.get('/tournaments'),
  getById: (id) => api.get(`/tournaments/${id}`),
  registerSolo: (id, data) => api.post(`/tournaments/${id}/register-solo`, data),
  registerTeam: (id, data) => api.post(`/tournaments/${id}/register-team`, data),
  getMyRegistrations: () => api.get('/tournaments/my/registrations'),
  getLeaderboard: (id) => api.get(`/tournaments/${id}/leaderboard`),
};

// Teams API
export const teamsAPI = {
  getMyTeams: () => api.get('/teams/my-teams'),
  getAvailable: (params) => api.get('/teams/available', { params }),
  create: (teamData) => api.post('/teams', teamData),
  join: (teamId, data) => api.post(`/teams/${teamId}/join`, data),
  leave: (teamId) => api.delete(`/teams/${teamId}/leave`),
  delete: (teamId) => api.delete(`/teams/${teamId}`),
  update: (teamId, data) => api.put(`/teams/${teamId}`, data),
  getDetails: (teamId) => api.get(`/teams/${teamId}`),
  getMyJoinRequests: () => api.get('/teams/my-join-requests'),
  cancelJoinRequest: (requestId) => api.delete(`/teams/join-requests/${requestId}`),
  getJoinRequests: (teamId) => api.get(`/teams/${teamId}/join-requests`),
  manageJoinRequest: (teamId, requestId, action) => api.post(`/teams/${teamId}/join-requests/${requestId}/${action}`),
  searchUsers: (teamId, params) => api.get(`/teams/${teamId}/search-users`, { params }),
  inviteUser: (teamId, data) => api.post(`/teams/${teamId}/invite`, data),
  removeMember: (teamId, memberId) => api.delete(`/teams/${teamId}/members/${memberId}`),
};

// Wallet API
export const walletAPI = {
  getWallet: () => api.get('/wallet'),
  getTransactions: (params) => api.get('/wallet/transactions', { params }),
  getTransactionDetails: (transactionId) => api.get(`/wallet/transactions/${transactionId}`),
  addMoney: (data) => api.post('/wallet/add-money', data),
  withdraw: (data) => api.post('/wallet/withdraw', data),
  getManualPaymentMethods: () => api.get('/wallet/manual-payment-methods'),
  submitManualPayment: (data) => api.post('/wallet/manual-payment', data),
  reportTransaction: (data) => api.post('/wallet/report-transaction', data),
  uploadPaymentScreenshot: (imageUri) => {
    const formData = new FormData();
    
    // For React Native, we need to provide the correct format
    formData.append('screenshot', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'payment-screenshot.jpg',
    });
    
    return api.post('/uploads/payment-screenshot', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  getAchievements: () => api.get('/profile/achievements'),
  getMatches: (params) => api.get('/profile/matches', { params }),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getStats: () => api.get('/notifications/stats'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAsUnread: (id) => api.put(`/notifications/${id}/unread`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  clearAll: () => api.delete('/notifications/clear-all'),
  handleAction: (id, action) => api.post(`/notifications/${id}/action`, { action }),
  create: (data) => api.post('/notifications/create', data),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentTournaments: () => api.get('/dashboard/recent-tournaments'),
  getUpcomingTournaments: () => api.get('/dashboard/upcoming-tournaments'),
};

// Leaderboard API
export const leaderboardAPI = {
  getGlobalLeaderboard: (params) => api.get('/leaderboard', { params }),
  getLeaderboardStats: (params) => api.get('/leaderboard/stats', { params }),
  getMyPosition: (params) => api.get('/leaderboard/my-position', { params }),
  getAroundMe: (params) => api.get('/leaderboard/around-me', { params }),
};

export default api;