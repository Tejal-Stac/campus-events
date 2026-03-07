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

    const result = await pool.query(
      `INSERT INTO users 
        (first_name, last_name, email, password, role, department, 
         division, year, gr_number, campus, phone, designation, interests)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id, first_name, last_name, email, role, campus`,
      [firstName, lastName, email, hashedPassword, role, department,
       division, year, grNumber, campus, phone, designation,
       JSON.stringify(interests || [])]
    )

    res.status(201).json({
      message: 'Registration successful!',
      user: result.rows[0]
    })

  } catch (err) {
    console.error('REGISTER ERROR:', err.message)
    res.status(500).json({ message: err.message })
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

    const token = jwt.sign(
      { id: user.id, email: user.email, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: userRole,
        campus: user.campus,
        department: user.department,
      }
    })

  } catch (err) {
    console.error('LOGIN ERROR:', err.message)
    res.status(500).json({ message: err.message })
  }
}

module.exports = { register, login }