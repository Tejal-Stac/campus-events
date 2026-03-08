import api from './axiosConfig';

/**
 * Event Service - PostgreSQL Integration
 * All endpoints interact with D: drive PostgreSQL database
 */

export const eventService = {
  /**
   * Fetch all events
   * Returns all events regardless of status (use filtering on frontend)
   */
  async getAllEvents() {
    try {
      const response = await api.get('/events');
      return response.data;
    } catch (error) {
      console.error('Error fetching all events:', error);
      throw error;
    }
  },

  /**
   * Get single event by ID
   */
  async getEventById(eventId) {
    try {
      const response = await api.get(`/events/${eventId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },

  /**
   * Create new event (Faculty/Dean only)
   * Automatically sets status='pending' and created_by=current user
   */
  async createEvent(eventData) {
    try {
      const response = await api.post('/events', eventData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  /**
   * Update event status (Dean ONLY)
   * Valid statuses: 'pending', 'approved', 'rejected', 'Active', 'Completed'
   */
  async updateEventStatus(eventId, status) {
    try {
      const response = await api.put(`/events/${eventId}/status`, { status });
      return response.data.data;
    } catch (error) {
      console.error('Error updating event status:', error);
      throw error;
    }
  },

  /**
   * Approve event (Dean only shortcut)
   */
  async approveEvent(eventId) {
    return this.updateEventStatus(eventId, 'approved');
  },

  /**
   * Reject event (Dean only shortcut)
   */
  async rejectEvent(eventId) {
    return this.updateEventStatus(eventId, 'rejected');
  },

  /**
   * Register for an event (Students only)
   */
  async registerForEvent(eventId) {
    try {
      const response = await api.post(`/events/${eventId}/register`);
      return response.data;
    } catch (error) {
      console.error('Error registering for event:', error);
      throw error;
    }
  },

  /**
   * Get event registrations/participants
   */
  async getEventRegistrations(eventId) {
    try {
      const response = await api.get(`/events/${eventId}/registrations`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching event registrations:', error);
      throw error;
    }
  },

  /**
   * Get coordinator stats (events, registrations, volunteers)
   */
  async getCoordinatorStats() {
    try {
      const response = await api.get('/events/coordinator/stats');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching coordinator stats:', error);
      throw error;
    }
  },

  /**
   * Get coordinator's volunteers
   */
  async getCoordinatorVolunteers() {
    try {
      const response = await api.get('/events/coordinator/volunteers');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching coordinator volunteers:', error);
      throw error;
    }
  },

  // Legacy alias for backward compatibility
  getEvents() {
    return this.getAllEvents();
  },

  // Legacy alias
  getMyEvents() {
    return this.getAllEvents();
  },

  // Legacy alias
  getEventParticipants(eventId) {
    return this.getEventRegistrations(eventId);
  },
};

export default eventService;
