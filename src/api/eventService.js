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
   * Fetch pending events (Dean only)
   * Returns events with status = 'pending' including faculty info
   */
  async fetchPendingEvents() {
    try {
      const response = await api.get('/events/pending');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching pending events:', error);
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

  /**
   * Get event participants (Faculty only - for their own events)
   * ✅ Returns: Array of participants
   * Backend sends: { success: true, participants: [...] }
   */
  async getEventParticipants(eventId) {
    try {
      if (!eventId) throw new Error('Event ID is required');
      const response = await api.get(`/events/${eventId}/participants`);
      // ✅ Extract participants array from response
      const participants = response.data.participants || [];
      if (!Array.isArray(participants)) {
        throw new Error('Invalid participants format: expected array');
      }
      return participants;
    } catch (error) {
      console.error('Error fetching event participants:', error);
      throw error;
    }
  },

  /**
   * Download event attendance report as CSV
   * Includes registrations data with name, email, phone, department, etc.
   */
  async downloadEventReport(eventId, eventTitle) {
    try {
      // Fetch report data in JSON format
      const response = await api.get(`/events/${eventId}/report?format=json`);
      const { registrations } = response.data.data;

      // Prepare CSV headers
      const headers = ['ID', 'Name', 'Email', 'Phone', 'College Type', 'PRN', 'Department', 'Year', 'Division', 'Registered On'];

      // Prepare CSV rows
      const rows = registrations.map(r => [
        r.id || '',
        r.name || '',
        r.email || '',
        r.phone || '',
        r.college_type || '',
        r.prn || '',
        r.department || '',
        r.year || '',
        r.division || '',
        new Date(r.registered_on).toLocaleString()
      ]);

      // Build CSV content
      const csvContent = [
        ['Event Attendance Report'],
        ['', eventTitle],
        ['Date Generated', new Date().toLocaleString()],
        [''],
        ['Participant Details:'],
        headers,
        ...rows
      ].map(row =>
        row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')
      ).join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `attendance_${eventId}_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      return { success: true, message: 'Report downloaded successfully' };
    } catch (error) {
      console.error('Error downloading event report:', error);
      throw error;
    }
  },

  // Legacy aliases
  getEvents(filters = {}) { return this.getAllEvents(filters); },
  getMyEvents() { return this.getAllEvents(); },
  getEventParticipants(eventId) { return this.getEventRegistrations(eventId); },
};

export default eventService;