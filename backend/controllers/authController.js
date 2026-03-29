const pool = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const register = async (req, res) => {
  const {
    firstName, lastName, email, password,
    role, department, division, year,
    grNumber, campus, phone, designation, interests,
    college_name, college_email
  } = req.body

  try {
    const existing = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    )
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Dean Role Logic
    let finalRole = role
    if (role === 'faculty' && designation && designation.toLowerCase() === 'dean') {
      finalRole = 'dean'
    }

    // Non-VITian detection
    const isVitian = email.endsWith('@vit.edu')
    const userCollegeType = isVitian ? 'vitian' : 'non_vitian'
    const isApproved = isVitian

    if (!isVitian && !college_name) {
      return res.status(400).json({ message: 'College name is required for non-VIT students' })
    }

    const result = await pool.query(
      `INSERT INTO users
        (first_name, last_name, email, password, role, department,
         division, year, gr_number, campus, phone, designation, interests,
         college_type, college_name, college_email, is_approved)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING id, first_name, last_name, email, role, campus, department,
                 gr_number, designation, is_approved, college_type, college_name`,
      [firstName, lastName, email, hashedPassword, finalRole, department,
       division, year, grNumber, campus, phone, designation,
       JSON.stringify(interests || []),
       userCollegeType, college_name || null, college_email || null, isApproved]
    )

    // Block non-VITians from getting token until approved
    if (!result.rows[0].is_approved) {
      return res.status(201).json({
        success: true,
        pending: true,
        message: 'Registration submitted! Awaiting coordinator approval.'
      })
    }

    const userResponse = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      role: result.rows[0].role,
      firstName: result.rows[0].first_name,
      lastName: result.rows[0].last_name,
      campus: result.rows[0].campus,
      department: result.rows[0].department,
      grNumber: result.rows[0].gr_number,
      designation: result.rows[0].designation,
      // ✅ FIX: include college info so frontend knows if user is VITian
      college_type: result.rows[0].college_type,
      college_name: result.rows[0].college_name,
      is_vitian: result.rows[0].college_type === 'vitian',
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

    // Block unapproved non-VITians
    if (user.is_approved === false) {
      return res.status(403).json({
        message: 'Your account is pending coordinator approval.'
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' })
    }

    const userRole = user.assigned_role || user.role
    if (userRole !== role) {
      return res.status(400).json({ message: 'You are not registered as ' + role })
    }

    // ✅ FIX: derive is_vitian from college_type column
    // Falls back to checking email if college_type not yet set (for old accounts)
    const collegeType = user.college_type || (user.email.endsWith('@vit.edu') ? 'vitian' : 'non_vitian')

    const userResponse = {
      id: user.id,
      email: user.email,
      role: userRole,
      firstName: user.first_name,
      lastName: user.last_name,
      campus: user.campus,
      department: user.department,
      grNumber: user.gr_number,
      designation: user.designation,
      // ✅ FIX: these fields now included so Events.jsx isVITOnly works correctly
      college_type: collegeType,
      college_name: user.college_name || null,
      is_vitian: collegeType === 'vitian',
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    console.log('✅ Login successful for:', userResponse.email, '| Role:', userResponse.role, '| VITian:', userResponse.is_vitian)

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

const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u1.id, u1.first_name, u1.last_name, u1.email, u1.role, u1.assigned_role,
              u1.department, u1.division, u1.year, u1.gr_number, u1.campus, u1.phone,
              u1.designation, u1.interests, u1.created_at,
              u1.college_type, u1.college_name,
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
    const collegeType = user.college_type || (user.email.endsWith('@vit.edu') ? 'vitian' : 'non_vitian')

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
      collegeType: collegeType,
      college_type: collegeType,
      college_name: user.college_name,
      collegeName: user.college_name,
      // ✅ FIX: is_vitian included in profile too
      is_vitian: collegeType === 'vitian',
      points: 0,
      createdAt: user.created_at
    }

    res.json({ success: true, data: userResponse })
  } catch (err) {
    console.error('GET PROFILE ERROR:', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { register, login, getProfile }