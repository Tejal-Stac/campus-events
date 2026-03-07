const pool = require('../config/db')

const getAllEvents = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM events ORDER BY created_at DESC'
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const getEventById = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM events WHERE id = $1', [req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' })
    }
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const createEvent = async (req, res) => {
  const {
    title, organisingClub, saVertical, date, day,
    timeFrom, timeTo, venue, onlineLink, targetAudience,
    expectedCount, seats, fees, contact, category,
    keyFeatures, description
  } = req.body

  try {
    const result = await pool.query(
      `INSERT INTO events 
        (title, organising_club, sa_vertical, date, day,
         time_from, time_to, venue, online_link, target_audience,
         expected_count, seats, fees, contact, category,
         key_features, description, faculty_id, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,'pending')
       RETURNING *`,
      [title, organisingClub, saVertical, date, day,
       timeFrom, timeTo, venue, onlineLink, targetAudience,
       expectedCount, seats, fees, contact, category,
       JSON.stringify(keyFeatures || []), description, req.user.id]
    )

    res.status(201).json({
      message: 'Event submitted for Dean approval!',
      event: result.rows[0]
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const updateEventStatus = async (req, res) => {
  const { status } = req.body

  try {
    const result = await pool.query(
      'UPDATE events SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    )
    res.json({
      message: 'Event ' + status + '!',
      event: result.rows[0]
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
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

    res.json({ message: 'Successfully registered for event!' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
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
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = {
  getAllEvents, getEventById, createEvent,
  updateEventStatus, registerForEvent, getEventRegistrations
}