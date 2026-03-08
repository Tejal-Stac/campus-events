const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const auth = require('../middleware/auth')

// Middleware to check if user is Dean
const isDean = (req, res, next) => {
  if (req.user.role !== 'dean') {
    return res.status(403).json({ message: 'Access denied. Dean role required.' })
  }
  next()
}

// Get current user's profile (alias for auth profile endpoint)
router.get('/profile', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u1.id, u1.first_name, u1.last_name, u1.email, u1.role, u1.assigned_role, 
              u1.department, u1.division, u1.year, u1.gr_number, u1.campus, u1.phone, 
              u1.designation, u1.interests, u1.organising_club, u1.assigned_event_id, u1.created_at,
              (u2.first_name || ' ' || u2.last_name) AS promoted_by_name
       FROM users u1
       LEFT JOIN users u2 ON u1.promoted_by = u2.id
       WHERE u1.id = $1`,
      [req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const user = result.rows[0]
    const userRole = user.assigned_role || user.role

    const userResponse = {
      id: user.id,
      email: user.email,
      role: userRole,
      firstName: user.first_name,
      lastName: user.last_name,
      name: `${user.first_name} ${user.last_name}`,
      campus: user.campus,
      department: user.department,
      division: user.division,
      year: user.year,
      grNumber: user.gr_number,
      phone: user.phone,
      designation: user.designation,
      interests: user.interests,
      organisingClub: user.organising_club,
      assignedEventId: user.assigned_event_id,
      promotedByName: user.promoted_by_name,
      points: 0, // TODO: Calculate from events/activities
      createdAt: user.created_at
    }

    res.json({ success: true, data: userResponse })
  } catch (err) {
    console.error('GET PROFILE ERROR:', err.message)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
})

// Get user's registered events
router.get('/my-registrations', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, r.registered_at, r.status as registration_status
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE r.user_id = $1
       ORDER BY e.date DESC`,
      [req.user.id]
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    console.error('GET REGISTRATIONS ERROR:', err.message)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
})

// Get all students (Dean only)
router.get('/students', auth, isDean, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, role, assigned_role, 
              department, division, year, gr_number, campus, phone, created_at
       FROM users 
       WHERE role = 'student'
       ORDER BY first_name, last_name`
    )
    
    // Format response with camelCase
    const students = result.rows.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      assignedRole: user.assigned_role,
      firstName: user.first_name,
      lastName: user.last_name,
      name: `${user.first_name} ${user.last_name}`,
      campus: user.campus,
      department: user.department,
      division: user.division,
      year: user.year,
      grNumber: user.gr_number,
      phone: user.phone,
      createdAt: user.created_at
    }))

    res.json({ success: true, data: students })
  } catch (err) {
    console.error('GET STUDENTS ERROR:', err.message)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
})

// Promote a student to coordinator or volunteer (Dean only)
router.put('/:id/promote', auth, isDean, async (req, res) => {
  const { assignedRole } = req.body
  const userId = req.params.id

  // Validate assigned role
  if (!['coordinator', 'volunteer'].includes(assignedRole)) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid role. Can only promote to coordinator or volunteer.' 
    })
  }

  try {
    // Verify user exists and is a student
    const userCheck = await pool.query(
      'SELECT id, role, first_name, last_name FROM users WHERE id = $1',
      [userId]
    )

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    if (userCheck.rows[0].role !== 'student') {
      return res.status(400).json({ 
        success: false,
        message: 'Can only promote students. User is not a student.' 
      })
    }

    // Update assigned_role and promoted_by (set to Dean's ID)
    const result = await pool.query(
      `UPDATE users 
       SET assigned_role = $1, promoted_by = $2, updated_at = NOW()
       WHERE id = $3 
       RETURNING id, first_name, last_name, email, role, assigned_role`,
      [assignedRole, req.user.id, userId]
    )

    const updatedUser = result.rows[0]

    console.log(`✅ Dean ${req.user.email} promoted ${updatedUser.first_name} ${updatedUser.last_name} to ${assignedRole}`)

    res.json({
      success: true,
      message: `${updatedUser.first_name} ${updatedUser.last_name} has been promoted to ${assignedRole}!`,
      data: {
        user: {
          id: updatedUser.id,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          email: updatedUser.email,
          role: updatedUser.role,
          assignedRole: updatedUser.assigned_role
        }
      }
    })
  } catch (err) {
    console.error('PROMOTE USER ERROR:', err.message)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
})

// Get all users (admin access)
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, first_name, last_name, email, role, assigned_role, department, campus, gr_number, designation FROM users ORDER BY created_at DESC'
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// Update user role (Coordinator can upgrade students to volunteers)
router.put('/update-role', auth, async (req, res) => {
  const { userId, role, eventId } = req.body

  // Validate role
  if (!['volunteer', 'student'].includes(role)) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid role. Can only set volunteer or student.' 
    })
  }

  try {
    // Check if user exists
    const userCheck = await pool.query(
      'SELECT id, role, first_name, last_name FROM users WHERE id = $1',
      [userId]
    )

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    // Update assigned_role and optionally assigned_event_id
    const updateQuery = eventId 
      ? 'UPDATE users SET assigned_role = $1, assigned_event_id = $2 WHERE id = $3 RETURNING *'
      : 'UPDATE users SET assigned_role = $1, assigned_event_id = NULL WHERE id = $2 RETURNING *'
    
    const params = eventId ? [role, eventId, userId] : [role, userId]
    const result = await pool.query(updateQuery, params)

    const updatedUser = result.rows[0]
    console.log(`✅ User ${updatedUser.first_name} role updated to ${role} by coordinator ${req.user.email}`)

    res.json({
      success: true,
      message: `${updatedUser.first_name} ${updatedUser.last_name} is now a ${role}!`,
      data: {
        id: updatedUser.id,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        role: updatedUser.assigned_role || updatedUser.role
      }
    })
  } catch (err) {
    console.error('UPDATE ROLE ERROR:', err.message)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
})

// Assign role to user (admin access)
router.put('/:id/assign-role', auth, async (req, res) => {
  const { assignedRole } = req.body
  try {
    const result = await pool.query(
      'UPDATE users SET assigned_role = $1 WHERE id = $2 RETURNING *',
      [assignedRole, req.params.id]
    )
    res.json({ message: 'User assigned as ' + assignedRole + '!', user: result.rows[0] })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// Remove assigned role from user (admin access)
router.put('/:id/remove-role', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE users SET assigned_role = NULL WHERE id = $1 RETURNING *',
      [req.params.id]
    )
    res.json({ message: 'Role removed!', user: result.rows[0] })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})
// PUT /api/users/:id - Update user profile
router.put('/:id', auth, async (req, res) => {
  try {
    const { first_name, last_name, phone, department, year, bio, interests } = req.body
    const result = await pool.query(
      `UPDATE users SET first_name=$1, last_name=$2, phone=$3, department=$4, year=$5, bio=$6, interests=$7 WHERE id=$8 RETURNING *`,
      [first_name, last_name, phone, department, year, bio, JSON.stringify(interests || []), req.params.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' })
    res.json({ message: 'Profile updated', user: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router