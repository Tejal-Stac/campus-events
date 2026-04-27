const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const auth = require('../middleware/auth')
const { getHodStudents, getHodEvents, getHodAnalytics, getEventStats, getEventStudentList } = require('../controllers/hodController')

const isHOD = (req, res, next) => {
  if (req.user.role !== 'hod' && req.user.role !== 'faculty') {
    return res.status(403).json({ success: false, message: 'HOD/Faculty access only' })
  }
  next()
}

// GET /api/hod/students
router.get('/students', auth, isHOD, getHodStudents)

// GET /api/hod/events
router.get('/events', auth, isHOD, getHodEvents)

// GET /api/hod/analytics
router.get('/analytics', auth, isHOD, getHodAnalytics)

// GET /api/hod/event/:id/stats - Department comparison and breakdown
router.get('/event/:id/stats', auth, isHOD, getEventStats)

// GET /api/hod/event/:id/students - Students from HOD's department
router.get('/event/:id/students', auth, isHOD, getEventStudentList)

// Legacy dashboard endpoint (deprecated but kept for compatibility)
router.get('/dashboard', auth, isHOD, async (req, res) => {
  try {
    const dept = req.user.department
    if (!dept) {
      return res.status(400).json({ success: false, message: 'No department assigned to your profile. Please update your profile.' })
    }

    // Total students in this department
    const studentsResult = await pool.query(
      `SELECT COUNT(*) AS total FROM users 
       WHERE role = 'student' AND department = $1`,
      [dept]
    )

    // Total events created by this HOD/faculty
    const eventsResult = await pool.query(
      `SELECT COUNT(*) AS total FROM events WHERE faculty_id = $1`,
      [req.user.id]
    )

    // Total registrations by students of this department across all events
    const regResult = await pool.query(
      `SELECT COUNT(r.id) AS total
       FROM registrations r
       JOIN users u ON u.id = r.user_id
       WHERE u.department = $1`,
      [dept]
    )

    // Top 5 events by dept student participation
    const topEvents = await pool.query(
      `SELECT e.id, e.title, e.date, e.event_type, e.category, e.seats,
              COUNT(r.id) AS dept_registrations
       FROM events e
       JOIN registrations r ON r.event_id = e.id
       JOIN users u ON u.id = r.user_id
       WHERE u.department = $1
       GROUP BY e.id, e.title, e.date, e.event_type, e.category, e.seats
       ORDER BY dept_registrations DESC
       LIMIT 5`,
      [dept]
    )

    // Year-wise student breakdown
    const yearBreakdown = await pool.query(
      `SELECT year, COUNT(*) AS count 
       FROM users 
       WHERE role = 'student' AND department = $1 AND year IS NOT NULL
       GROUP BY year ORDER BY year`,
      [dept]
    )

    res.json({
      success: true,
      department: dept,
      data: {
        totalStudents: parseInt(studentsResult.rows[0].total),
        totalEvents: parseInt(eventsResult.rows[0].total),
        totalRegistrations: parseInt(regResult.rows[0].total),
        topEvents: topEvents.rows,
        yearBreakdown: yearBreakdown.rows
      }
    })
  } catch (err) {
    console.error('HOD DASHBOARD ERROR:', err.message)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
})

module.exports = router