const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const auth = require('../middleware/auth')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const xlsx = require('xlsx')
const bcrypt = require('bcryptjs')

const isDean = (req, res, next) => {
  if (req.user.role !== 'dean' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Dean access only' })
  }
  next()
}

// GET /api/dean/analytics
router.get('/analytics', auth, isDean, async (req, res) => {
  try {
    const deptStudents = await pool.query(
      `SELECT department, COUNT(*) AS student_count
       FROM users
       WHERE role = 'student' AND department IS NOT NULL AND department != ''
       GROUP BY department ORDER BY student_count DESC`
    )

    const totalStudents = deptStudents.rows.reduce(
      (sum, r) => sum + parseInt(r.student_count), 0
    )

    const deptRegistrations = await pool.query(
      `SELECT u.department, COUNT(r.id) AS reg_count
       FROM registrations r
       JOIN users u ON u.id = r.user_id
       WHERE u.department IS NOT NULL AND u.department != ''
       GROUP BY u.department ORDER BY reg_count DESC`
    )

    const deptMap = {}
    deptStudents.rows.forEach(r => {
      deptMap[r.department] = {
        department: r.department,
        studentCount: parseInt(r.student_count),
        registrationCount: 0,
        participationRate: 0
      }
    })
    deptRegistrations.rows.forEach(r => {
      if (deptMap[r.department]) {
        deptMap[r.department].registrationCount = parseInt(r.reg_count)
      } else {
        deptMap[r.department] = {
          department: r.department,
          studentCount: 0,
          registrationCount: parseInt(r.reg_count),
          participationRate: 0
        }
      }
    })

    Object.values(deptMap).forEach(d => {
      d.participationRate = d.studentCount > 0
        ? Math.round((d.registrationCount / d.studentCount) * 100)
        : 0
    })

    const departments = Object.values(deptMap).sort(
      (a, b) => b.registrationCount - a.registrationCount
    )

    const totalEvents = await pool.query(`SELECT COUNT(*) AS total FROM events`)
    const totalRegs = await pool.query(`SELECT COUNT(*) AS total FROM registrations`)

    const eventDeptStats = await pool.query(
      `SELECT e.id, e.title, e.date, e.category, e.event_type,
              u.department,
              COUNT(r.id) AS dept_count,
              (SELECT COUNT(*) FROM registrations WHERE event_id = e.id) AS total_count
       FROM events e
       JOIN registrations r ON r.event_id = e.id
       JOIN users u ON u.id = r.user_id
       WHERE u.department IS NOT NULL
       GROUP BY e.id, e.title, e.date, e.category, e.event_type, u.department
       ORDER BY e.date DESC, dept_count DESC
       LIMIT 100`
    )

    const eventsMap = {}
    eventDeptStats.rows.forEach(row => {
      if (!eventsMap[row.id]) {
        eventsMap[row.id] = {
          id: row.id,
          title: row.title,
          date: row.date,
          category: row.category,
          eventType: row.event_type,
          totalRegistrations: parseInt(row.total_count),
          deptBreakdown: []
        }
      }
      const total = parseInt(row.total_count)
      const deptCount = parseInt(row.dept_count)
      eventsMap[row.id].deptBreakdown.push({
        department: row.department,
        count: deptCount,
        percentage: total > 0 ? Math.round((deptCount / total) * 100) : 0
      })
    })

    res.json({
      success: true,
      data: {
        summary: {
          totalStudents,
          totalDepartments: departments.length,
          totalEvents: parseInt(totalEvents.rows[0].total),
          totalRegistrations: parseInt(totalRegs.rows[0].total)
        },
        departments,
        recentEventStats: Object.values(eventsMap).slice(0, 20)
      }
    })
  } catch (err) {
    console.error('DEAN ANALYTICS ERROR:', err.message)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
})

// GET /api/dean/students
router.get('/students', auth, isDean, async (req, res) => {
  try {
    const { department } = req.query
    let query = `
      SELECT id, first_name, last_name, email, department,
             division, year, gr_number, phone, role, assigned_role, created_at
      FROM users WHERE role = 'student'`
    const params = []
    if (department && department !== 'all') {
      query += ` AND department = $1`
      params.push(department)
    }
    query += ` ORDER BY department, first_name, last_name`
    const result = await pool.query(query, params)
    res.json({
      success: true,
      total: result.rows.length,
      data: result.rows.map(u => ({
        id: u.id,
        name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
        email: u.email,
        department: u.department,
        division: u.division,
        year: u.year,
        grNumber: u.gr_number,
        phone: u.phone,
        assignedRole: u.assigned_role,
        createdAt: u.created_at
      }))
    })
  } catch (err) {
    console.error('DEAN STUDENTS ERROR:', err.message)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
})

// GET /api/dean/faculties - List all faculty with coordinator assignments
router.get('/faculties', auth, isDean, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, department, designation,
              coordinator_type, created_at
       FROM users
       WHERE role = 'faculty'
       ORDER BY coordinator_type DESC, first_name, last_name`
    )
    
    const faculties = result.rows.map(f => ({
      id: f.id,
      name: `${f.first_name || ''} ${f.last_name || ''}`.trim(),
      email: f.email,
      department: f.department,
      designation: f.designation,
      coordinatorType: f.coordinator_type || 'none',
      createdAt: f.created_at
    }))

    // Build usedCategories map for exclusive selection
    const usedCategories = {}
    faculties.forEach(f => {
      if (f.coordinatorType && f.coordinatorType !== 'none') {
        usedCategories[f.coordinatorType] = f.id
      }
    })

    res.json({
      success: true,
      data: faculties,
      usedCategories
    })
  } catch (err) {
    console.error('DEAN FACULTIES ERROR:', err.message)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
})

// PUT /api/dean/faculties/:id/coordinator - Assign or update coordinator role
router.put('/faculties/:id/coordinator', auth, isDean, async (req, res) => {
  const { coordinatorType } = req.body
  const facultyId = req.params.id

  // Validate coordinator type
  const validTypes = ['Technical', 'Sports', 'Cultural', 'Other', 'none']
  if (!validTypes.includes(coordinatorType)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid coordinator type'
    })
  }

  try {
    // Start transaction
    await pool.query('BEGIN')

    try {
      // If assigning a non-none type, remove it from any other faculty
      if (coordinatorType !== 'none') {
        await pool.query(
          `UPDATE users
           SET coordinator_type = 'none'
           WHERE coordinator_type = $1 AND id != $2 AND role = 'faculty'`,
          [coordinatorType, facultyId]
        )
      }

      // Assign the new coordinator type to this faculty
      const result = await pool.query(
        `UPDATE users
         SET coordinator_type = $1
         WHERE id = $2 AND role = 'faculty'
         RETURNING id, first_name, last_name, email, coordinator_type`,
        [coordinatorType, facultyId]
      )

      if (result.rows.length === 0) {
        await pool.query('ROLLBACK')
        return res.status(404).json({
          success: false,
          message: 'Faculty member not found'
        })
      }

      await pool.query('COMMIT')

      const updated = result.rows[0]
      res.json({
        success: true,
        message: `Coordinator role updated to "${coordinatorType}"`,
        data: {
          id: updated.id,
          name: `${updated.first_name} ${updated.last_name}`,
          email: updated.email,
          coordinatorType: updated.coordinator_type
        }
      })
    } catch (err) {
      await pool.query('ROLLBACK')
      throw err
    }
  } catch (err) {
    console.error('UPDATE COORDINATOR ERROR:', err.message)
    res.status(500).json({ success: false, message: 'Server error', error: err.message })
  }
})

// ── CSV Bulk Import ────────────────────────────────────────────────────────
const csvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => cb(null, `import_${Date.now()}.csv`)
})
const csvUpload = multer({
  storage: csvStorage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === '.csv') cb(null, true)
    else cb(new Error('Only .csv files are accepted'), false)
  },
  limits: { fileSize: 5 * 1024 * 1024 }
})

// POST /api/dean/import/students
router.post('/import/students', auth, isDean, csvUpload.single('file'), async (req, res) => {
  const client = await pool.connect()
  let currentLine = 1
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No CSV file uploaded' })

    const workbook = xlsx.readFile(req.file.path)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' })

    if (rows.length === 0)
      return res.status(400).json({ success: false, message: 'CSV file has no data rows' })

    await client.query('BEGIN')

    for (let i = 0; i < rows.length; i++) {
      currentLine = i + 2
      const row = rows[i]
      const name       = String(row.name || '').trim()
      const email      = String(row.email || '').trim().toLowerCase()
      const roll_no    = String(row.roll_no || '').trim()
      const department = String(row.department || '').trim()
      const year       = parseInt(row.year_of_study) || null

      if (!name || !email)
        throw Object.assign(new Error(`Line ${currentLine}: Missing required fields — "name" and "email" are required`), { userFacing: true })
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw Object.assign(new Error(`Line ${currentLine}: Invalid email format — "${email}"`), { userFacing: true })

      const parts     = name.split(' ')
      const firstName = parts[0]
      const lastName  = parts.slice(1).join(' ') || ''
      const hashedPwd = await bcrypt.hash('Student@123', 10)

      await client.query(
        `INSERT INTO users (first_name, last_name, email, password, role, department, gr_number, year)
         VALUES ($1,$2,$3,$4,'student',$5,$6,$7)`,
        [firstName, lastName, email, hashedPwd, department || null, roll_no || null, year]
      )
    }

    await client.query('COMMIT')
    res.json({ success: true, message: `Successfully imported ${rows.length} student(s)`, imported: rows.length })
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    let msg = err.message
    if (err.code === '23505') {
      if ((err.constraint || '').includes('email'))
        msg = `Line ${currentLine}: Email already exists — ${err.detail || ''}`
      else if ((err.constraint || '').includes('gr_number'))
        msg = `Line ${currentLine}: Roll Number already exists — ${err.detail || ''}`
      else
        msg = `Line ${currentLine}: Duplicate entry — ${err.detail || err.message}`
    } else if (!err.userFacing) {
      msg = `Line ${currentLine}: DB error — ${err.message}`
    }
    console.error('BULK IMPORT STUDENTS ERROR:', err.message)
    res.status(409).json({ success: false, message: 'Import failed — batch rolled back', errors: [msg] })
  } finally {
    client.release()
    if (req.file?.path) try { fs.unlinkSync(req.file.path) } catch {}
  }
})

// POST /api/dean/import/faculty
router.post('/import/faculty', auth, isDean, csvUpload.single('file'), async (req, res) => {
  const client = await pool.connect()
  let currentLine = 1
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No CSV file uploaded' })

    const workbook = xlsx.readFile(req.file.path)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' })

    if (rows.length === 0)
      return res.status(400).json({ success: false, message: 'CSV file has no data rows' })

    await client.query('BEGIN')

    for (let i = 0; i < rows.length; i++) {
      currentLine = i + 2
      const row = rows[i]
      const name        = String(row.name || '').trim()
      const email       = String(row.email || '').trim().toLowerCase()
      const department  = String(row.department || '').trim()
      const designation = String(row.designation || '').trim()
      const employee_id = String(row.employee_id || '').trim()

      if (!name || !email)
        throw Object.assign(new Error(`Line ${currentLine}: Missing required fields — "name" and "email" are required`), { userFacing: true })
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw Object.assign(new Error(`Line ${currentLine}: Invalid email format — "${email}"`), { userFacing: true })

      const parts     = name.split(' ')
      const firstName = parts[0]
      const lastName  = parts.slice(1).join(' ') || ''
      const hashedPwd = await bcrypt.hash('Faculty@123', 10)

      await client.query(
        `INSERT INTO users (first_name, last_name, email, password, role, department, designation, gr_number)
         VALUES ($1,$2,$3,$4,'faculty',$5,$6,$7)`,
        [firstName, lastName, email, hashedPwd, department || null, designation || null, employee_id || null]
      )
    }

    await client.query('COMMIT')
    res.json({ success: true, message: `Successfully imported ${rows.length} faculty member(s)`, imported: rows.length })
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    let msg = err.message
    if (err.code === '23505') {
      if ((err.constraint || '').includes('email'))
        msg = `Line ${currentLine}: Email already exists — ${err.detail || ''}`
      else
        msg = `Line ${currentLine}: Duplicate entry — ${err.detail || err.message}`
    } else if (!err.userFacing) {
      msg = `Line ${currentLine}: DB error — ${err.message}`
    }
    console.error('BULK IMPORT FACULTY ERROR:', err.message)
    res.status(409).json({ success: false, message: 'Import failed — batch rolled back', errors: [msg] })
  } finally {
    client.release()
    if (req.file?.path) try { fs.unlinkSync(req.file.path) } catch {}
  }
})

module.exports = router