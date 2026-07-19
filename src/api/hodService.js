import api from './axiosConfig';

// ── Analytics Endpoints ──

export const fetchHodAnalytics = async () => {
  try {
    // Uses 'api' custom instance; base URL and Auth headers are added automatically!
    const res = await api.get('/hod/analytics')
    return res.data
  } catch (error) {
    console.error('Error fetching HOD analytics:', error.message)
    throw error
  }
}

// ── Students Endpoints ──

export const fetchHodStudents = async () => {
  try {
    const res = await api.get('/hod/students')
    return res.data
  } catch (error) {
    console.error('Error fetching HOD students:', error.message)
    throw error
  }
}

// ── Events Endpoints ──

export const fetchHodEvents = async (department = null) => {
  try {
    const url = department && department !== 'All'
      ? `/hod/events?department=${encodeURIComponent(department)}`
      : '/hod/events'
    const res = await api.get(url)
    return res.data
  } catch (error) {
    console.error('Error fetching HOD events:', error.message)
    throw error
  }
}

// ── Event Stats Endpoints ──

/**
 * Fetch department comparison and aggregated stats for a specific event
 * Returns: comparison data, department breakdown, HOD dept performance
 */
export const fetchEventStats = async (eventId) => {
  try {
    const res = await api.get(`/hod/event/${eventId}/stats`)
    return res.data
  } catch (error) {
    console.error('Error fetching event stats:', error.message)
    throw error
  }
}

/**
 * Fetch detailed student list from HOD's department for a specific event
 * Returns: list of students with registration dates
 */
export const fetchEventStudentList = async (eventId) => {
  try {
    const res = await api.get(`/hod/event/${eventId}/students`)
    return res.data
  } catch (error) {
    console.error('Error fetching event student list:', error.message)
    throw error
  }
}

export default {
  fetchHodAnalytics,
  fetchHodStudents,
  fetchHodEvents,
  fetchEventStats,
  fetchEventStudentList
}