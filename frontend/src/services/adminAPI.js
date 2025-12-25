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

  async getUsers() {
    const response = await fetch(`${this.baseURL}/users`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
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
}

export const adminAPI = new AdminAPI();