import api from './axiosConfig';

/**
 * Dean Service - Dean-specific operations
 */

export const deanService = {
  /**
   * Get all students (Dean only)
   */
  async getStudents() {
    try {
      const response = await api.get('/users/students');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  /**
   * Promote a student to coordinator or volunteer (Dean only)
   */
  async promoteStudent(userId, assignedRole) {
    try {
      const response = await api.put(`/users/${userId}/promote`, {
        assignedRole
      });
      return response.data;
    } catch (error) {
      console.error('Error promoting student:', error);
      throw error;
    }
  },
};

export default deanService;
