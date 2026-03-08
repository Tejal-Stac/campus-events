import api from './axiosConfig';

/**
 * Authentication Service - JWT based
 * Replaces Firebase Authentication
 */

export const authService = {
  /**
   * Register new user
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.data) {
        // Note: token is not returned in new format, handle accordingly
        if (response.data.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
      }
      return response.data.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * Login user
   */
  async login(email, password, role) {
    try {
      const response = await api.post('/auth/login', { email, password, role });
      if (response.data.data) {
        const { token, user } = response.data.data;
        if (token && user) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        }
      }
      return response.data.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  /**
   * Get user role (student, club_head, coordinator, etc.)
   */
  getUserRole() {
    const user = this.getCurrentUser();
    return user?.role || 'student';
  },
};

export default authService;
