const express = require('express')
const router = express.Router()
const PDFDocument = require('pdfkit')
const pool = require('../config/db')
const auth = require('../middleware/auth')
const { isDean, isFacultyOrDean } = require('../middleware/auth')
const {
  getAllEvents, getEventById, createEvent, updateEvent,
  updateEventStatus, registerForEvent, getEventRegistrations,
  getCoordinatorStats, getCoordinatorVolunteers
} = require('../controllers/eventController')

// Public routes
router.get('/', getAllEvents)
router.get('/:id', getEventById)

// Coordinator-specific routes
router.get('/coordinator/stats', auth, getCoordinatorStats)
router.get('/coordinator/volunteers', auth, getCoordinatorVolunteers)

// Protected routes - Manual event creation
router.post('/', auth, isFacultyOrDean, createEvent)
router.put('/:id', auth, isFacultyOrDean, updateEvent) // Faculty can edit their own events
router.put('/:id/status', auth, isDean, updateEventStatus) // Dean-only approval
router.post('/:id/register', auth, registerForEvent) // Legacy route
router.post('/register/:id', auth, registerForEvent) // New preferred route
router.get('/:id/registrations', auth, getEventRegistrations)

// Certificate generation route
router.get('/generate/:eventId', auth, async (req, res) => {
  try {
    const studentId = req.user.id
    const eventId = req.params.eventId

    // Get student info
    const student = await pool.query('SELECT * FROM users WHERE id = $1', [studentId])
    if (student.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' })
    }

    // Get event info
    const event = await pool.query('SELECT * FROM events WHERE id = $1', [eventId])
    if (event.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' })
    }

    const s = student.rows[0]
    const e = event.rows[0]
    const studentName = `${s.first_name} ${s.last_name}`
    const eventName = e.title
    const eventDate = e.date ? new Date(e.date).toDateString() : 'N/A'
    const department = s.department || ''
    const grNumber = s.gr_number || ''

    // Generate PDF
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 60, right: 60 }
    })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${studentName.replace(/ /g, '_')}.pdf`)
    doc.pipe(res)

    // Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f0f4ff')

    // Outer border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .lineWidth(4).strokeColor('#1a3a6b').stroke()

    // Inner border
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
      .lineWidth(1).strokeColor('#93c5fd').stroke()

    // Header background
    doc.rect(20, 20, doc.page.width - 40, 80).fill('#1a3a6b')

    // VIT Title
    doc.fontSize(22).fillColor('#ffffff').font('Helvetica-Bold')
      .text('VISHWAKARMA INSTITUTE OF TECHNOLOGY, PUNE', 0, 35, { align: 'center' })
    doc.fontSize(11).fillColor('#93c5fd').font('Helvetica')
      .text('An Autonomous Institute | Affiliated to Savitribai Phule Pune University', 0, 62, { align: 'center' })

    // Certificate Title
    doc.fontSize(32).fillColor('#1a3a6b').font('Helvetica-Bold')
      .text('CERTIFICATE OF PARTICIPATION', 0, 120, { align: 'center' })

    // Decorative line
    doc.moveTo(150, 165).lineTo(doc.page.width - 150, 165)
      .lineWidth(2).strokeColor('#1a3a6b').stroke()

    // Certify text
    doc.fontSize(14).fillColor('#475569').font('Helvetica')
      .text('This is to proudly certify that', 0, 185, { align: 'center' })

    // Student Name
    doc.fontSize(36).fillColor('#1a3a6b').font('Helvetica-Bold')
      .text(studentName, 0, 210, { align: 'center' })

    // Underline
    const nameWidth = doc.widthOfString(studentName) * 1.2
    const nameX = (doc.page.width - nameWidth) / 2
    doc.moveTo(nameX, 255).lineTo(nameX + nameWidth, 255)
      .lineWidth(1).strokeColor('#1a3a6b').stroke()

    // GR and Dept
    doc.fontSize(12).fillColor('#64748b').font('Helvetica')
      .text(`${department}  |  GR No: ${grNumber}`, 0, 262, { align: 'center' })

    // Participation text
    doc.fontSize(14).fillColor('#475569').font('Helvetica')
      .text('has successfully participated in', 0, 290, { align: 'center' })

    // Event Name
    doc.fontSize(24).fillColor('#2563eb').font('Helvetica-Bold')
      .text(eventName, 0, 315, { align: 'center' })

    // Organized by
    doc.fontSize(12).fillColor('#64748b').font('Helvetica')
      .text(`Organized by: ${e.organising_club || 'VIT Pune'}`, 0, 350, { align: 'center' })

    // Date
    doc.fontSize(12).fillColor('#64748b')
      .text(`Date: ${eventDate}`, 0, 370, { align: 'center' })

    // Divider
    doc.moveTo(150, 400).lineTo(doc.page.width - 150, 400)
      .lineWidth(1).strokeColor('#93c5fd').stroke()

    // Signatures
    const sigY = 420
    const sig1X = 120
    const sig2X = doc.page.width - 250

    doc.fontSize(11).fillColor('#1a3a6b').font('Helvetica-Bold')
    doc.text('_______________________', sig1X, sigY)
    doc.text('Event Coordinator', sig1X + 20, sigY + 18)
    doc.fontSize(10).font('Helvetica').fillColor('#64748b')
    doc.text('VIT Pune', sig1X + 45, sigY + 33)

    doc.fontSize(11).fillColor('#1a3a6b').font('Helvetica-Bold')
    doc.text('_______________________', sig2X, sigY)
    doc.text('Dean of Student Affairs', sig2X + 10, sigY + 18)
    doc.fontSize(10).font('Helvetica').fillColor('#64748b')
    doc.text('VIT Pune', sig2X + 45, sigY + 33)

    // Certificate ID
    const certId = `VIT-CERT-${eventId}-${studentId}-${Date.now()}`
    doc.fontSize(9).fillColor('#94a3b8').font('Helvetica')
      .text(`Certificate ID: ${certId}`, 0, doc.page.height - 45, { align: 'center' })

    doc.end()

  } catch (err) {
    console.error('CERTIFICATE ERROR:', err.message)
    res.status(500).json({ message: err.message })
  }
})

module.exports = router