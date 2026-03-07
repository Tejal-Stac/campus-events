<<<<<<< HEAD
const pool = require('../config/db');

exports.getAllEvents = async (req, res) => {
  console.log('🔵 eventController.getAllEvents - Fetching all events');
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY date ASC');
    res.json(result.rows);
  } catch (err) { 
    res.status(500).json({ message: 'Server error', error: err.message }); 
  }
};

exports.createEvent = async (req, res) => {
  console.log('🔵 eventController.createEvent - Request Body:', req.body);
  console.log('🔵 eventController.createEvent - User:', req.user);
  const { title, description, date, location, category, max_participants } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO events (title, description, date, location, category, max_participants, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description, date, location, category, max_participants, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { 
    res.status(500).json({ message: 'Server error', error: err.message }); 
  }
};

/**
 * Register for Event with SQL Transaction
 * - Checks if user already registered
 * - Checks if event is full
 * - Increments registered_count in events table
 * - Adds 100 points to user profile
 * - Creates registration record
 * All operations are atomic (transaction)
 */
exports.registerForEvent = async (req, res) => {
  console.log('🔵 eventController.registerForEvent - Request Body:', req.body);
  console.log('🔵 eventController.registerForEvent - User:', req.user);
  const { event_id } = req.body;
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    // Check if already registered
    const existing = await client.query(
      'SELECT * FROM registrations WHERE user_id = $1 AND event_id = $2',
      [req.user.id, event_id]
    );
    
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Already registered for this event' });
    }
    
    // Check event capacity
    const eventCheck = await client.query(
      'SELECT max_participants, registered_count FROM events WHERE id = $1',
      [event_id]
    );
    
    if (eventCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const event = eventCheck.rows[0];
    const currentCount = event.registered_count || 0;
    
    if (currentCount >= event.max_participants) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Event is full' });
    }
    
    // Increment registered_count in events table
    await client.query(
      'UPDATE events SET registered_count = registered_count + 1 WHERE id = $1',
      [event_id]
    );
    
    // Add 100 points to user profile
    await client.query(
      'UPDATE users SET points = COALESCE(points, 0) + 100 WHERE id = $1',
      [req.user.id]
    );
    
    // Create registration record
    await client.query(
      'INSERT INTO registrations (user_id, event_id) VALUES ($1, $2)',
      [req.user.id, event_id]
    );
    
    // Commit transaction
    await client.query('COMMIT');
    
    res.status(201).json({ 
      message: 'Registered successfully! 100 points added to your profile.',
      points_earned: 100 
    });
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    client.release();
  }
};

/**
 * Get participants for a specific event (Club Heads)
 */
exports.getEventParticipants = async (req, res) => {
  console.log('🔵 eventController.getEventParticipants - Event ID:', req.params.eventId);
  const { eventId } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT 
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role,
        r.created_at as registered_at
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      WHERE r.event_id = $1
      ORDER BY r.created_at DESC`,
      [eventId]
    );
    
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * Get events created by current user (Coordinators/Club Heads)
 */
exports.getMyEvents = async (req, res) => {
  console.log('🔵 eventController.getMyEvents - User:', req.user);
  try {
    const result = await pool.query(
      'SELECT * FROM events WHERE created_by = $1 ORDER BY date DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
=======
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
>>>>>>> a1ebcb0 (Connect frontend to backend - Register and Login with PostgreSQL)
