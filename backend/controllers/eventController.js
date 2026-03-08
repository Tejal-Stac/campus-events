const pool = require('../config/db')

const getAllEvents = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM events ORDER BY created_at DESC'
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

const getEventById = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM events WHERE id = $1', [req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' })
    }
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

const createEvent = async (req, res) => {
  const {
    title, organisingClub, saVertical, date, day,
    timeFrom, timeTo, venue, onlineLink, targetAudience,
    expectedCount, seats, fees, contact, category,
    keyFeatures, desc, eventType
  } = req.body

  // Validate required fields
  if (!title || !date || !venue) {
    return res.status(400).json({ 
      success: false,
      message: 'Missing required fields',
      required: ['title', 'date', 'venue']
    })
  }

  try {
    const result = await pool.query(
      `INSERT INTO events 
        (title, organising_club, sa_vertical, date, day,
         time_from, time_to, venue, online_link, target_audience,
         expected_count, seats, fees, contact, category,
         key_features, description, event_type, created_by, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,'pending')
       RETURNING *`,
      [
        title, 
        organisingClub || null, 
        saVertical || null, 
        date, 
        day || null,
        timeFrom || null, 
        timeTo || null, 
        venue, 
        onlineLink || null, 
        targetAudience || 'All',
        expectedCount || 0, 
        seats || 100, 
        fees || 'Free', 
        contact || null, 
        category || 'General',
        keyFeatures ? JSON.stringify(keyFeatures.split(',').map(k => k.trim())) : '[]', 
        desc || null,
        eventType || category || 'General',
        req.user.id
      ]
    )

    res.status(201).json({
      success: true,
      message: 'Event submitted for Dean approval!',
      data: result.rows[0]
    })
  } catch (err) {
    // DETAILED ERROR LOGGING for PostgreSQL debugging
    console.error('\n🔴 ===== CREATE EVENT ERROR =====')
    console.error('Error Message:', err.message)
    console.error('Error Code:', err.code)
    console.error('Error Detail:', err.detail)
    console.error('Error Constraint:', err.constraint)
    console.error('Error Table:', err.table)
    console.error('Error Column:', err.column)
    console.error('Full Stack:', err.stack)
    console.error('================================\n')
    
    res.status(500).json({ 
      success: false,
      message: 'Server error creating event', 
      error: err.message,
      code: err.code,
      detail: err.detail,
      hint: err.hint,
      column: err.column
    })
  }
}

const updateEventStatus = async (req, res) => {
  const { status } = req.body

  // Validate status value
  const validStatuses = ['pending', 'approved', 'rejected', 'Active', 'Completed']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      message: 'Invalid status',
      validStatuses 
    })
  }

  try {
    // Check if event exists
    const eventCheck = await pool.query(
      'SELECT id, status, created_by FROM events WHERE id = $1',
      [req.params.id]
    )

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' })
    }

    // Update status
    const result = await pool.query(
      'UPDATE events SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    )

    console.log(`✅ Event ${req.params.id} status updated to '${status}' by user ${req.user.id} (${req.user.role})`)

    res.json({
      success: true,
      message: `Event ${status}!`,
      data: result.rows[0]
    })
  } catch (err) {
    console.error('UPDATE EVENT STATUS ERROR:', err)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

const registerForEvent = async (req, res) => {
  const eventId = req.params.id
  const studentId = req.user.id

  try {
    const existing = await pool.query(
      'SELECT * FROM registrations WHERE event_id = $1 AND student_id = $2',
      [eventId, studentId]
    )
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Already registered for this event' })
    }

    const event = await pool.query('SELECT * FROM events WHERE id = $1', [eventId])
    const registeredCount = await pool.query(
      'SELECT COUNT(*) FROM registrations WHERE event_id = $1', [eventId]
    )
    if (parseInt(registeredCount.rows[0].count) >= event.rows[0].seats) {
      return res.status(400).json({ message: 'Event is fully booked' })
    }

    await pool.query(
      'INSERT INTO registrations (event_id, student_id) VALUES ($1, $2)',
      [eventId, studentId]
    )

    res.json({ success: true, message: 'Successfully registered for event!' })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

const getEventRegistrations = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.first_name, u.last_name, u.email, u.gr_number,
              u.department, u.division, u.campus
       FROM registrations r
       JOIN users u ON r.student_id = u.id
       WHERE r.event_id = $1`,
      [req.params.id]
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

module.exports = {
  getAllEvents, getEventById, createEvent,
  updateEventStatus, registerForEvent, getEventRegistrations
}