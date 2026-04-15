const pool = require('../config/db')

const getAllEvents = async (req, res) => {
  try {
    const { category, event_type, status, created_by } = req.query

    // Default to 'approved' status if not specified (protects student view)
    const eventStatus = status || 'approved'

    let query = `
      SELECT e.*,
             COUNT(DISTINCT r.id)::int as registered_count
       FROM events e
       LEFT JOIN registrations r ON e.id = r.event_id
       WHERE e.status = $1
    `
    const params = [eventStatus]

    // Optional: Filter by created_by (for faculty to see only their events)
    if (created_by) {
      params.push(created_by)
      query += ` AND e.created_by = $${params.length}`
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

const getEventParticipants = async (req, res) => {
  try {
    const eventId = req.params.id || req.params.eventId  // ✅ Handle both naming conventions
    const userId = req.user.id

    if (!eventId) {
      return res.status(400).json({ success: false, message: 'Event ID is required' })
    }

    // First, verify that the requesting user created this event
    const eventCheck = await pool.query(
      'SELECT id, created_by, title FROM events WHERE id = $1',
      [eventId]
    )

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' })
    }

    const event = eventCheck.rows[0]

    // Verify ownership - only event creator can view participants
    if (event.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only view participants for your own events'
      })
    }

    // ✅ Fetch participants with JOIN between registrations and users
    // Returns EMPTY ARRAY [] with 200 OK if no participants exist
    const participantsResult = await pool.query(
      `SELECT
        r.id AS registration_id,
        r.id,
        r.user_id,
        COALESCE(u.first_name || ' ' || u.last_name, r.name) as name,
        COALESCE(u.email, r.email) as email,
        r.reg_phone as phone,
        r.reg_department as department,
        r.reg_college_name as college_name,
        COALESCE(u.college_type, r.college_type, 'unknown') as college_type,
        r.created_at as registered_at,
        r.reg_prn as prn,
        r.reg_year as year,
        r.reg_division as division
       FROM registrations r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.event_id = $1
       ORDER BY r.created_at DESC`,
      [eventId]
    )

    const participants = participantsResult.rows || []  // ✅ Always return array

    // ✅ STANDARDIZED: Clean, predictable JSON format
    // Frontend expects: { success: true, participants: [...] }
    res.status(200).json({
      success: true,
      participants: participants
    })
  } catch (err) {
    console.error('Error fetching event participants:', err)
    res.status(500).json({ success: false, message: 'Server error fetching participants', error: err.message })
  }
}

const createEvent = async (req, res) => {
  const {
    title, organisingClub, saVertical, date, day,
    timeFrom, timeTo, venue, onlineLink, targetAudience,
    expectedCount, seats, fees, contact, category,
    keyFeatures, desc, department, contactNumber,
    event_type, allow_external, payment_qr_url
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
      if (Array.isArray(keyFeatures)) {
        featuresString = keyFeatures.join(', ')
      } else if (typeof keyFeatures === 'string') {
        featuresString = keyFeatures
      }
    }
    const featuresArray = featuresString
      ? featuresString.split(',').map(k => k.trim()).filter(k => k)
      : []

    const result = await pool.query(
      `INSERT INTO events
        (title, organising_club, sa_vertical, date, day,
         time_from, time_to, venue, online_link, target_audience,
         expected_count, seats, fees, contact, category,
         key_features, description, event_type, department, contact_number,
         created_by, status, allow_external, payment_qr_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,'pending',$22,$23)
       RETURNING *`,
      [
        title, organisingClub || null, saVertical || null, date, day || null,
        timeFrom || null, timeTo || null, venue, onlineLink || null,
        targetAudience || 'All', expectedCount || 0, seats || 100,
        fees || 'Free', contact || null, category || 'General',
        JSON.stringify(featuresArray), desc || null, resolvedEventType,
        department || null, contactNumber || contact || null, req.user.id,
        allow_external || false, payment_qr_url || null
      ]
    )

    res.status(201).json({
      success: true,
      message: 'Event submitted for Dean approval!',
      data: result.rows[0]
    })
  } catch (err) {
    console.error('\n🔴 ===== CREATE EVENT ERROR =====')
    console.error('Error Message:', err.message)
    console.error('Error Code:', err.code)
    console.error('Error Detail:', err.detail)
    res.status(500).json({
      success: false, message: 'Server error creating event',
      error: err.message, code: err.code, detail: err.detail
    })
  }
}

const updateEvent = async (req, res) => {
  const { eventId } = req.params
  const userId = req.user.id
  
  const {
    title, saVertical, date, day, timeFrom, timeTo, venue, onlineLink,
    targetAudience, expectedCount, seats, fees, contact, category,
    keyFeatures, desc, department, contactNumber, event_type, allow_external
  } = req.body

  if (!title || !date || !venue) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields',
      required: ['title', 'date', 'venue']
    })
  }

  try {
    // Check if event exists and belongs to the current user
    const eventCheck = await pool.query(
      'SELECT id, created_by FROM events WHERE id = $1',
      [eventId]
    )
    
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' })
    }

    // Verify ownership - only creator can edit
    if (eventCheck.rows[0].created_by !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized: You can only edit your own events' 
      })
    }

    // Parse keyFeatures
    let featuresString = ''
    if (keyFeatures) {
      if (Array.isArray(keyFeatures)) {
        featuresString = keyFeatures.join(',')
      } else if (typeof keyFeatures === 'string') {
        featuresString = keyFeatures
      }
    }
    const featuresArray = featuresString
      ? featuresString.split(',').map(k => k.trim()).filter(k => k)
      : []

    // Update event with RESET status to 'pending' for re-approval
    const result = await pool.query(
      `UPDATE events SET
        title = $1,
        sa_vertical = $2,
        date = $3,
        day = $4,
        time_from = $5,
        time_to = $6,
        venue = $7,
        online_link = $8,
        target_audience = $9,
        expected_count = $10,
        seats = $11,
        fees = $12,
        contact = $13,
        category = $14,
        key_features = $15,
        description = $16,
        event_type = $17,
        department = $18,
        contact_number = $19,
        allow_external = $20,
        status = 'pending',
        updated_at = NOW()
       WHERE id = $21 AND created_by = $22
       RETURNING *`,
      [
        title,
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
        JSON.stringify(featuresArray),
        desc || null,
        event_type || 'Intracollege',
        department || null,
        contactNumber || contact || null,
        allow_external || false,
        eventId,
        userId
      ]
    )

    if (result.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Failed to update event' })
    }

    console.log(`✏️ Event ${eventId} updated and reset to 'pending' by user ${userId}`)
    res.json({
      success: true,
      message: '✏️ Event updated! It has been moved back to pending for Dean re-approval.',
      data: result.rows[0]
    })
  } catch (err) {
    console.error('\n🔴 ===== UPDATE EVENT ERROR =====')
    console.error('Error Message:', err.message)
    res.status(500).json({
      success: false,
      message: 'Server error updating event',
      error: err.message
    })
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
      'SELECT id, status, created_by FROM events WHERE id = $1', [req.params.id]
    )
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' })
    }

    const result = await pool.query(
      'UPDATE events SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
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
    const eventCheck = await pool.query('SELECT id, created_by FROM events WHERE id = $1', [req.params.id])
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' })
    }

    const event = eventCheck.rows[0]
    if (event.created_by !== req.user.id && !['admin', 'dean'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' })
    }

    const result = await pool.query(
      'UPDATE events SET event_type = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [event_type, req.params.id]
    )
    res.json({ success: true, message: `Event type updated to ${event_type}`, data: result.rows[0] })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

// ✅ FIXED: Handles both logged-in users AND guests (no account)
const registerForEvent = async (req, res) => {
  const eventId = req.params.id

  // req.user exists for logged-in users, null for guests (via optionalAuth)
  const userId = req.user ? req.user.id : null
  const isGuest = !userId

  const {
    reg_name, reg_phone, reg_email, reg_college_name,
    reg_department, reg_division, reg_year, reg_gr_number, reg_prn,
    // also accept old field names just in case
    name, phone, department, division, year, grNumber, prn, collegeName
  } = req.body

  // Resolve field names (new reg_* names preferred, fallback to old names)
  const finalName       = reg_name        || name        || null
  const finalPhone      = reg_phone       || phone       || null
  const finalEmail      = reg_email       || null
  const finalCollege    = reg_college_name|| collegeName  || null
  const finalDept       = reg_department  || department  || null
  const finalDivision   = reg_division    || division    || null
  const finalYear       = reg_year        || year        || null
  const finalGR         = reg_gr_number   || grNumber    || null
  const finalPRN        = reg_prn         || prn         || null

  try {
    // Fetch event details
    const eventResult = await pool.query(
      `SELECT id, title, organising_club, seats, fees, date, venue, allow_external, payment_qr_url
       FROM events WHERE id = $1`,
      [eventId]
    )
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' })
    }
    const event = eventResult.rows[0]

    let userCollegeType = 'guest'
    if (userId) {
      const userResult = await pool.query(
        'SELECT college_type FROM users WHERE id = $1',
        [userId]
      )
      userCollegeType = userResult.rows[0]?.college_type || 'guest'
    }

    // Block non-VIT users from VIT-only events at the API level
    if (event.allow_external === false && userCollegeType !== 'vitian') {
      return res.status(403).json({
        success: false,
        message: 'This event is for VIT students only'
      })
    }

    // Check seat availability
    const registeredCount = await pool.query(
      'SELECT COUNT(*) FROM registrations WHERE event_id = $1', [eventId]
    )
    if (parseInt(registeredCount.rows[0].count) >= (event.seats || 100)) {
      return res.status(400).json({ success: false, message: 'Event is fully booked' })
    }

    // For logged-in users: check duplicate registration
    if (userId) {
      const existing = await pool.query(
        'SELECT * FROM registrations WHERE event_id = $1 AND user_id = $2',
        [eventId, userId]
      )
      if (existing.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Already registered for this event' })
      }
    }

    // Insert registration (user_id is NULL for guests)
    const regResult = await pool.query(
      `INSERT INTO registrations
        (event_id, user_id, status, reg_name, reg_department, reg_division,
         reg_year, reg_gr_number, reg_prn, reg_phone, reg_college_name)
       VALUES ($1, $2, 'confirmed', $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, registered_at`,
      [
        eventId, userId,
        finalName, finalDept, finalDivision,
        finalYear, finalGR, finalPRN, finalPhone, finalCollege
      ]
    )

    const registration = regResult.rows[0]

    // Generate ticket ID
    const ticketId = isGuest
      ? `EVT-${eventId}-GUEST-${registration.id}`
      : `EVT-${eventId}-USR-${userId}-${registration.id}`

    console.log(`✅ ${isGuest ? 'Guest' : `User ${userId}`} registered for event ${eventId} (${event.title})`)

    res.json({
      success: true,
      message: 'Successfully registered for event!',
      data: {
        ticketId,
        eventId,
        eventTitle:    event.title,
        eventDate:     event.date,
        eventVenue:    event.venue,
        eventFees:     event.fees,
        organisingClub: event.organising_club,
        paymentQrUrl:  event.payment_qr_url,
        registeredAt:  registration.registered_at,
        registrantName:  finalName,
        registrantPhone: finalPhone,
        registrantEmail: finalEmail,
        registrantDept:  finalDept,
        registrantYear:  finalYear,
        registrantCollege: finalCollege,
        isGuest
      }
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
         r.reg_name, r.reg_department, r.reg_division,
         r.reg_year, r.reg_gr_number, r.reg_prn,
         r.reg_phone, r.reg_college_name,
         -- user fields (NULL for guests)
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
      'SELECT COUNT(*) as count FROM events WHERE created_by = $1', [userId]
    )
    const registrationsResult = await pool.query(
      `SELECT COUNT(*) as count FROM registrations r
       JOIN events e ON r.event_id = e.id WHERE e.created_by = $1`, [userId]
    )
    const volunteersResult = await pool.query(
      `SELECT COUNT(*) as count FROM users
       WHERE assigned_role = 'volunteer' AND assigned_event_id IN (
         SELECT id FROM events WHERE created_by = $1)`, [userId]
    )
    const typeBreakdownResult = await pool.query(
      `SELECT event_type, COUNT(*) as count FROM events
       WHERE created_by = $1 GROUP BY event_type ORDER BY count DESC`, [userId]
    )
    const pendingApprovalsResult = await pool.query(
      `SELECT COUNT(*) as count FROM users
       WHERE college_type = 'non_vitian' AND is_approved = false`
    )

    res.json({
      success: true,
      data: {
        eventsCount:          parseInt(eventsResult.rows[0].count),
        registrationsCount:   parseInt(registrationsResult.rows[0].count),
        volunteersCount:      parseInt(volunteersResult.rows[0].count),
        eventTypeBreakdown:   typeBreakdownResult.rows,
        pendingApprovalsCount: parseInt(pendingApprovalsResult.rows[0].count)
      }
    })
  } catch (err) {
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
       AND u.assigned_event_id IN (SELECT id FROM events WHERE created_by = $1)
       ORDER BY u.first_name, u.last_name`,
      [userId]
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
       FROM users
       WHERE college_type = 'non_vitian' AND is_approved = false
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
       RETURNING id, first_name, last_name, email, college_name`,
      [req.params.userId]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }
    console.log(`✅ Non-VITian approved: ${result.rows[0].email}`)
    res.json({ success: true, message: 'User approved successfully!', data: result.rows[0] })
  } catch (err) {
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
    res.status(500).json({ success: false, message: err.message })
  }
}

const getEventReport = async (req, res) => {
  try {
    const { eventId } = req.params
    const { format = 'json' } = req.query

    // Fetch event details
    const eventResult = await pool.query(
      `SELECT id, title, organising_club, date, venue, description, status
       FROM events WHERE id = $1`,
      [eventId]
    )
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' })
    }

    const event = eventResult.rows[0]

    // Fetch all registrations with user details (JOIN)
    const registrationsResult = await pool.query(
      `SELECT 
        r.id,
        r.user_id,
        COALESCE(r.name, u.first_name || ' ' || u.last_name, 'Guest') as name,
        COALESCE(r.email, u.email) as email,
        r.reg_phone as phone,
        COALESCE(u.college_type, r.college_type, 'unknown') as college_type,
        r.reg_prn as prn,
        r.reg_department as department,
        r.reg_division as division,
        r.reg_year as year,
        r.created_at as registered_on
       FROM registrations r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.event_id = $1
       ORDER BY r.created_at DESC`,
      [eventId]
    )

    const registrations = registrationsResult.rows

    // Return JSON format (default)
    if (format === 'json' || !format) {
      return res.json({
        success: true,
        data: {
          event: {
            id: event.id,
            title: event.title,
            date: event.date,
            venue: event.venue,
            organising_club: event.organising_club,
            description: event.description,
            status: event.status,
            total_registrations: registrations.length
          },
          registrations: registrations
        }
      })
    }

    // Return CSV format
    if (format === 'csv') {
      const headers = ['ID', 'Name', 'Email', 'Phone', 'College Type', 'PRN', 'Department', 'Year', 'Division', 'Registered On']
      const rows = registrations.map(r => [
        r.id,
        r.name || 'N/A',
        r.email || 'N/A',
        r.phone || 'N/A',
        r.college_type || 'N/A',
        r.prn || 'N/A',
        r.department || 'N/A',
        r.year || 'N/A',
        r.division || 'N/A',
        new Date(r.registered_on).toLocaleString()
      ])

      const csvContent = [
        ['Event Attendance Report'],
        ['', event.title],
        ['Date Generated', new Date().toLocaleString()],
        [''],
        ['Event Details:'],
        ['Title', event.title],
        ['Date', new Date(event.date).toLocaleDateString()],
        ['Venue', event.venue || 'N/A'],
        ['Organizer', event.organising_club || 'N/A'],
        ['Total Registrations', registrations.length],
        [''],
        ['Participant Details:'],
        headers,
        ...rows
      ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')

      res.setHeader('Content-Type', 'text/csv;charset=utf-8;')
      res.setHeader('Content-Disposition', `attachment; filename="attendance_${eventId}_${Date.now()}.csv"`)
      res.send(csvContent)
    }
  } catch (err) {
    console.error('Error generating event report:', err)
    res.status(500).json({ success: false, message: 'Failed to generate report', error: err.message })
  }
}

module.exports = {
  getAllEvents, getEventById, getEventParticipants, createEvent, updateEvent,
  updateEventStatus, updateEventType,
  registerForEvent, getEventRegistrations,
  getCoordinatorStats, getCoordinatorVolunteers,
  getPendingApprovals, approveNonVitian, rejectNonVitian,
  getEventReport
}