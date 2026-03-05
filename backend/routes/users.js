const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

router.get('/profile', auth, async (req, res) => {
  console.log('🔵 users.profile - User:', req.user);
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, points FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/my-registrations', auth, async (req, res) => {
  console.log('🔵 users.my-registrations - User:', req.user);
  try {
    const result = await pool.query(
      `SELECT 
        e.id as event_id,
        e.title,
        e.description,
        e.date,
        e.location,
        e.category,
        r.created_at as registered_at
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.user_id = $1
      ORDER BY e.date ASC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  console.log('🔵 users.profile UPDATE - Body:', req.body);
  const { name, email, phone, branch, year, bio, interests, skills, social } = req.body;
  
  try {
    // Build dynamic query based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    if (email !== undefined) {
      updates.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount}`);
      values.push(phone);
      paramCount++;
    }
    if (branch !== undefined) {
      updates.push(`branch = $${paramCount}`);
      values.push(branch);
      paramCount++;
    }
    if (year !== undefined) {
      updates.push(`year = $${paramCount}`);
      values.push(year);
      paramCount++;
    }
    if (bio !== undefined) {
      updates.push(`bio = $${paramCount}`);
      values.push(bio);
      paramCount++;
    }
    if (interests !== undefined) {
      updates.push(`interests = $${paramCount}`);
      values.push(JSON.stringify(interests));
      paramCount++;
    }
    if (skills !== undefined) {
      updates.push(`skills = $${paramCount}`);
      values.push(JSON.stringify(skills));
      paramCount++;
    }
    if (social !== undefined) {
      updates.push(`social = $${paramCount}`);
      values.push(JSON.stringify(social));
      paramCount++;
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    values.push(req.user.id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, name, email, phone, branch, year, bio, interests, skills, social, role, points`;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/points', auth, async (req, res) => {
  console.log('🔵 users.points - User:', req.user);
  try {
    const result = await pool.query(
      'SELECT points FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json({ points: result.rows[0]?.points || 0 });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;