const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const auth = require('../middleware/auth')

const isHOD = (req, res, next) => {
  if (req.user.role !== 'hod' && req.user.role !== 'faculty') {
    return res.status(403).json({ success: false, message: 'HOD/Faculty access only' })
  }
  next()
}

// GET /api/hod/dashboard
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

// GET /api/hod/students — only this dept's students
router.get('/students', auth, isHOD, async (req, res) => {
  try {
    const dept = req.user.department
    if (!dept) {
      return res.status(400).json({ success: false, message: 'No department assigned' })
    }

    const result = await pool.query(
      `SELECT id, first_name, last_name, email, department, 
              division, year, gr_number, phone, created_at
       FROM users
       WHERE role = 'student' AND department = $1
       ORDER BY year, first_name, last_name`,
      [dept]
    )

    res.json({
      success: true,
      department: dept,
      total: result.rows.length,
      data: result.rows.map(u => ({
        id: u.id,
        name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
        email: u.email,
        department: u.department,
        division: u.division,
        year: u.year,
        grNumber: u.gr_number,
        phone: u.phone,
        createdAt: u.created_at
      }))
    })
  } catch (err) {
    console.error('HOD STUDENTS ERROR:', err.message)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
})

// GET /api/hod/events — all events with dept-wise participation
router.get('/events', auth, isHOD, async (req, res) => {
  try {
    const dept = req.user.department
    const { filter } = req.query // 'all' or 'mine'

    let eventsQuery
    let params

    if (filter === 'mine') {
      eventsQuery = `
        SELECT e.id, e.title, e.date, e.event_type, e.category, e.venue,
               e.seats, e.status, e.organising_club, e.target_audience,
               COUNT(DISTINCT r.id) AS total_registrations,
               COUNT(DISTINCT CASE WHEN u.department = $1 THEN r.id END) AS dept_registrations
        FROM events e
        LEFT JOIN registrations r ON r.event_id = e.id
        LEFT JOIN users u ON u.id = r.user_id
        WHERE e.faculty_id = $2
        GROUP BY e.id, e.title, e.date, e.event_type, e.category,
                 e.venue, e.seats, e.status, e.organising_club, e.target_audience
        ORDER BY e.date DESC`
      params = [dept, req.user.id]
    } else {
      eventsQuery = `
        SELECT e.id, e.title, e.date, e.event_type, e.category, e.venue,
               e.seats, e.status, e.organising_club, e.target_audience,
               COUNT(DISTINCT r.id) AS total_registrations,
               COUNT(DISTINCT CASE WHEN u.department = $1 THEN r.id END) AS dept_registrations
        FROM events e
        LEFT JOIN registrations r ON r.event_id = e.id
        LEFT JOIN users u ON u.id = r.user_id
        GROUP BY e.id, e.title, e.date, e.event_type, e.category,
                 e.venue, e.seats, e.status, e.organising_club, e.target_audience
        ORDER BY e.date DESC`
      params = [dept]
    }

    const result = await pool.query(eventsQuery, params)

    const events = result.rows.map(e => {
      const total = parseInt(e.total_registrations) || 0
      const deptCount = parseInt(e.dept_registrations) || 0
      const percentage = total > 0 ? Math.round((deptCount / total) * 100) : 0
      return {
        id: e.id,
        title: e.title,
        date: e.date,
        eventType: e.event_type,
        category: e.category,
        venue: e.venue,
        seats: e.seats,
        status: e.status,
        organisingClub: e.organising_club,
        targetAudience: e.target_audience,
        totalRegistrations: total,
        deptRegistrations: deptCount,
        deptParticipationPercent: percentage
      }
    })

    res.json({ success: true, department: dept, data: events })
  } catch (err) {
    console.error('HOD EVENTS ERROR:', err.message)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
})

// GET /api/hod/events/:eventId/participants
router.get('/events/:eventId/participants', auth, isHOD, async (req, res) => {
  try {
    const dept = req.user.department
    const { eventId } = req.params
    const { filter } = req.query // 'all' or 'dept'

    let query, params
    if (filter === 'dept') {
      query = `
        SELECT u.id, u.first_name, u.last_name, u.email, u.department,
               u.division, u.year, u.gr_number, u.phone, u.college_type,
               r.registered_at
        FROM registrations r
        JOIN users u ON u.id = r.user_id
        WHERE r.event_id = $1 AND u.department = $2
        ORDER BY u.first_name`
      params = [eventId, dept]
    } else {
      query = `
        SELECT u.id, u.first_name, u.last_name, u.email, u.department,
               u.division, u.year, u.gr_number, u.phone, u.college_type,
               r.registered_at
        FROM registrations r
        JOIN users u ON u.id = r.user_id
        WHERE r.event_id = $1
        ORDER BY u.department, u.first_name`
      params = [eventId]
    }

    const result = await pool.query(query, params)

    // Department-wise breakdown
    const deptBreakdown = {}
    result.rows.forEach(p => {
      const d = p.department || 'Unknown'
      deptBreakdown[d] = (deptBreakdown[d] || 0) + 1
    })

    const total = result.rows.length
    const breakdown = Object.entries(deptBreakdown)
      .map(([department, count]) => ({
        department,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        isMyDept: department === dept
      }))
      .sort((a, b) => b.count - a.count)

    res.json({
      success: true,
      eventId: parseInt(eventId),
      department: dept,
      totalParticipants: total,
      deptBreakdown: breakdown,
      myDeptCount: deptBreakdown[dept] || 0,
      myDeptPercent: total > 0 ? Math.round(((deptBreakdown[dept] || 0) / total) * 100) : 0,
      participants: result.rows.map(u => ({
        id: u.id,
        name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
        email: u.email,
        department: u.department,
        division: u.division,
        year: u.year,
        grNumber: u.gr_number,
        phone: u.phone,
        collegeType: u.college_type,
        registeredAt: u.registered_at,
        isMyDept: u.department === dept
      }))
    })
  } catch (err) {
    console.error('HOD PARTICIPANTS ERROR:', err.message)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
})

module.exports = router