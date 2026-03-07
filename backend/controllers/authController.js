<<<<<<< HEAD
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  console.log('🔵 authController.register - Request Body:', req.body);
  const { name, email, password, role } = req.body;
  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role || 'student']
    );
    
    const token = jwt.sign(
      { id: result.rows[0].id, role: result.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ token, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  console.log('🔵 authController.login - Request Body:', req.body);
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
=======
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
>>>>>>> a1ebcb0 (Connect frontend to backend - Register and Login with PostgreSQL)
