const pool = require('../config/db')

const getAllEvents = async (req, res) => {
  try {
    const { category, event_type, status } = req.query
    const isClubPresident = req.user?.role === 'club_president'

    let query = `
      SELECT e.id, e.title, e.organising_club, e.sa_vertical, e.date, e.day,
             e.time_from, e.time_to, e.venue, e.online_link, e.target_audience,
             e.expected_count, e.seats, e.fees, e.contact, e.category,
             e.key_features, e.description, e.faculty_id, e.status, e.created_at,
             e.event_type, e.allow_external, e.payment_qr_url,
             COUNT(DISTINCT r.id)::int as registered_count
       FROM events e
       LEFT JOIN registrations r ON e.id = r.event_id
       WHERE 1=1
    `
    const params = []

    if (isClubPresident) {
      params.push(req.user.id)
      query += ` AND e.faculty_id = $${params.length}`
      if (status) {
        params.push(status)
        query += ` AND e.status = $${params.length}`
      }
    } else {
      params.push('approved')
      query += ` AND e.status = $${params.length}`
    }

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
    console.error('GET ALL EVENTS ERROR:', err.message)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

const getPendingEvents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.id, e.title, e.description, e.date, e.venue, e.category,
              e.event_type, e.status, e.created_at, e.seats, e.fees,
              u.first_name as faculty_first_name,
              u.last_name as faculty_last_name,
              u.email as faculty_email,
              COUNT(DISTINCT r.id)::int as registered_count
       FROM events e
       LEFT JOIN users u ON e.faculty_id = u.id
       LEFT JOIN registrations r ON e.id = r.event_id
       WHERE e.status = 'pending'
       GROUP BY e.id, u.id
       ORDER BY e.created_at DESC`
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    console.error('GET PENDING EVENTS ERROR:', err.message)
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
      message: 'Missing required fields: title, date, venue'
    })
  }

  const validEventTypes = ['National', 'Intercollege', 'Intracollege', 'Department']
  const resolvedEventType = validEventTypes.includes(event_type) ? event_type : 'Intracollege'

  try {
    let featuresArray = []
    if (keyFeatures) {
      if (Array.isArray(keyFeatures)) featuresArray = keyFeatures
      else if (typeof keyFeatures === 'string') {
        featuresArray = keyFeatures.split(',').map(k => k.trim()).filter(k => k)
      }
    }

    const result = await pool.query(
      `INSERT INTO events
        (title, organising_club, sa_vertical, date, day,
         time_from, time_to, venue, online_link, target_audience,
         expected_count, seats, fees, contact, category,
         key_features, description, event_type, faculty_id, status,
         allow_external, payment_qr_url)
       VALUES
        ($1, $2, $3, $4, $5,
         $6, $7, $8, $9, $10,
         $11, $12, $13, $14, $15,
         $16, $17, $18, $19, 'pending',
         $20, $21)
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

    console.log(`✅ Event created: "${title}" by user ${req.user.id} (${req.user.role}) - Status: pending`)
    res.status(201).json({
      success: true,
      message: 'Event submitted for approval!',
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
    const eventCheck = await pool.query('SELECT id FROM events WHERE id = $1', [req.params.id])
    if (eventCheck.rows.length === 0) return res.status(404).json({ message: 'Event not found' })

    const result = await pool.query(
      'UPDATE events SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    )
    console.log(`⚙️ Event ${req.params.id} -> '${status}' by user ${req.user.id}`)
    res.json({ success: true, message: `Event ${status}!`, data: result.rows[0] })
  } catch (err) {
    console.error('UPDATE EVENT STATUS ERROR:', err.message)
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
    const eventCheck = await pool.query('SELECT id, faculty_id FROM events WHERE id = $1', [req.params.id])
    if (eventCheck.rows.length === 0) return res.status(404).json({ success: false, message: 'Event not found' })
    const event = eventCheck.rows[0]
    if (event.faculty_id !== req.user.id && !['admin', 'dean'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' })
    }
    const result = await pool.query(
      'UPDATE events SET event_type = $1 WHERE id = $2 RETURNING *',
      [event_type, req.params.id]
    )
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

// ✅ FIXED: matches your actual registrations table columns
// reg_name, reg_department, reg_division, reg_year, reg_gr_number,
// reg_prn, reg_phone, reg_college_name, receipt_image_url, verification_status
const registerForEvent = async (req, res) => {
  const eventId = req.params.id
  const userId = req.user ? req.user.id : null

  const {
    receipt_image_url,
    transaction_id,
    verification_status,
    reg_name,
    reg_department,
    reg_division,
    reg_year,
    reg_gr_number,
    reg_prn,
    reg_phone,
    reg_college_name,
    reg_email,
  } = req.body || {}

  try {
    // Check event exists
    const eventResult = await pool.query(
      'SELECT id, title, seats, allow_external FROM events WHERE id = $1',
      [eventId]
    )
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' })
    }
    const event = eventResult.rows[0]

    // Check external restriction
    if (userId) {
      const userResult = await pool.query(
        'SELECT college_type FROM users WHERE id = $1', [userId]
      )
      const userCollegeType = userResult.rows[0]?.college_type || 'guest'
      if (event.allow_external === false && userCollegeType !== 'vitian') {
        return res.status(403).json({ success: false, message: 'This event is for VIT students only' })
      }

      // Check already registered
      const existing = await pool.query(
        'SELECT id FROM registrations WHERE event_id = $1 AND user_id = $2',
        [eventId, userId]
      )
      if (existing.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Already registered for this event' })
      }
    }

    // Check seats
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM registrations WHERE event_id = $1', [eventId]
    )
    if (parseInt(countResult.rows[0].count) >= (event.seats || 100)) {
      return res.status(400).json({ success: false, message: 'Event is fully booked' })
    }

    const normalizedStatus = ['pending', 'verified', 'rejected'].includes(verification_status)
      ? verification_status : 'pending'

    // ✅ Uses your actual registrations table columns
    const reg = await pool.query(
      `INSERT INTO registrations
        (event_id, user_id, student_id, status,
         reg_name, reg_department, reg_division, reg_year,
         reg_gr_number, reg_prn, reg_phone, reg_college_name,
         receipt_image_url, verification_status)
       VALUES
        ($1, $2, $3, 'confirmed',
         $4, $5, $6, $7,
         $8, $9, $10, $11,
         $12, $13)
       RETURNING id, event_id, user_id, verification_status, receipt_image_url`,
      [
        eventId,
        userId,
        userId,                                   // student_id = user_id
        reg_name        || null,
        reg_department  || null,
        reg_division    || null,
        reg_year        || null,
        reg_gr_number   || null,
        reg_prn         || null,
        reg_phone       || null,
        reg_college_name|| null,
        receipt_image_url || transaction_id || null,
        normalizedStatus
      ]
    )

    console.log(`✅ User ${userId} registered for event ${eventId} (${event.title})`)
    res.json({
      success: true,
      message: 'Successfully registered for event!',
      data: {
        id: reg.rows[0].id,
        registration_id: reg.rows[0].id,
        eventId,
        eventTitle: event.title,
        verification_status: reg.rows[0].verification_status
      }
    })
  } catch (err) {
    console.error('REGISTER FOR EVENT ERROR:', err.message)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

const getEventRegistrations = async (req, res) => {
  try {
    if (req.user?.role === 'club_president') {
      const ownershipCheck = await pool.query(
        'SELECT id FROM events WHERE id = $1 AND faculty_id = $2', [req.params.id, req.user.id]
      )
      if (ownershipCheck.rows.length === 0) {
        return res.status(403).json({ success: false, message: 'You can only view your own event registrations' })
      }
    }
    // ✅ Also return reg_name, reg_department etc. for ClubDashboard Verification Hub
    const result = await pool.query(
      `SELECT r.id, r.id as registration_id, r.registered_at, r.status,
              r.verification_status, r.receipt_image_url,
              r.reg_name, r.reg_department, r.reg_division, r.reg_year,
              r.reg_gr_number, r.reg_phone, r.reg_college_name,
              u.first_name, u.last_name, u.email, u.gr_number,
              u.department, u.division, u.campus, u.college_type, u.college_name, u.phone,
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
    const [eventsR, regsR, volsR, typeR, pendingR] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM events WHERE faculty_id = $1', [userId]),
      pool.query(`SELECT COUNT(*) as count FROM registrations r JOIN events e ON r.event_id = e.id WHERE e.faculty_id = $1`, [userId]),
      pool.query(`SELECT COUNT(*) as count FROM users WHERE assigned_role = 'volunteer' AND assigned_event_id IN (SELECT id FROM events WHERE faculty_id = $1)`, [userId]),
      pool.query(`SELECT event_type, COUNT(*) as count FROM events WHERE faculty_id = $1 GROUP BY event_type ORDER BY count DESC`, [userId]),
      pool.query(`SELECT COUNT(*) as count FROM users WHERE college_type = 'non_vitian' AND is_approved = false`)
    ])
    res.json({
      success: true,
      data: {
        eventsCount:           parseInt(eventsR.rows[0].count),
        registrationsCount:    parseInt(regsR.rows[0].count),
        volunteersCount:       parseInt(volsR.rows[0].count),
        eventTypeBreakdown:    typeR.rows,
        pendingApprovalsCount: parseInt(pendingR.rows[0].count)
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
              u.division, u.year, u.assigned_role, u.assigned_event_id, e.title as event_title
       FROM users u
       LEFT JOIN events e ON u.assigned_event_id = e.id
       WHERE u.assigned_role = 'volunteer'
       AND u.assigned_event_id IN (SELECT id FROM events WHERE faculty_id = $1)
       ORDER BY u.first_name`, [userId]
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

const getPendingApprovals = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, phone,
              college_name, college_email, department, year, created_at
       FROM users WHERE college_type = 'non_vitian' AND is_approved = false
       ORDER BY created_at DESC`
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

const approveNonVitian = async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE users SET is_approved = true WHERE id = $1
       RETURNING id, first_name, last_name, email, college_name`, [req.params.userId]
    )
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, message: 'User approved!', data: result.rows[0] })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

const rejectNonVitian = async (req, res) => {
  try {
    const userCheck = await pool.query(
      'SELECT id, email, college_type, is_approved FROM users WHERE id = $1', [req.params.userId]
    )
    if (userCheck.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' })
    const user = userCheck.rows[0]
    if (user.college_type !== 'non_vitian' || user.is_approved === true) {
      return res.status(400).json({ success: false, message: 'Can only reject pending non-VITian users' })
    }
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.userId])
    res.json({ success: true, message: 'User rejected and removed.' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

const getPendingEventsByCategory = async (req, res) => {
  try {
    const coordinatorType = req.user.coordinator_type

    let query, params = []

    let hasExtraColumns = false
    try {
      await pool.query('SELECT coordinator_remarks FROM events LIMIT 0')
      hasExtraColumns = true
    } catch { hasExtraColumns = false }

    const extraCols = hasExtraColumns
      ? `, e.coordinator_remarks, e.coordinator_id, e.organizing_dept, e.special_guest, e.amenities, e.updated_at`
      : ''

    const baseSelect = `
      SELECT e.id, e.title, e.description, e.date, e.venue, e.category,
             e.event_type, e.status, e.created_at, e.seats, e.fees${extraCols},
             u.id as faculty_id, u.first_name as faculty_first_name,
             u.last_name as faculty_last_name, u.email as faculty_email,
             COUNT(DISTINCT r.id)::int as registered_count
      FROM events e
      LEFT JOIN users u ON e.faculty_id = u.id
      LEFT JOIN registrations r ON e.id = r.event_id
    `

    if (coordinatorType && coordinatorType !== 'none') {
      query = baseSelect + `
        WHERE e.category = $1 AND e.status IN ('pending', 'approved', 'rejected')
        GROUP BY e.id, u.id ORDER BY e.created_at DESC`
      params = [coordinatorType]
    } else {
      query = baseSelect + `
        WHERE e.status IN ('pending', 'approved', 'rejected')
        GROUP BY e.id, u.id ORDER BY e.created_at DESC`
    }

    const result = await pool.query(query, params)
    res.json({ success: true, data: result.rows })
  } catch (err) {
    console.error('GET PENDING EVENTS BY CATEGORY ERROR:', err.message)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

const approveEvent = async (req, res) => {
  try {
    const { eventId } = req.params
    const eventCheck = await pool.query('SELECT id, status, title FROM events WHERE id = $1', [eventId])
    if (eventCheck.rows.length === 0) return res.status(404).json({ success: false, message: 'Event not found' })
    if (eventCheck.rows[0].status !== 'pending') return res.status(400).json({ success: false, message: 'Event is not pending' })

    let result
    try {
      result = await pool.query(
        `UPDATE events SET status = 'approved', coordinator_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
        [req.user.id, eventId]
      )
    } catch {
      result = await pool.query(
        `UPDATE events SET status = 'approved' WHERE id = $1 RETURNING *`, [eventId]
      )
    }

    console.log(`✅ Event approved: ${result.rows[0].title} by coordinator ${req.user.id}`)
    res.json({ success: true, message: 'Event approved!', data: result.rows[0] })
  } catch (err) {
    console.error('APPROVE EVENT ERROR:', err.message)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

const rejectEvent = async (req, res) => {
  try {
    const { eventId } = req.params
    const { coordinator_remarks } = req.body
    if (!coordinator_remarks?.trim()) {
      return res.status(400).json({ success: false, message: 'Remarks are required for rejection' })
    }

    const eventCheck = await pool.query('SELECT id, status, title FROM events WHERE id = $1', [eventId])
    if (eventCheck.rows.length === 0) return res.status(404).json({ success: false, message: 'Event not found' })
    if (eventCheck.rows[0].status !== 'pending') return res.status(400).json({ success: false, message: 'Event is not pending' })

    let result
    try {
      result = await pool.query(
        `UPDATE events SET status = 'rejected', coordinator_remarks = $1, coordinator_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
        [coordinator_remarks, req.user.id, eventId]
      )
    } catch {
      result = await pool.query(
        `UPDATE events SET status = 'rejected' WHERE id = $1 RETURNING *`, [eventId]
      )
    }

    console.log(`❌ Event rejected: ${result.rows[0].title} by coordinator ${req.user.id}`)
    res.json({ success: true, message: 'Event rejected', data: result.rows[0] })
  } catch (err) {
    console.error('REJECT EVENT ERROR:', err.message)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

const verifyStudentRegistration = async (req, res) => {
  try {
    const registrationId = req.params.registrationId || req.params.id
    const { verification_status } = req.body
    if (!['verified', 'rejected'].includes(verification_status)) {
      return res.status(400).json({ success: false, message: 'Use "verified" or "rejected"' })
    }
    const check = await pool.query(
      `SELECT r.id, e.faculty_id FROM registrations r
       INNER JOIN events e ON e.id = r.event_id WHERE r.id = $1`, [registrationId]
    )
    if (check.rows.length === 0) return res.status(404).json({ success: false, message: 'Registration not found' })
    if (check.rows[0].faculty_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the event creator can verify' })
    }
    const result = await pool.query(
      'UPDATE registrations SET verification_status = $1 WHERE id = $2 RETURNING *',
      [verification_status, registrationId]
    )
    console.log(`✅ Registration ${registrationId} marked ${verification_status} by ${req.user.id}`)
    res.json({ success: true, message: `Registration ${verification_status}!`, data: result.rows[0] })
  } catch (err) {
    console.error('VERIFY REGISTRATION ERROR:', err.message)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

module.exports = {
  getAllEvents, getPendingEvents, getEventById, createEvent,
  updateEventStatus, updateEventType,
  registerForEvent, getEventRegistrations,
  getCoordinatorStats, getCoordinatorVolunteers,
  getPendingApprovals, approveNonVitian, rejectNonVitian,
  getPendingEventsByCategory, approveEvent, rejectEvent, verifyStudentRegistration
}