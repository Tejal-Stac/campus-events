const pool = require('../config/db')

const getAllEvents = async (req, res) => {
  try {
    const { category, event_type, status } = req.query
    const isClubPresident = req.user?.role === 'club_president'
    const eventStatus = isClubPresident ? (status || null) : (status || 'approved')

    let query = `
      SELECT e.*,
             COUNT(DISTINCT r.id)::int as registered_count
       FROM events e
       LEFT JOIN registrations r ON e.id = r.event_id
       WHERE 1=1
    `
    const params = []

    if (isClubPresident) {
      params.push(req.user.id)
      query += ` AND e.faculty_id = $${params.length}`
      if (eventStatus) {
        params.push(eventStatus)
        query += ` AND e.status = $${params.length}`
      }
    } else {
      params.push(eventStatus)
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
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

const getPendingEvents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.id, e.title, e.description, e.date, e.venue, e.category,
              e.event_type, e.status, e.created_at, e.updated_at,
              e.seats, e.fees, e.department, e.special_guest, e.amenities,
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
    keyFeatures, desc, event_type, allow_external, payment_qr_url,
    organizing_dept, special_guest, amenities,
    start_date, end_date, is_closed,
    club_name, audience_type, registration_fee
  } = req.body
  
  const poster_url = req.file ? `/uploads/posters/${req.file.filename}` : req.body.poster_url

  if (!title || (!date && !start_date) || !venue) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields',
      required: ['title', 'date or start_date', 'venue']
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

    let amenitiesArray = null
    if (amenities && Array.isArray(amenities) && amenities.length > 0) {
      amenitiesArray = JSON.stringify(amenities)
    }

    const result = await pool.query(
      `INSERT INTO events
        (title, organising_club, sa_vertical, date, day,
         time_from, time_to, venue, online_link, target_audience,
         expected_count, seats, fees, contact, category,
         key_features, description, event_type, faculty_id, creator_id, status,
         allow_external, payment_qr_url, department, special_guest, amenities,
         start_date, end_date, is_closed, poster_url, club_name, audience_type, registration_fee)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,'pending',$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32)
       RETURNING *`,
      [
        title, organisingClub || null, saVertical || null, date || start_date || null, day || null,
        timeFrom || null, timeTo || null, venue, onlineLink || null,
        targetAudience || 'All', expectedCount || 0, seats || 100,
        fees || 'Free', contact || null, category || 'General',
        JSON.stringify(featuresArray), desc || null, resolvedEventType,
        req.user.id, req.user.id, allow_external || false, payment_qr_url || null,
        organizing_dept || null, special_guest || null, amenitiesArray,
        start_date || null, end_date || null, is_closed === 'true' || is_closed === true || false, poster_url || null, club_name || null, audience_type || null, registration_fee || 0
      ]
    )

    console.log(`✅ Event created: "${title}" by user ${req.user.id}`)
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

    // Simple status update - updated_at is automatically set by database trigger
    const query = 'UPDATE events SET status = $1 WHERE id = $2 RETURNING *'
    const params = [status, req.params.id]

    const result = await pool.query(query, params)
    
    if (status === 'approved') {
      console.log(`✅ EVENT APPROVED: Event ${req.params.id} (${result.rows[0].title}) approved by user ${req.user.id} - updated_at: ${result.rows[0].updated_at}`)
    } else if (status === 'rejected') {
      console.log(`❌ EVENT REJECTED: Event ${req.params.id} (${result.rows[0].title}) rejected by user ${req.user.id}`)
    } else {
      console.log(`⚙️ Event ${req.params.id} status updated to '${status}' by user ${req.user.id}`)
    }
    
    res.json({ success: true, message: `Event ${status} successfully!`, data: result.rows[0] })
  } catch (err) {
    console.error(`🔴 UPDATE EVENT STATUS ERROR (ID: ${req.params.id}, Status: ${req.body.status}):`, err.message)
    console.error('Full Error:', err)
    res.status(500).json({ success: false, message: 'Server error updating event status', error: err.message })
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
  console.log("Reg Request:", req.body)
  const eventId = req.params.id || req.body.event_id
  const userId = req.body.student_id ? parseInt(req.body.student_id, 10) : (req.user ? req.user.id : null)
  const {
    receipt_image_url, verification_status,
    reg_name, reg_department, reg_division, reg_year,
    reg_gr_number, reg_prn, reg_phone, reg_college_name,
    is_external
  } = req.body

  try {
    const eventResult = await pool.query(
      'SELECT id, title, organising_club, seats, fees, date, venue, allow_external, is_closed FROM events WHERE id = $1',
      [eventId]
    )
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' })
    }
    const event = eventResult.rows[0]

    if (event.is_closed) {
      return res.status(400).json({ success: false, message: 'Registration Closed' })
    }

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

    const normalizedVerificationStatus = ['pending', 'verified', 'rejected'].includes(verification_status)
      ? verification_status
      : 'pending'

    const paymentStatus = (event.fees === 'Free' || event.fees === 0 || event.fees === '0') ? 'completed' : 'pending'

    const registrationInsert = await pool.query(
      `INSERT INTO registrations (
         event_id, user_id, status, receipt_image_url, verification_status,
         reg_name, reg_department, reg_division, reg_year,
         reg_gr_number, reg_prn, reg_phone, reg_college_name,
         is_external, payment_status, attended
       )
       VALUES ($1, $2, 'confirmed', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, false)
       RETURNING id, event_id, user_id, verification_status, receipt_image_url`,
      [
        eventId, userId, receipt_image_url || null, normalizedVerificationStatus,
        reg_name || null, reg_department || null, reg_division || null, reg_year || null,
        reg_gr_number || null, reg_prn || null, reg_phone || null, reg_college_name || null,
        is_external || false, paymentStatus
      ]
    )

    console.log(`✅ User ${userId} registered for event ${eventId} (${event.title})`)
    res.json({
      success: true,
      message: 'Successfully registered for event!',
      data: {
        eventId,
        eventTitle: event.title,
        registration_id: registrationInsert.rows[0].id,
        verification_status: registrationInsert.rows[0].verification_status
      }
    })
  } catch (err) {
    console.error('REGISTER FOR EVENT ERROR:', err)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

const getEventRegistrations = async (req, res) => {
  try {
    if (req.user?.role === 'club_president') {
      const ownershipCheck = await pool.query(
        'SELECT id FROM events WHERE id = $1 AND faculty_id = $2',
        [req.params.id, req.user.id]
      )
      if (ownershipCheck.rows.length === 0) {
        return res.status(403).json({ success: false, message: 'You can only view registrations for your own events' })
      }
    }

    const result = await pool.query(
      `SELECT
         r.id,
         r.id as registration_id,
         r.registered_at, r.status, r.verification_status, r.receipt_image_url,
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

// Phase 2: Coordinator Approval Workflow
// GET /api/events/coordinator/pending - Get pending events for coordinator's category
const getPendingEventsByCategory = async (req, res) => {
  try {
    const coordinatorType = req.user.coordinator_type
    if (!coordinatorType || coordinatorType === 'none') {
      return res.status(403).json({ success: false, message: 'Not assigned as a coordinator' })
    }

    // [FIX] Fetch events with status 'pending', 'approved', AND 'rejected' - not just 'pending'
    // Also includes updated_at for resubmitted events
    const result = await pool.query(
      `SELECT e.id, e.title, e.description, e.date, e.venue, e.category,
              e.event_type, e.status, e.coordinator_remarks, e.created_at, e.updated_at,
              e.seats, e.fees, e.special_guest, e.amenities,
              u.id as faculty_id, u.first_name as faculty_first_name, 
              u.last_name as faculty_last_name, u.email as faculty_email,
              COUNT(DISTINCT r.id)::int as registered_count
       FROM events e
       LEFT JOIN users u ON e.faculty_id = u.id
       LEFT JOIN registrations r ON e.id = r.event_id
       WHERE e.category = $1 AND e.status IN ('pending', 'approved', 'rejected')
       GROUP BY e.id, u.id
       ORDER BY e.created_at DESC`,
      [coordinatorType]
    )
    
    res.json({ success: true, data: result.rows })
  } catch (err) {
    console.error('GET PENDING EVENTS BY CATEGORY ERROR:', err.message)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

// PUT /api/events/:id/approve - Approve an event
const approveEvent = async (req, res) => {
  try {
    const { eventId } = req.params
    const coordinatorType = req.user.coordinator_type

    // Verify the event exists and belongs to the coordinator's category
    const eventCheck = await pool.query(
      `SELECT id, category, status FROM events WHERE id = $1`,
      [eventId]
    )
    
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' })
    }

    const event = eventCheck.rows[0]
    if (event.category !== coordinatorType) {
      return res.status(403).json({ success: false, message: 'Not authorized to approve this event' })
    }

    if (event.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Event is not pending approval' })
    }

    // Approve the event
    const result = await pool.query(
      `UPDATE events SET status = 'approved', coordinator_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [req.user.id, eventId]
    )

    console.log(`✅ Event approved: ${result.rows[0].title} by coordinator ${req.user.id}`)
    res.json({ success: true, message: 'Event approved!', data: result.rows[0] })
  } catch (err) {
    console.error('APPROVE EVENT ERROR:', err.message)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

// PUT /api/events/:id/reject - Reject an event with remarks
const rejectEvent = async (req, res) => {
  try {
    const { eventId } = req.params
    const { coordinator_remarks } = req.body
    const coordinatorType = req.user.coordinator_type

    if (!coordinator_remarks || coordinator_remarks.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Remarks are required for rejection' })
    }

    // Verify the event exists and belongs to the coordinator's category
    const eventCheck = await pool.query(
      `SELECT id, category, status FROM events WHERE id = $1`,
      [eventId]
    )
    
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' })
    }

    const event = eventCheck.rows[0]
    if (event.category !== coordinatorType) {
      return res.status(403).json({ success: false, message: 'Not authorized to reject this event' })
    }

    if (event.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Event is not pending approval' })
    }

    // Reject the event
    const result = await pool.query(
      `UPDATE events SET status = 'rejected', coordinator_remarks = $1, coordinator_id = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 RETURNING *`,
      [coordinator_remarks, req.user.id, eventId]
    )

    console.log(`❌ Event rejected: ${result.rows[0].title} by coordinator ${req.user.id}`)
    res.json({ success: true, message: 'Event rejected with remarks', data: result.rows[0] })
  } catch (err) {
    console.error('REJECT EVENT ERROR:', err.message)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

// PUT /api/registrations/:id/verify - Verify a student's registration
const verifyStudentRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params
    const { verification_status } = req.body

    if (!['verified', 'rejected'].includes(verification_status)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status' })
    }

    const registrationOwnerCheck = await pool.query(
      `SELECT r.id, e.id as event_id, e.faculty_id
       FROM registrations r
       INNER JOIN events e ON e.id = r.event_id
       WHERE r.id = $1`,
      [registrationId]
    )

    if (registrationOwnerCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Registration not found' })
    }

    const registration = registrationOwnerCheck.rows[0]
    if (registration.faculty_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the event creator can verify registrations' })
    }

    const result = await pool.query(
      `UPDATE registrations
       SET verification_status = $1
       WHERE id = $2
       RETURNING *`,
      [verification_status, registrationId]
    )

    res.json({ 
      success: true, 
      message: `Registration ${verification_status}!`, 
      data: result.rows[0] 
    })
  } catch (err) {
    console.error('VERIFY REGISTRATION ERROR:', err.message)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

const getRegistrationsForPresident = async (req, res) => {
  try {
    const { presidentId } = req.params;
    const result = await pool.query(`
      SELECT r.*, e.title as event_title, u.first_name || ' ' || u.last_name as student_name
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      JOIN users u ON r.user_id = u.id
      WHERE e.creator_id = $1 OR e.faculty_id = $1
      ORDER BY r.created_at DESC
    `, [presidentId]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
}

const closeEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_closed } = req.body;
    
    // Check permission
    const eventCheck = await pool.query('SELECT faculty_id, creator_id FROM events WHERE id = $1', [id]);
    if (eventCheck.rows.length === 0) return res.status(404).json({ success: false, message: 'Event not found' });
    const event = eventCheck.rows[0];
    
    const isAdminOrFaculty = ['admin', 'faculty', 'dean'].includes(req.user.role.toLowerCase());
    const isOwner = event.creator_id === req.user.id;
    
    if (!isAdminOrFaculty && !isOwner) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Only faculty, admin, or the event creator can close this event.' });
    }

    const result = await pool.query(
      'UPDATE events SET is_closed = $1 WHERE id = $2 RETURNING *',
      [is_closed, id]
    );
    res.json({ success: true, message: 'Event status updated', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
}

const exportEventCsv = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check permission
    const eventCheck = await pool.query('SELECT title, faculty_id, creator_id, coordinator_id FROM events WHERE id = $1', [id]);
    if (eventCheck.rows.length === 0) return res.status(404).json({ success: false, message: 'Event not found' });
    const event = eventCheck.rows[0];
    
    if (event.faculty_id !== req.user.id && event.creator_id !== req.user.id && event.coordinator_id !== req.user.id && req.user.role !== 'dean') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const result = await pool.query(`
      SELECT u.first_name || ' ' || u.last_name as "Name",
             u.email as "Email",
             u.phone as "Phone",
             u.department as "Department",
             u.college_type as "College Type",
             r.registered_at as "Registration Date",
             r.attended as "Attended",
             r.status as "Registration Status"
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      WHERE r.event_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'No registrations found' });
    }

    const { parse } = require('json2csv');
    const csv = parse(result.rows);
    res.header('Content-Type', 'text/csv');
    res.attachment(`${event.title.replace(/\s+/g, '_')}_attendees.csv`);
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
}

module.exports = {
  getAllEvents, getPendingEvents, getEventById, createEvent,
  updateEventStatus, updateEventType,
  registerForEvent, getEventRegistrations,
  getCoordinatorStats, getCoordinatorVolunteers,
  getPendingApprovals, approveNonVitian, rejectNonVitian,
  getPendingEventsByCategory, approveEvent, rejectEvent, verifyStudentRegistration,
  getRegistrationsForPresident, closeEvent, exportEventCsv
}