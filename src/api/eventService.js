import api from './axiosConfig';

/**
 * Event Service - PostgreSQL Integration
 * All endpoints interact with D: drive PostgreSQL database
 */

export const eventService = {
  /**
   * Fetch all events
   * Optionally filter by category, event_type, and status
   * event_type values: 'National' | 'Intercollege' | 'Intracollege' | 'Department'
   * status values: 'approved' (default), 'pending', 'rejected'
   */
  async getAllEvents(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.category && filters.category !== 'All') {
        params.append('category', filters.category);
      }
      if (filters.event_type && filters.event_type !== 'All') {
        params.append('event_type', filters.event_type);
      }
      // Add status filter - defaults to 'approved' if not specified
      if (filters.status) {
        params.append('status', filters.status);
      }
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await api.get(`/events${query}`);
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
   * Create new event (Coordinator only)
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
   * Update existing event (Faculty/Dean only)
   */
  async updateEvent(eventId, eventData) {
    try {
      const response = await api.put(`/events/${eventId}`, eventData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating event:', error);
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
   * Update event type (Coordinator/Dean only)
   * Valid types: 'National' | 'Intercollege' | 'Intracollege' | 'Department'
   */
  async updateEventType(eventId, event_type) {
    try {
      const response = await api.patch(`/events/${eventId}/event-type`, { event_type });
      return response.data.data;
    } catch (error) {
      console.error('Error updating event type:', error);
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
   * ✅ FIX: now accepts formData from RegistrationModal
   */
  async registerForEvent(eventId, formData = {}) {
    try {
      const response = await api.post(`/events/${eventId}/register`, formData);
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
   * Get coordinator stats
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

  // Legacy aliases
  getEvents(filters = {}) { return this.getAllEvents(filters); },
  getMyEvents() { return this.getAllEvents(); },
  getEventParticipants(eventId) { return this.getEventRegistrations(eventId); },
};

export default eventService;