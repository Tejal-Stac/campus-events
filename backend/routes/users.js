const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const auth = require('../middleware/auth')

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