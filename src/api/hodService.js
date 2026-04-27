import axios from 'axios'

const API = 'http://localhost:5000'

const getToken = () => localStorage.getItem('token')
const headers = () => ({ Authorization: `Bearer ${getToken()}` })

// ── Analytics Endpoints ──

export const fetchHodAnalytics = async () => {
  try {
    const res = await axios.get(`${API}/api/hod/analytics`, { headers: headers() })
    return res.data
  } catch (error) {
    console.error('Error fetching HOD analytics:', error.message)
    throw error
  }
}

// ── Students Endpoints ──

export const fetchHodStudents = async () => {
  try {
    const res = await axios.get(`${API}/api/hod/students`, { headers: headers() })
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
      ? `${API}/api/hod/events?department=${encodeURIComponent(department)}`
      : `${API}/api/hod/events`
    const res = await axios.get(url, { headers: headers() })
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
    const res = await axios.get(`${API}/api/hod/event/${eventId}/stats`, { headers: headers() })
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
    const res = await axios.get(`${API}/api/hod/event/${eventId}/students`, { headers: headers() })
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
