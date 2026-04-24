const pool = require('../config/db')

const getAllEvents = async (req, res) => {
  try {
    const { category, event_type, status } = req.query
    const eventStatus = status || 'approved'

    let query = `
      SELECT e.*,
             COUNT(DISTINCT r.id)::int as registered_count
       FROM events e
       LEFT JOIN registrations r ON e.id = r.event_id
       WHERE e.status = $1
    `
    const params = [eventStatus]

    if (category && category !== 'All') {
      params.push(category)
      query += ` AND e.category = $${params.length}`
    }
    if (event_type && event_type !== 'All') {
      params.push(event_type)
      query += ` AND e.event_type = $${params.length}`
    }

    query += ` GROUP BY e.id ORDER BY e.created_at DESC`

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

const getEventById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, COUNT(DISTINCT r.id)::int as registered_count
       FROM events e
       LEFT JOIN registrations r ON e.id = r.event_id
       WHERE e.id = $1
       GROUP BY e.id`,
      [req.params.id]
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
    keyFeatures, desc, event_type, allow_external, payment_qr_url
  } = req.body

  if (!title || !date || !venue) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields',
      required: ['title', 'date', 'venue']
    })
  }

  const validEventTypes = ['National', 'Intercollege', 'Intracollege', 'Department']
  const resolvedEventType = validEventTypes.includes(event_type) ? event_type : 'Intracollege'

  try {
    let featuresString = ''
    if (keyFeatures) {
      if (Array.isArray(keyFeatures)) featuresString = keyFeatures.join(', ')
      else if (typeof keyFeatures === 'string') featuresString = keyFeatures
    }
    const featuresArray = featuresString
      ? featuresString.split(',').map(k => k.trim()).filter(k => k)
      : []

    const result = await pool.query(
      `INSERT INTO events
        (title, organising_club, sa_vertical, date, day,
         time_from, time_to, venue, online_link, target_audience,
         expected_count, seats, fees, contact, category,
         key_features, description, event_type, faculty_id, status,
         allow_external, payment_qr_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,'pending',$20,$21)
       RETURNING *`,
      [
        title, organisingClub || null, saVertical || null, date, day || null,
        timeFrom || null, timeTo || null, venue, onlineLink || null,
        targetAudience || 'All', expectedCount || 0, seats || 100,
        fees || 'Free', contact || null, category || 'General',
        JSON.stringify(featuresArray), desc || null, resolvedEventType,
        req.user.id, allow_external || false, payment_qr_url || null
      ]
    )

    res.status(201).json({
      success: true,
      message: 'Event submitted for Dean approval!',
      data: result.rows[0]
    })
  } catch (err) {
    console.error('\n🔴 CREATE EVENT ERROR:', err.message)
    res.status(500).json({ success: false, message: 'Server error creating event', error: err.message })
  }
}

const updateEventStatus = async (req, res) => {
  const { status } = req.body
  const validStatuses = ['pending', 'approved', 'rejected', 'Active', 'Completed']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status', validStatuses })
  }

  try {
    const eventCheck = await pool.query(
      'SELECT id, status FROM events WHERE id = $1', [req.params.id]
    )
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' })
    }

    const result = await pool.query(
      'UPDATE events SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    )
    console.log(`✅ Event ${req.params.id} status updated to '${status}' by user ${req.user.id}`)
    res.json({ success: true, message: `Event ${status}!`, data: result.rows[0] })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

const updateEventType = async (req, res) => {
  const { event_type } = req.body
  const validEventTypes = ['National', 'Intercollege', 'Intracollege', 'Department']

  if (!validEventTypes.includes(event_type)) {
    return res.status(400).json({ success: false, message: 'Invalid event_type', validEventTypes })
  }

  try {
    const eventCheck = await pool.query(
      'SELECT id, faculty_id FROM events WHERE id = $1', [req.params.id]
    )
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' })
    }

    const event = eventCheck.rows[0]
    if (event.faculty_id !== req.user.id && !['admin', 'dean'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' })
    }

    const result = await pool.query(
      'UPDATE events SET event_type = $1 WHERE id = $2 RETURNING *',
      [event_type, req.params.id]
    )
    res.json({ success: true, message: `Event type updated to ${event_type}`, data: result.rows[0] })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

const registerForEvent = async (req, res) => {
  const eventId = req.params.id
  const userId = req.user ? req.user.id : null

  try {
    const eventResult = await pool.query(
      'SELECT id, title, organising_club, seats, fees, date, venue, allow_external FROM events WHERE id = $1',
      [eventId]
    )
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' })
    }
    const event = eventResult.rows[0]

    if (userId) {
      const userResult = await pool.query('SELECT college_type FROM users WHERE id = $1', [userId])
      const userCollegeType = userResult.rows[0]?.college_type || 'guest'
      if (event.allow_external === false && userCollegeType !== 'vitian') {
        return res.status(403).json({ success: false, message: 'This event is for VIT students only' })
      }

      const existing = await pool.query(
        'SELECT * FROM registrations WHERE event_id = $1 AND user_id = $2', [eventId, userId]
      )
      if (existing.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Already registered for this event' })
      }
    }

    const registeredCount = await pool.query(
      'SELECT COUNT(*) FROM registrations WHERE event_id = $1', [eventId]
    )
    if (parseInt(registeredCount.rows[0].count) >= (event.seats || 100)) {
      return res.status(400).json({ success: false, message: 'Event is fully booked' })
    }

    await pool.query(
      `INSERT INTO registrations (event_id, user_id, status) VALUES ($1, $2, 'confirmed')`,
      [eventId, userId]
    )

    console.log(`✅ User ${userId} registered for event ${eventId} (${event.title})`)
    res.json({
      success: true,
      message: 'Successfully registered for event!',
      data: { eventId, eventTitle: event.title }
    })
  } catch (err) {
    console.error('REGISTER FOR EVENT ERROR:', err)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

const getEventRegistrations = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         r.id as registration_id,
         r.registered_at, r.status,
         u.first_name, u.last_name, u.email, u.gr_number,
         u.department, u.division, u.campus,
         u.college_type, u.college_name, u.phone,
         CASE WHEN r.user_id IS NULL THEN true ELSE false END as is_guest
       FROM registrations r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.event_id = $1
       ORDER BY r.registered_at DESC`,
      [req.params.id]
    )
    res.json({ success: true, data: result.rows, count: result.rowCount })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

const getCoordinatorStats = async (req, res) => {
  const userId = req.user.id
  try {
    const eventsResult = await pool.query(
      'SELECT COUNT(*) as count FROM events WHERE faculty_id = $1', [userId]
    )
    const registrationsResult = await pool.query(
      `SELECT COUNT(*) as count FROM registrations r
       JOIN events e ON r.event_id = e.id WHERE e.faculty_id = $1`, [userId]
    )
    const volunteersResult = await pool.query(
      `SELECT COUNT(*) as count FROM users
       WHERE assigned_role = 'volunteer' AND assigned_event_id IN (
         SELECT id FROM events WHERE faculty_id = $1)`, [userId]
    )
    const typeBreakdownResult = await pool.query(
      `SELECT event_type, COUNT(*) as count FROM events
       WHERE faculty_id = $1 GROUP BY event_type ORDER BY count DESC`, [userId]
    )
    const pendingApprovalsResult = await pool.query(
      `SELECT COUNT(*) as count FROM users
       WHERE college_type = 'non_vitian' AND is_approved = false`
    )

    res.json({
      success: true,
      data: {
        eventsCount:           parseInt(eventsResult.rows[0].count),
        registrationsCount:    parseInt(registrationsResult.rows[0].count),
        volunteersCount:       parseInt(volunteersResult.rows[0].count),
        eventTypeBreakdown:    typeBreakdownResult.rows,
        pendingApprovalsCount: parseInt(pendingApprovalsResult.rows[0].count)
      }
    })
  } catch (err) {
    console.error('GET COORDINATOR STATS ERROR:', err.message)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

const getCoordinatorVolunteers = async (req, res) => {
  const userId = req.user.id
  try {
    const result = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.department,
              u.division, u.year, u.assigned_role, u.assigned_event_id,
              e.title as event_title
       FROM users u
       LEFT JOIN events e ON u.assigned_event_id = e.id
       WHERE u.assigned_role = 'volunteer'
       AND u.assigned_event_id IN (SELECT id FROM events WHERE faculty_id = $1)
       ORDER BY u.first_name, u.last_name`,
      [userId]
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    console.error('GET COORDINATOR VOLUNTEERS ERROR:', err.message)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

const getPendingApprovals = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, phone,
              college_name, college_email, department, year, created_at
       FROM users
       WHERE college_type = 'non_vitian' AND is_approved = false
       ORDER BY created_at DESC`
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    console.error('GET PENDING APPROVALS ERROR:', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
}

const approveNonVitian = async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE users SET is_approved = true WHERE id = $1
       RETURNING id, first_name, last_name, email, college_name`,
      [req.params.userId]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    console.log(`✅ Non-VITian approved: ${result.rows[0].email}`)
    res.json({ success: true, message: 'User approved successfully!', data: result.rows[0] })
  } catch (err) {
    console.error('APPROVE USER ERROR:', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
}

const rejectNonVitian = async (req, res) => {
  try {
    const userCheck = await pool.query(
      `SELECT id, first_name, last_name, email, college_type, is_approved
       FROM users WHERE id = $1`,
      [req.params.userId]
    )
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const user = userCheck.rows[0]
    if (user.college_type !== 'non_vitian' || user.is_approved === true) {
      return res.status(400).json({ success: false, message: 'Can only reject pending non-VITian users' })
    }

    await pool.query('DELETE FROM users WHERE id = $1', [req.params.userId])
    console.log(`❌ Non-VITian rejected and removed: ${user.email}`)
    res.json({ success: true, message: 'User rejected and removed successfully.' })
  } catch (err) {
    console.error('REJECT USER ERROR:', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = {
  getAllEvents, getEventById, createEvent,
  updateEventStatus, updateEventType,
  registerForEvent, getEventRegistrations,
  getCoordinatorStats, getCoordinatorVolunteers,
  getPendingApprovals, approveNonVitian, rejectNonVitian
}