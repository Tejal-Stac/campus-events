// ============================================================
// FILE: backend/routes/hodRoutes.js  (COMPLETE)
// ============================================================
/*
const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middleware/auth')
const {
  getHodStudents,
  getHodEvents,
  getHodAnalytics,
  getEventStats
} = require('../controllers/hodController')
 
router.use(authenticateToken)
 
// Middleware: only HOD/faculty can access
router.use((req, res, next) => {
  if (!['hod', 'faculty', 'dean', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied' })
  }
  next()
})
 
router.get('/students',         getHodStudents)
router.get('/events',           getHodEvents)
router.get('/analytics',        getHodAnalytics)
router.get('/event/:id/stats',  getEventStats)
 
module.exports = router
*/
 
 
// ============================================================
// SQL MIGRATION — run once in your PostgreSQL database
// ============================================================
/*
-- Add bio column to users if not already there
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
 
-- Update existing HODs to have bio
UPDATE users
SET bio = 'Head of Department of ' || department
WHERE role = 'hod' AND bio IS NULL AND department IS NOT NULL;
 
-- Update sandeep@vit.edu specifically
UPDATE users
SET role = 'hod',
    department = 'Computer Engineering',
    bio = 'Head of Department of Computer Engineering'
WHERE email = 'sandeep@vit.edu';
 
-- Verify
SELECT id, email, role, department, designation, bio FROM users WHERE role = 'hod';
*/