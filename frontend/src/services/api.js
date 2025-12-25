import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
  join: (id) => api.post(`/tournaments/${id}/join`), // Legacy endpoint
  registerSolo: (id, data) => api.post(`/tournaments/${id}/register-solo`, data),
  registerTeam: (id, data) => api.post(`/tournaments/${id}/register-team`, data),
  getMyRegistrations: () => api.get('/tournaments/my/registrations'),
  getLeaderboard: (id) => api.get(`/tournaments/${id}/leaderboard`),
  updateRoomDetails: (id, data) => api.put(`/tournaments/${id}/room-details`, data),
  submitResults: (id, data) => api.post(`/tournaments/${id}/results`, data),
};

// Teams API
export const teamsAPI = {
  getMyTeams: () => api.get('/teams/my-teams'),
  getAvailable: (params) => api.get('/teams/available', { params }),
  create: (teamData) => api.post('/teams', teamData),
  join: (teamId, data) => api.post(`/teams/${teamId}/join`, data),
  leave: (teamId) => api.delete(`/teams/${teamId}/leave`),
  delete: (teamId) => api.delete(`/teams/${teamId}`),
  getDetails: (teamId) => api.get(`/teams/${teamId}`),
  update: (teamId, teamData) => api.put(`/teams/${teamId}`, teamData),
  invite: (teamId, data) => api.post(`/teams/${teamId}/invite`, data),
  removeMember: (teamId, memberId) => api.delete(`/teams/${teamId}/members/${memberId}`),
  searchUsers: (teamId, params) => api.get(`/teams/${teamId}/search-users`, { params }),
  getJoinRequests: (teamId) => api.get(`/teams/${teamId}/join-requests`),
  approveJoinRequest: (teamId, requestId) => api.post(`/teams/${teamId}/join-requests/${requestId}/approve`),
  rejectJoinRequest: (teamId, requestId) => api.post(`/teams/${teamId}/join-requests/${requestId}/reject`),
  getMyJoinRequests: () => api.get('/teams/my-join-requests'),
  cancelJoinRequest: (requestId) => api.delete(`/teams/join-requests/${requestId}`),
};

// Wallet API
export const walletAPI = {
  getWallet: () => api.get('/wallet'),
  getTransactions: (params) => api.get('/wallet/transactions', { params }),
  addMoney: (data) => api.post('/wallet/add-money', data),
  withdraw: (data) => api.post('/wallet/withdraw', data),
  getPaymentMethods: () => api.get('/wallet/payment-methods'),
  addPaymentMethod: (data) => api.post('/wallet/payment-methods', data),
  getWithdrawals: (params) => api.get('/wallet/withdrawals', { params }),
  // Manual payment methods
  getManualPaymentMethods: () => api.get('/wallet/manual-payment-methods'),
  submitManualPayment: (data) => api.post('/wallet/manual-payment', data),
  getManualPayments: (params) => api.get('/wallet/manual-payments', { params }),
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  updateAvatar: (data) => api.put('/profile/avatar', data),
  getAchievements: () => api.get('/profile/achievements'),
  getMatches: (params) => api.get('/profile/matches', { params }),
  updateSettings: (data) => api.put('/profile/settings', data),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getStats: () => api.get('/notifications/stats'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAsUnread: (id) => api.put(`/notifications/${id}/unread`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
  clearAll: () => api.delete('/notifications/clear-all'),
  handleAction: (id, action) => api.post(`/notifications/${id}/action`, { action }),
  create: (data) => api.post('/notifications/create', data),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentTournaments: () => api.get('/dashboard/recent-tournaments'),
  getUpcomingTournaments: () => api.get('/dashboard/upcoming-tournaments'),
  getMyRegistrations: () => api.get('/dashboard/my-registrations'),
  getActivities: () => api.get('/dashboard/activities'),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;