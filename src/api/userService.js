import api from './axiosConfig';

/**
 * User Service - Profile and user-related operations
 */

export const userService = {
  /**
   * Get current user profile
   */
  async getProfile() {
    try {
      const response = await api.get('/users/profile');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  /**
   * Get user's registered events
   * NOTE: This endpoint needs to be created in backend
   */
  async getMyRegistrations() {
    try {
      const response = await api.get('/users/my-registrations');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching registrations:', error);
      throw error;
    }
  },

  /**
   * Get user points
   */
  async getPoints() {
    try {
      const response = await api.get('/users/points');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching points:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  /**
   * Update user role (Coordinator can appoint/remove volunteers)
   */
  async updateUserRole(userId, role, eventId = null) {
    try {
      const response = await api.put('/users/update-role', { userId, role, eventId });
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },
};

export default userService;
