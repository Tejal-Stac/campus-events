const express = require('express')
const router = express.Router()
const PDFDocument = require('pdfkit')
const pool = require('../config/db')
const auth = require('../middleware/auth')
const { isDean, isFacultyOrDean, isFacultyOrDeanOrClubPresident } = require('../middleware/auth')
const optionalAuth = require('../middleware/optionalAuth')
const {
  getAllEvents, getPendingEvents, getEventById, createEvent,
  updateEventStatus, updateEventType,
  registerForEvent, getEventRegistrations,
  getCoordinatorStats, getCoordinatorVolunteers,
  getPendingApprovals, approveNonVitian, rejectNonVitian,
  getPendingEventsByCategory, approveEvent, rejectEvent, verifyStudentRegistration
} = require('../controllers/eventController')

// ─── General event routes ───────────────────────────────────────────────────
router.get('/', optionalAuth, getAllEvents)
router.post('/', auth, isFacultyOrDeanOrClubPresident, createEvent)

// ─── Coordinator routes ─────────────────────────────────────────────────────
router.get('/coordinator/stats', auth, getCoordinatorStats)
router.get('/coordinator/volunteers', auth, getCoordinatorVolunteers)
router.get('/coordinator/pending-approvals', auth, getPendingApprovals)
router.get('/coordinator/pending-events', auth, getPendingEventsByCategory)
router.put('/coordinator/approve/:userId', auth, approveNonVitian)
router.delete('/coordinator/reject/:userId', auth, rejectNonVitian)

// ─── Dean: pending events list ───────────────────────────────────────────────
router.get('/pending', auth, isDean, getPendingEvents)

// ─── ✅ FIX: Verify registration route ──────────────────────────────────────
// Frontend calls: PATCH /api/registrations/:id/verify
// This is mounted at /api/events, so the correct path here is:
//   PUT  /registrations/:registrationId/verify
//   PATCH /registrations/:registrationId/verify  ← frontend uses this
router.put('/registrations/:registrationId/verify', auth, verifyStudentRegistration)
router.patch('/registrations/:registrationId/verify', auth, verifyStudentRegistration)

// ─── Approve / Reject event (coordinator workflow) ──────────────────────────
router.put('/:eventId/approve', auth, approveEvent)
router.put('/:eventId/reject', auth, rejectEvent)

// ─── Certificate generation ─────────────────────────────────────────────────
router.get('/generate/:eventId', auth, async (req, res) => {
  try {
    const studentId = req.user.id
    const eventId = req.params.eventId
    const student = await pool.query('SELECT * FROM users WHERE id = $1', [studentId])
    if (student.rows.length === 0) return res.status(404).json({ message: 'Student not found' })
    const event = await pool.query('SELECT * FROM events WHERE id = $1', [eventId])
    if (event.rows.length === 0) return res.status(404).json({ message: 'Event not found' })
    const s = student.rows[0]
    const e = event.rows[0]
    const studentName = `${s.first_name} ${s.last_name}`
    const eventDate = e.date ? new Date(e.date).toDateString() : 'N/A'
    const department = s.department || ''
    const grNumber = s.gr_number || ''
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margins: { top: 50, bottom: 50, left: 60, right: 60 } })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${studentName.replace(/ /g, '_')}.pdf`)
    doc.pipe(res)
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f0f4ff')
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(4).strokeColor('#1a3a6b').stroke()
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).lineWidth(1).strokeColor('#93c5fd').stroke()
    doc.rect(20, 20, doc.page.width - 40, 80).fill('#1a3a6b')
    doc.fontSize(22).fillColor('#ffffff').font('Helvetica-Bold').text('VISHWAKARMA INSTITUTE OF TECHNOLOGY, PUNE', 0, 35, { align: 'center' })
    doc.fontSize(11).fillColor('#93c5fd').font('Helvetica').text('An Autonomous Institute | Affiliated to Savitribai Phule Pune University', 0, 62, { align: 'center' })
    doc.fontSize(32).fillColor('#1a3a6b').font('Helvetica-Bold').text('CERTIFICATE OF PARTICIPATION', 0, 120, { align: 'center' })
    doc.moveTo(150, 165).lineTo(doc.page.width - 150, 165).lineWidth(2).strokeColor('#1a3a6b').stroke()
    doc.fontSize(14).fillColor('#475569').font('Helvetica').text('This is to proudly certify that', 0, 185, { align: 'center' })
    doc.fontSize(36).fillColor('#1a3a6b').font('Helvetica-Bold').text(studentName, 0, 210, { align: 'center' })
    const nameWidth = doc.widthOfString(studentName) * 1.2
    const nameX = (doc.page.width - nameWidth) / 2
    doc.moveTo(nameX, 255).lineTo(nameX + nameWidth, 255).lineWidth(1).strokeColor('#1a3a6b').stroke()
    doc.fontSize(12).fillColor('#64748b').font('Helvetica').text(`${department}  |  GR No: ${grNumber}`, 0, 262, { align: 'center' })
    doc.fontSize(14).fillColor('#475569').font('Helvetica').text('has successfully participated in', 0, 290, { align: 'center' })
    doc.fontSize(24).fillColor('#2563eb').font('Helvetica-Bold').text(e.title, 0, 315, { align: 'center' })
    doc.fontSize(12).fillColor('#64748b').font('Helvetica').text(`Organized by: ${e.organising_club || 'VIT Pune'}`, 0, 350, { align: 'center' })
    doc.fontSize(12).fillColor('#64748b').text(`Date: ${eventDate}`, 0, 370, { align: 'center' })
    doc.moveTo(150, 400).lineTo(doc.page.width - 150, 400).lineWidth(1).strokeColor('#93c5fd').stroke()
    const sigY = 420
    const sig1X = 120
    const sig2X = doc.page.width - 250
    doc.fontSize(11).fillColor('#1a3a6b').font('Helvetica-Bold')
    doc.text('_______________________', sig1X, sigY)
    doc.text('Event Coordinator', sig1X + 20, sigY + 18)
    doc.fontSize(10).font('Helvetica').fillColor('#64748b').text('VIT Pune', sig1X + 45, sigY + 33)
    doc.fontSize(11).fillColor('#1a3a6b').font('Helvetica-Bold')
    doc.text('_______________________', sig2X, sigY)
    doc.text('Dean of Student Affairs', sig2X + 10, sigY + 18)
    doc.fontSize(10).font('Helvetica').fillColor('#64748b').text('VIT Pune', sig2X + 45, sigY + 33)
    doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text(`Certificate ID: VIT-CERT-${eventId}-${studentId}-${Date.now()}`, 0, doc.page.height - 45, { align: 'center' })
    doc.end()
  } catch (err) {
    console.error('CERTIFICATE ERROR:', err.message)
    res.status(500).json({ message: err.message })
  }
})

// ─── Single event CRUD ───────────────────────────────────────────────────────
router.get('/:id', getEventById)

router.put('/:eventId', auth, isFacultyOrDeanOrClubPresident, async (req, res) => {
  try {
    const { eventId } = req.params
    const { title, date, category, seats, venue, description, event_type, status } = req.body
    const result = await pool.query(
      `UPDATE events SET
         title=COALESCE($1,title), date=COALESCE($2,date), category=COALESCE($3,category),
         seats=COALESCE($4,seats), venue=COALESCE($5,venue), description=COALESCE($6,description),
         event_type=COALESCE($7,event_type), status=COALESCE($8,status)
       WHERE id=$9 RETURNING *`,
      [title, date, category, seats, venue, description, event_type, status, eventId]
    )
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Event not found' })
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    console.error('UPDATE EVENT ERROR:', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
})

router.put('/:id/status', auth, isDean, updateEventStatus)
router.patch('/:id/event-type', auth, updateEventType)

// ─── Registration routes ─────────────────────────────────────────────────────
router.post('/:id/register', optionalAuth, registerForEvent)
router.get('/:id/registrations', auth, getEventRegistrations)

// ─── Participants & Report ───────────────────────────────────────────────────
router.get('/:eventId/participants', auth, async (req, res) => {
  try {
    const { eventId } = req.params
    const result = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.department,
              u.division, u.year, u.gr_number, u.phone, u.college_type,
              r.registered_at, r.status
       FROM registrations r
       JOIN users u ON u.id = r.user_id
       WHERE r.event_id = $1
       ORDER BY u.first_name`,
      [eventId]
    )
    const participants = result.rows.map(u => ({
      id: u.id,
      name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
      email: u.email,
      department: u.department,
      division: u.division,
      year: u.year,
      phone: u.phone,
      college_type: u.college_type,
      registered_at: u.registered_at
    }))
    res.json({ success: true, data: participants })
  } catch (err) {
    console.error('PARTICIPANTS ERROR:', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
})

router.get('/:eventId/report', auth, async (req, res) => {
  try {
    const { eventId } = req.params
    const event = await pool.query('SELECT * FROM events WHERE id = $1', [eventId])
    if (event.rows.length === 0) return res.status(404).json({ message: 'Event not found' })
    const registrations = await pool.query(
      `SELECT u.first_name, u.last_name, u.email, u.department, u.year, r.registered_at
       FROM registrations r JOIN users u ON u.id = r.user_id
       WHERE r.event_id = $1 ORDER BY u.first_name`,
      [eventId]
    )
    res.json({ success: true, event: event.rows[0], registrations: registrations.rows, total: registrations.rows.length })
  } catch (err) {
    console.error('REPORT ERROR:', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router