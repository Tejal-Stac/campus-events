const pool = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const register = async (req, res) => {
  const {
    firstName, lastName, email, password,
    role, department, division, year,
    grNumber, campus, phone, designation, interests
  } = req.body

  try {
    const existing = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    )
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Dean Role Logic: If role is 'faculty' and designation is 'Dean', upgrade to 'dean'
    let finalRole = role
    if (role === 'faculty' && designation && designation.toLowerCase() === 'dean') {
      finalRole = 'dean'
    }

    const result = await pool.query(
      `INSERT INTO users 
        (first_name, last_name, email, password, role, department, 
         division, year, gr_number, campus, phone, designation, interests)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id, first_name, last_name, email, role, campus, department, gr_number, designation`,
      [firstName, lastName, email, hashedPassword, finalRole, department,
       division, year, grNumber, campus, phone, designation,
       JSON.stringify(interests || [])]
    )

    const userResponse = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      role: result.rows[0].role,
      firstName: result.rows[0].first_name,
      lastName: result.rows[0].last_name,
      campus: result.rows[0].campus,
      department: result.rows[0].department,
      grNumber: result.rows[0].gr_number,
      designation: result.rows[0].designation
    }

    console.log('✅ Registration successful for:', userResponse.email, '| Role:', userResponse.role)

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: { user: userResponse }
    })

  } catch (err) {
    console.error('REGISTER ERROR:', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
}

const login = async (req, res) => {
  const { email, password, role } = req.body

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    )

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'User not found' })
    }

    const user = result.rows[0]

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' })
    }

    const userRole = user.assigned_role || user.role
    if (userRole !== role) {
      return res.status(400).json({ message: 'You are not registered as ' + role })
    }

    // Standardized user object for frontend
    const userResponse = {
      id: user.id,
      email: user.email,
      role: userRole, // Always use 'role' key (mapped from assigned_role if needed)
      firstName: user.first_name,
      lastName: user.last_name,
      campus: user.campus,
      department: user.department,
      grNumber: user.gr_number,
      designation: user.designation
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    console.log('✅ Login successful for:', userResponse.email, '| Role:', userResponse.role)

    res.json({
      success: true,
      message: 'Login successful!',
      data: { token, user: userResponse }
    })

  } catch (err) {
    console.error('LOGIN ERROR:', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
}


// Get current user's profile (full data)
const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u1.id, u1.first_name, u1.last_name, u1.email, u1.role, u1.assigned_role, 
              u1.department, u1.division, u1.year, u1.gr_number, u1.campus, u1.phone, 
              u1.designation, u1.interests, u1.created_at,
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

    // Format response with camelCase for frontend
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
      promotedByName: user.promoted_by_name,
      points: 0, // TODO: Calculate from events/activities
      createdAt: user.created_at
    }

    res.json({ success: true, data: userResponse })
  } catch (err) {
    console.error('GET PROFILE ERROR:', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { register, login, getProfile }
