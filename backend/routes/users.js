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
    res.json({
      message: 'User assigned as ' + assignedRole + '!',
      user: result.rows[0]
    })
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

module.exports = router