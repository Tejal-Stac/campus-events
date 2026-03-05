import api from './axiosConfig';

/**
 * Event Service - Replace Firebase onSnapshot listeners
 * 
 * MIGRATION GUIDE:
 * Firebase: onSnapshot(collection(db, 'events'), (snapshot) => {...})
 * PostgreSQL: eventService.getEvents() with polling or WebSockets
 */

export const eventService = {
  /**
   * Fetch all events (replaces Firebase onSnapshot for events collection)
   * For Students: Display all available events
   */
  async getEvents() {
    try {
      const response = await api.get('/events');
      return response.data; // Array of event objects
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  /**
   * Create new event (Club Heads/Coordinators)
   */
  async createEvent(eventData) {
    try {
      const response = await api.post('/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  /**
   * Register for an event
   * NOTE: Backend needs to be updated to handle transactions
   */
  async registerForEvent(eventId) {
    try {
      const response = await api.post('/events/register', { event_id: eventId });
      return response.data;
    } catch (error) {
      console.error('Error registering for event:', error);
      throw error;
    }
  },

  /**
   * Get participants for a specific event (Club Heads)
   * NOTE: This endpoint needs to be created in backend
   */
  async getEventParticipants(eventId) {
    try {
      const response = await api.get(`/events/${eventId}/participants`);
      return response.data;
    } catch (error) {
      console.error('Error fetching participants:', error);
      throw error;
    }
  },

  /**
   * Get events created by current user (Coordinators)
   * NOTE: This endpoint needs to be created in backend
   */
  async getMyEvents() {
    try {
      const response = await api.get('/events/my-events');
      return response.data;
    } catch (error) {
      console.error('Error fetching my events:', error);
      throw error;
    }
  },
};

export default eventService;
