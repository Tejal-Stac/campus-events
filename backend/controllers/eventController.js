const pool = require('../config/db')

const getAllEvents = async (req, res) => {
  try {
    // Return all events with registration count
    const result = await pool.query(
      `SELECT e.*, 
              COUNT(DISTINCT r.id) as registered
       FROM events e
       LEFT JOIN registrations r ON e.id = r.event_id
       GROUP BY e.id
       ORDER BY e.created_at DESC`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

const getEventById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id])
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
    keyFeatures, desc, eventType, department, contactNumber, imageUrl
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
    // Handle key_features: convert array to string first, then to JSON array
    let featuresString = '';
    if (keyFeatures) {
      if (Array.isArray(keyFeatures)) {
        featuresString = keyFeatures.join(', ');
      } else if (typeof keyFeatures === 'string') {
        featuresString = keyFeatures;
      }
    }
    const featuresArray = featuresString ? featuresString.split(',').map(k => k.trim()).filter(k => k) : [];
    
    // Auto-assign category-based default image if no image provided
    const getDefaultImage = (cat) => {
      const defaultImages = {
        'Technical': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
        'Cultural': 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',
        'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
        'Workshop': 'https://images.unsplash.com/photo-1540317580384-e5d43616e00b?w=800',
        'Seminar': 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
        'Conference': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        'Hackathon': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
        'Competition': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
        'General': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800'
      }
      return defaultImages[cat] || 'https://images.unsplash.com/photo-1562774053-701939374585?w=800'
    }
    
    const finalCategory = category || 'General'
    const finalImageUrl = (imageUrl && imageUrl.trim()) ? imageUrl.trim() : getDefaultImage(finalCategory)
    
    const result = await pool.query(
      `INSERT INTO events 
        (title, organising_club, sa_vertical, date, day,
         time_from, time_to, venue, online_link, target_audience,
         expected_count, seats, fees, contact, category,
         key_features, description, event_type, department, contact_number, image_url, created_by, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,'pending')
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
        finalCategory,
        JSON.stringify(featuresArray), 
        desc || null,
        eventType || finalCategory,
        department || null,
        contactNumber || contact || null,
        finalImageUrl,
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

const updateEvent = async (req, res) => {
  const {
    title, organisingClub, saVertical, date, day,
    timeFrom, timeTo, venue, onlineLink, targetAudience,
    expectedCount, seats, fees, contact, category,
    keyFeatures, desc, eventType, department, contactNumber, imageUrl
  } = req.body

  try {
    // Check if event exists and user has permission
    const eventCheck = await pool.query(
      'SELECT id, created_by FROM events WHERE id = $1',
      [req.params.id]
    )

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' })
    }

    // Verify user is creator or dean
    if (eventCheck.rows[0].created_by !== req.user.id && req.user.role !== 'dean') {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only edit events you created' 
      })
    }

    // Handle key_features
    let featuresString = ''
    if (keyFeatures) {
      if (Array.isArray(keyFeatures)) {
        featuresString = keyFeatures.join(', ')
      } else if (typeof keyFeatures === 'string') {
        featuresString = keyFeatures
      }
    }
    const featuresArray = featuresString ? featuresString.split(',').map(k => k.trim()).filter(k => k) : []

    // Get default image if needed
    const getDefaultImage = (cat) => {
      const defaultImages = {
        'Technical': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
        'Cultural': 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',
        'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
        'Workshop': 'https://images.unsplash.com/photo-1540317580384-e5d43616e00b?w=800',
        'Seminar': 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
        'Conference': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        'Hackathon': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
        'Competition': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
        'General': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800'
      }
      return defaultImages[cat] || 'https://images.unsplash.com/photo-1562774053-701939374585?w=800'
    }

    const finalCategory = category || 'General'
    const finalImageUrl = (imageUrl && imageUrl.trim()) ? imageUrl.trim() : getDefaultImage(finalCategory)

    // Update event
    const result = await pool.query(
      `UPDATE events SET
        title = $1, organising_club = $2, sa_vertical = $3, date = $4, day = $5,
        time_from = $6, time_to = $7, venue = $8, online_link = $9, target_audience = $10,
        expected_count = $11, seats = $12, fees = $13, contact = $14, category = $15,
        key_features = $16, description = $17, event_type = $18, department = $19,
        contact_number = $20, image_url = $21, updated_at = NOW()
       WHERE id = $22
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
        finalCategory,
        JSON.stringify(featuresArray),
        desc || null,
        eventType || finalCategory,
        department || null,
        contactNumber || contact || null,
        finalImageUrl,
        req.params.id
      ]
    )

    console.log(`✅ Event ${req.params.id} updated by user ${req.user.id}`)

    res.json({
      success: true,
      message: 'Event updated successfully!',
      data: result.rows[0]
    })
  } catch (err) {
    console.error('UPDATE EVENT ERROR:', err)
    res.status(500).json({ 
      success: false,
      message: 'Server error updating event', 
      error: err.message
    })
  }
}

const registerForEvent = async (req, res) => {
  const eventId = req.params.id
  const userId = req.user.id

  try {
    // Check if already registered
    const existing = await pool.query(
      'SELECT * FROM registrations WHERE event_id = $1 AND user_id = $2',
      [eventId, userId]
    )
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Already registered for this event' })
    }

    // Check if event exists and get details
    const eventResult = await pool.query('SELECT id, title, organising_club, seats FROM events WHERE id = $1', [eventId])
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' })
    }

    const event = eventResult.rows[0]

    // Check if event is full
    const registeredCount = await pool.query(
      'SELECT COUNT(*) FROM registrations WHERE event_id = $1', [eventId]
    )
    if (parseInt(registeredCount.rows[0].count) >= (event.seats || 100)) {
      return res.status(400).json({ success: false, message: 'Event is fully booked' })
    }

    // Register the user - use 'status' column (not registration_status)
    await pool.query(
      'INSERT INTO registrations (event_id, user_id, status) VALUES ($1, $2, $3)',
      [eventId, userId, 'confirmed']
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
      `SELECT u.first_name, u.last_name, u.email, u.gr_number,
              u.department, u.division, u.campus
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       WHERE r.event_id = $1`,
      [req.params.id]
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

const getCoordinatorStats = async (req, res) => {
  const userId = req.user.id

  try {
    // Get coordinator's events
    const eventsResult = await pool.query(
      'SELECT COUNT(*) as count FROM events WHERE created_by = $1',
      [userId]
    )

    // Get total registrations for coordinator's events
    const registrationsResult = await pool.query(
      `SELECT COUNT(*) as count FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE e.created_by = $1`,
      [userId]
    )

    // Get volunteers assigned to coordinator's events
    const volunteersResult = await pool.query(
      `SELECT COUNT(*) as count FROM users
       WHERE assigned_role = 'volunteer' AND assigned_event_id IN (
         SELECT id FROM events WHERE created_by = $1
       )`,
      [userId]
    )

    res.json({
      success: true,
      data: {
        eventsCount: parseInt(eventsResult.rows[0].count),
        registrationsCount: parseInt(registrationsResult.rows[0].count),
        volunteersCount: parseInt(volunteersResult.rows[0].count)
      }
    })
  } catch (err) {
    console.error('GET COORDINATOR STATS ERROR:', err)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

const getCoordinatorVolunteers = async (req, res) => {
  const userId = req.user.id

  try {
    // Get volunteers assigned to coordinator's events
    const result = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.department, 
              u.division, u.year, u.assigned_role, u.assigned_event_id,
              e.title as event_title
       FROM users u
       LEFT JOIN events e ON u.assigned_event_id = e.id
       WHERE u.assigned_role = 'volunteer' 
       AND u.assigned_event_id IN (
         SELECT id FROM events WHERE created_by = $1
       )
       ORDER BY u.first_name, u.last_name`,
      [userId]
    )

    res.json({ success: true, data: result.rows })
  } catch (err) {
    console.error('GET COORDINATOR VOLUNTEERS ERROR:', err)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
}

module.exports = {
  getAllEvents, getEventById, createEvent, updateEvent,
  updateEventStatus, registerForEvent, getEventRegistrations,
  getCoordinatorStats, getCoordinatorVolunteers
}
