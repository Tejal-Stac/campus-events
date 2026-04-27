// ============================================================
// FILE: backend/controllers/hodController.js
// ============================================================

const pool = require('../config/db')

// GET /api/hod/students
// Returns only students from HOD's department
const getHodStudents = async (req, res) => {
  try {
    const hodDept = req.user.department
    if (!hodDept) {
      return res.status(400).json({ success: false, message: 'HOD department not found in token' })
    }

    const result = await pool.query(
      `SELECT id, first_name, last_name, email, department, campus,
              year, gr_number, division, phone, assigned_role,
              college_type, created_at
       FROM users
       WHERE role = 'student'
         AND LOWER(department) = LOWER($1)
       ORDER BY first_name`,
      [hodDept]
    )

    res.json({
      success: true,
      department: hodDept,
      total: result.rows.length,
      data: result.rows
    })
  } catch (err) {
    console.error('HOD STUDENTS ERROR:', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/hod/events?department=CS
// Returns events with department participation stats
const getHodEvents = async (req, res) => {
  try {
    const hodDept = req.user.department
    const filterDept = req.query.department || null

    // Get all approved events
    const eventsResult = await pool.query(
      `SELECT e.id, e.title, e.date, e.venue, e.organising_club,
              e.target_audience, e.seats, e.status,
              COUNT(DISTINCT r.id) AS total_registered
       FROM events e
       LEFT JOIN registrations r ON r.event_id = e.id
       WHERE e.status = 'approved'
       GROUP BY e.id
       ORDER BY e.date DESC`
    )

    const events = eventsResult.rows

    // For each event, get department-wise stats
    const eventsWithStats = await Promise.all(events.map(async (event) => {
      const deptStats = await pool.query(
        `SELECT u.department,
                COUNT(*) AS count
         FROM registrations r
         JOIN users u ON u.id = r.user_id
         WHERE r.event_id = $1
           AND u.department IS NOT NULL
         GROUP BY u.department
         ORDER BY count DESC`,
        [event.id]
      )

      const total = parseInt(event.total_registered) || 0
      const departmentStats = deptStats.rows.map(d => ({
        department: d.department,
        count: parseInt(d.count),
        percentage: total > 0 ? Math.round((parseInt(d.count) / total) * 100) : 0
      }))

      // HOD's department stat specifically
      const myDeptStat = departmentStats.find(
        d => d.department?.toLowerCase() === hodDept?.toLowerCase()
      ) || { department: hodDept, count: 0, percentage: 0 }

      return {
        ...event,
        total_registered: total,
        departmentStats,
        myDepartmentStat: myDeptStat
      }
    }))

    // If department filter provided, filter events where that dept participated
    let finalEvents = eventsWithStats
    if (filterDept && filterDept !== 'All') {
      finalEvents = eventsWithStats.filter(e =>
        e.departmentStats.some(d => d.department?.toLowerCase() === filterDept.toLowerCase())
      )
    }

    res.json({
      success: true,
      hodDepartment: hodDept,
      total: finalEvents.length,
      data: finalEvents
    })
  } catch (err) {
    console.error('HOD EVENTS ERROR:', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/hod/analytics
// Returns full analytics for HOD's department
const getHodAnalytics = async (req, res) => {
  try {
    const hodDept = req.user.department

    // Total students in department
    const totalStudentsRes = await pool.query(
      `SELECT COUNT(*) as total FROM users
       WHERE role = 'student' AND LOWER(department) = LOWER($1)`,
      [hodDept]
    )
    const totalStudents = parseInt(totalStudentsRes.rows[0].total)

    // Students who participated in at least 1 event
    const participatedRes = await pool.query(
      `SELECT COUNT(DISTINCT u.id) as participated
       FROM users u
       JOIN registrations r ON r.user_id = u.id
       WHERE u.role = 'student' AND LOWER(u.department) = LOWER($1)`,
      [hodDept]
    )
    const participated = parseInt(participatedRes.rows[0].participated)

    // Monthly participation trend (last 6 months)
    const monthlyRes = await pool.query(
      `SELECT TO_CHAR(r.registered_at, 'Mon YYYY') AS month,
              TO_CHAR(r.registered_at, 'YYYY-MM') AS month_key,
              COUNT(*) AS count
       FROM registrations r
       JOIN users u ON u.id = r.user_id
       WHERE u.role = 'student'
         AND LOWER(u.department) = LOWER($1)
         AND r.registered_at >= NOW() - INTERVAL '6 months'
       GROUP BY month, month_key
       ORDER BY month_key`,
      [hodDept]
    )

    // Event-wise participation for HOD's dept (top 8 events)
    const eventWiseRes = await pool.query(
      `SELECT e.title, COUNT(r.id) AS count
       FROM registrations r
       JOIN users u ON u.id = r.user_id
       JOIN events e ON e.id = r.event_id
       WHERE u.role = 'student'
         AND LOWER(u.department) = LOWER($1)
       GROUP BY e.id, e.title
       ORDER BY count DESC
       LIMIT 8`,
      [hodDept]
    )

    // Coordinators & volunteers from this dept
    const coordinatorsRes = await pool.query(
      `SELECT COUNT(*) as count FROM users
       WHERE assigned_role = 'coordinator'
         AND LOWER(department) = LOWER($1)`,
      [hodDept]
    )
    const volunteersRes = await pool.query(
      `SELECT COUNT(*) as count FROM users
       WHERE assigned_role = 'volunteer'
         AND LOWER(department) = LOWER($1)`,
      [hodDept]
    )

    const participationRate = totalStudents > 0
      ? Math.round((participated / totalStudents) * 100)
      : 0

    res.json({
      success: true,
      department: hodDept,
      summary: {
        totalStudents,
        participated,
        inactive: totalStudents - participated,
        participationRate,
        coordinators: parseInt(coordinatorsRes.rows[0].count),
        volunteers: parseInt(volunteersRes.rows[0].count)
      },
      monthlyTrend: monthlyRes.rows,
      eventWise: eventWiseRes.rows.map(e => ({
        title: e.title,
        count: parseInt(e.count)
      }))
    })
  } catch (err) {
    console.error('HOD ANALYTICS ERROR:', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/hod/event/:id/stats
// Returns detailed stats for a specific event (department comparison)
const getEventStats = async (req, res) => {
  try {
    const { id } = req.params
    const hodDept = req.user.department

    const eventRes = await pool.query(
      `SELECT e.*, COUNT(DISTINCT r.id) AS total_registered
       FROM events e
       LEFT JOIN registrations r ON r.event_id = e.id
       WHERE e.id = $1
       GROUP BY e.id`,
      [id]
    )
    if (eventRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' })
    }

    const event = eventRes.rows[0]
    const total = parseInt(event.total_registered) || 0

    // ── Department-wise breakdown ──
    const deptStats = await pool.query(
      `SELECT u.department, COUNT(*) AS count
       FROM registrations r
       JOIN users u ON u.id = r.user_id
       WHERE r.event_id = $1 AND u.department IS NOT NULL
       GROUP BY u.department
       ORDER BY count DESC`,
      [id]
    )

    // ── HOD's department comparison ──
    const hodDeptRes = await pool.query(
      `SELECT COUNT(*) AS count FROM registrations r
       JOIN users u ON u.id = r.user_id
       WHERE r.event_id = $1 AND LOWER(u.department) = LOWER($2)`,
      [id, hodDept]
    )
    const hodDeptCount = parseInt(hodDeptRes.rows[0].count) || 0
    const otherDeptCount = total - hodDeptCount

    res.json({
      success: true,
      eventId: parseInt(id),
      eventName: event.title,
      totalRegistered: total,
      venue: event.venue,
      date: event.date,
      hodDepartment: hodDept,
      comparison: {
        myDepartment: {
          name: hodDept,
          count: hodDeptCount,
          percentage: total > 0 ? Math.round((hodDeptCount / total) * 100) : 0
        },
        otherDepartments: {
          count: otherDeptCount,
          percentage: total > 0 ? Math.round((otherDeptCount / total) * 100) : 0
        }
      },
      departmentStats: deptStats.rows.map(d => ({
        department: d.department,
        count: parseInt(d.count),
        percentage: total > 0 ? Math.round((parseInt(d.count) / total) * 100) : 0,
        isMine: d.department?.toLowerCase() === hodDept?.toLowerCase()
      }))
    })
  } catch (err) {
    console.error('EVENT STATS ERROR:', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/hod/event/:id/students
// Returns students from HOD's department who registered for this event
const getEventStudentList = async (req, res) => {
  try {
    const { id } = req.params
    const hodDept = req.user.department

    if (!hodDept) {
      return res.status(400).json({ success: false, message: 'HOD department not found in token' })
    }

    // Fetch students from HOD's dept who registered for this event
    const result = await pool.query(
      `SELECT 
         u.id, u.first_name, u.last_name, u.email, u.gr_number, 
         u.department, u.year, u.division, u.phone,
         r.registered_at
       FROM registrations r
       JOIN users u ON u.id = r.user_id
       WHERE r.event_id = $1 AND LOWER(u.department) = LOWER($2)
       ORDER BY r.registered_at DESC`,
      [id, hodDept]
    )

    res.json({
      success: true,
      eventId: parseInt(id),
      hodDepartment: hodDept,
      studentCount: result.rows.length,
      students: result.rows.map(u => ({
        id: u.id,
        name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
        email: u.email,
        prn: u.gr_number,
        year: u.year,
        division: u.division,
        department: u.department,
        phone: u.phone,
        registeredAt: u.registered_at
      }))
    })
  } catch (err) {
    console.error('EVENT STUDENTS ERROR:', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { getHodStudents, getHodEvents, getHodAnalytics, getEventStats, getEventStudentList }


// ============================================================
// FILE: backend/routes/hodRoutes.js
// ============================================================
/*
const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middleware/auth')
const { getHodStudents, getHodEvents, getHodAnalytics, getEventStats } = require('../controllers/hodController')

// All HOD routes require authentication
router.use(authenticateToken)

router.get('/students',         getHodStudents)
router.get('/events',           getHodEvents)
router.get('/analytics',        getHodAnalytics)
router.get('/event/:id/stats',  getEventStats)

module.exports = router
*/

// ============================================================
// ADD THIS TO: backend/server.js  (or app.js / index.js)
// ============================================================
/*
const hodRoutes = require('./routes/hodRoutes')
app.use('/api/hod', hodRoutes)
*/