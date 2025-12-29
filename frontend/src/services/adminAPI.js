const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class AdminAPI {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/admin`;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async login(credentials) {
    const response = await fetch(`${this.baseURL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  }

  async getStats() {
    const response = await fetch(`${this.baseURL}/stats`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }

    return response.json();
  }

  async getTournaments() {
    const response = await fetch(`${this.baseURL}/tournaments`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tournaments');
    }

    return response.json();
  }

  async createTournament(tournament) {
    const response = await fetch(`${this.baseURL}/tournaments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(tournament)
    });

    if (!response.ok) {
      throw new Error('Failed to create tournament');
    }

    return response.json();
  }

  async updateTournamentStatus(id, status) {
    const response = await fetch(`${this.baseURL}/tournaments/${id}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error('Failed to update tournament status');
    }

    return response.json();
  }

  async deleteTournament(id) {
    const response = await fetch(`${this.baseURL}/tournaments/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete tournament');
    }

    return response.json();
  }

  // Tournament Admin Panel APIs
  async getTournamentDetails(id) {
    const response = await fetch(`${this.baseURL}/tournaments/${id}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tournament details');
    }

    return response.json();
  }

  async getTournamentTeams(id) {
    const response = await fetch(`${this.baseURL}/tournaments/${id}/teams`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tournament teams');
    }

    return response.json();
  }

  async getTournamentMatches(id) {
    const response = await fetch(`${this.baseURL}/tournaments/${id}/matches`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tournament matches');
    }

    return response.json();
  }

  async getTournamentLeaderboard(id) {
    const response = await fetch(`${this.baseURL}/tournaments/${id}/leaderboard`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tournament leaderboard');
    }

    return response.json();
  }

  async createTournamentMatch(tournamentId, matchData) {
    const response = await fetch(`${this.baseURL}/tournaments/${tournamentId}/matches`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(matchData)
    });

    if (!response.ok) {
      throw new Error('Failed to create match');
    }

    return response.json();
  }

  async updateTournamentRoomDetails(tournamentId, roomDetails) {
    const response = await fetch(`${this.baseURL}/tournaments/${tournamentId}/room-details`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(roomDetails)
    });

    if (!response.ok) {
      throw new Error('Failed to update room details');
    }

    return response.json();
  }

  async startTournamentMatch(tournamentId, roomDetails) {
    const response = await fetch(`${this.baseURL}/tournaments/${tournamentId}/start-match`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(roomDetails)
    });

    if (!response.ok) {
      throw new Error('Failed to start tournament match');
    }

    return response.json();
  }

  async updateTeamStatus(teamId, status) {
    const response = await fetch(`${this.baseURL}/teams/${teamId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error('Failed to update team status');
    }

    return response.json();
  }

  async sendTournamentAnnouncement(tournamentId, announcement) {
    const response = await fetch(`${this.baseURL}/tournaments/${tournamentId}/announcements`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(announcement)
    });

    if (!response.ok) {
      throw new Error('Failed to send announcement');
    }

    return response.json();
  }

  // User Management APIs
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/users?${queryString}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  }

  async getUserDetails(id) {
    const response = await fetch(`${this.baseURL}/users/${id}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user details');
    }

    return response.json();
  }

  async updateUserBanStatus(id, is_banned, ban_reason = '') {
    const response = await fetch(`${this.baseURL}/users/${id}/ban-status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ is_banned, ban_reason })
    });

    if (!response.ok) {
      throw new Error('Failed to update user ban status');
    }

    return response.json();
  }

  async resetUserPassword(id, newPassword) {
    const response = await fetch(`${this.baseURL}/users/${id}/reset-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ newPassword })
    });

    if (!response.ok) {
      throw new Error('Failed to reset user password');
    }

    return response.json();
  }

  async updateUserWallet(id, action, amount, reason = '') {
    const response = await fetch(`${this.baseURL}/users/${id}/wallet`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ action, amount, reason })
    });

    if (!response.ok) {
      throw new Error('Failed to update user wallet');
    }

    return response.json();
  }

  async deleteUser(id, reason = '') {
    const response = await fetch(`${this.baseURL}/users/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ reason })
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }

    return response.json();
  }

  async sendUserNotification(id, title, message, type = 'admin') {
    const response = await fetch(`${this.baseURL}/users/${id}/notifications`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ title, message, type })
    });

    if (!response.ok) {
      throw new Error('Failed to send notification');
    }

    return response.json();
  }

  async performBulkUserOperation(operation, userIds, data = {}) {
    const response = await fetch(`${this.baseURL}/users/bulk-operations`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ operation, userIds, data })
    });

    if (!response.ok) {
      throw new Error('Failed to perform bulk operation');
    }

    return response.json();
  }

  async getUserStatistics() {
    const response = await fetch(`${this.baseURL}/users/statistics`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user statistics');
    }

    return response.json();
  }

  async getTeams() {
    const response = await fetch(`${this.baseURL}/teams`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch teams');
    }

    return response.json();
  }

  async getTeamDetails(id) {
    const response = await fetch(`${this.baseURL}/teams/${id}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch team details');
    }

    return response.json();
  }

  async dissolveTeam(id) {
    const response = await fetch(`${this.baseURL}/teams/${id}/dissolve`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to dissolve team');
    }

    return response.json();
  }

  async removeTeamMember(teamId, userId) {
    const response = await fetch(`${this.baseURL}/teams/${teamId}/members/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to remove team member');
    }

    return response.json();
  }

  async updateTeamStatus(id, status) {
    const response = await fetch(`${this.baseURL}/teams/${id}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error('Failed to update team status');
    }

    return response.json();
  }

  async bulkDissolveTeams(teamIds) {
    const response = await fetch(`${this.baseURL}/teams/bulk-dissolve`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ teamIds })
    });

    if (!response.ok) {
      throw new Error('Failed to dissolve teams');
    }

    return response.json();
  }

  // Manual Payment Management
  async getManualPayments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/manual-payments?${queryString}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch manual payments');
    }

    return response.json();
  }

  async verifyManualPayment(id, status, adminNotes = '') {
    const response = await fetch(`${this.baseURL}/manual-payments/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status, adminNotes })
    });

    if (!response.ok) {
      throw new Error('Failed to update payment status');
    }

    return response.json();
  }

  async getManualPaymentMethods() {
    const response = await fetch(`${this.baseURL}/manual-payment-methods`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment methods');
    }

    return response.json();
  }

  async updateManualPaymentMethod(id, data) {
    const response = await fetch(`${this.baseURL}/manual-payment-methods/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to update payment method');
    }

    return response.json();
  }

  // Wallet Management APIs
  async getTournamentWalletStatus(tournamentId) {
    const response = await fetch(`${this.baseURL}/tournaments/${tournamentId}/wallet-status`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch wallet status');
    }

    return response.json();
  }

  async collectTournamentFees(tournamentId) {
    const response = await fetch(`${this.baseURL}/tournaments/${tournamentId}/collect-fees`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to collect tournament fees');
    }

    return response.json();
  }

  async distributeTournamentPrizes(tournamentId, results) {
    const response = await fetch(`${this.baseURL}/tournaments/${tournamentId}/distribute-prizes`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ results })
    });

    if (!response.ok) {
      throw new Error('Failed to distribute prizes');
    }

    return response.json();
  }

  async getAdminProfits() {
    const response = await fetch(`${this.baseURL}/admin-profits`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch admin profits');
    }

    return response.json();
  }

  // Tournament Registration Management
  async getTournamentRegistrationStats(tournamentId) {
    const response = await fetch(`${this.baseURL}/tournaments/${tournamentId}/registration-stats`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch registration stats');
    }

    return response.json();
  }

  async performBulkOperation(tournamentId, operation, data = {}) {
    const response = await fetch(`${this.baseURL}/tournaments/${tournamentId}/bulk-operations`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ operation, data })
    });

    if (!response.ok) {
      throw new Error('Failed to perform bulk operation');
    }

    return response.json();
  }

  // Reward Management APIs
  async getRedeemableRewards() {
    const response = await fetch(`${this.baseURL}/rewards`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch rewards');
    }

    return response.json();
  }

  async createReward(data) {
    const response = await fetch(`${this.baseURL}/rewards`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to create reward');
    }

    return response.json();
  }

  async updateReward(id, data) {
    const response = await fetch(`${this.baseURL}/rewards/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to update reward');
    }

    return response.json();
  }

  async deleteReward(id) {
    const response = await fetch(`${this.baseURL}/rewards/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete reward');
    }

    return response.json();
  }

  async getAchievements() {
    const response = await fetch(`${this.baseURL}/achievements`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch achievements');
    }

    return response.json();
  }

  async createAchievement(data) {
    const response = await fetch(`${this.baseURL}/achievements`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to create achievement');
    }

    return response.json();
  }

  async updateAchievement(id, data) {
    const response = await fetch(`${this.baseURL}/achievements/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to update achievement');
    }

    return response.json();
  }

  async deleteAchievement(id) {
    const response = await fetch(`${this.baseURL}/achievements/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete achievement');
    }

    return response.json();
  }

  async getChallenges() {
    const response = await fetch(`${this.baseURL}/challenges`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch challenges');
    }

    return response.json();
  }

  async createChallenge(data) {
    const response = await fetch(`${this.baseURL}/challenges`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to create challenge');
    }

    return response.json();
  }

  async updateChallenge(id, data) {
    const response = await fetch(`${this.baseURL}/challenges/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to update challenge');
    }

    return response.json();
  }

  async deleteChallenge(id) {
    const response = await fetch(`${this.baseURL}/challenges/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete challenge');
    }

    return response.json();
  }

  async getUserRewards() {
    const response = await fetch(`${this.baseURL}/user-rewards`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user rewards');
    }

    return response.json();
  }
}

export const adminAPI = new AdminAPI();