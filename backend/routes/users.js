const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
router.get('/profile', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = ' + '', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;