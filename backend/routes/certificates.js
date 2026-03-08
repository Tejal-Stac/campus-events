const express = require('express')
const router = express.Router()
const PDFDocument = require('pdfkit')
const pool = require('../config/db')
const auth = require('../middleware/auth')

router.get('/generate/:eventId', auth, async (req, res) => {
  try {
    const studentId = req.user.id
    const eventId = req.params.eventId

    // Get student info
    const student = await pool.query(
      'SELECT * FROM users WHERE id = $1', [studentId]
    )
    if (student.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' })
    }

    // Get event info
    const event = await pool.query(
      'SELECT * FROM events WHERE id = $1', [eventId]
    )
    if (event.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' })
    }

    // Check registration — tries both student_id and user_id column names
    let reg
    try {
      reg = await pool.query(
        'SELECT * FROM registrations WHERE event_id = $1 AND student_id = $2',
        [eventId, studentId]
      )
    } catch (colErr) {
      // Fallback: try user_id column
      reg = await pool.query(
        'SELECT * FROM registrations WHERE event_id = $1 AND user_id = $2',
        [eventId, studentId]
      )
    }

    if (reg.rows.length === 0) {
      return res.status(403).json({ message: 'You are not registered for this event' })
    }

    const s = student.rows[0]
    const e = event.rows[0]

    // Support both name formats: first_name/last_name OR single name column
    const studentName = s.first_name
      ? `${s.first_name} ${s.last_name || ''}`.trim()
      : (s.name || 'Student')

    const eventName = e.title
    const eventDate = e.date ? new Date(e.date).toDateString() : 'N/A'
    const department = s.department || ''
    const grNumber = s.gr_number || s.gr_no || ''
    const organisingClub = e.organising_club || e.organizing_club || 'VIT Pune'

    // ── Generate PDF ──────────────────────────────────────────────
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 60, right: 60 }
    })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${studentName.replace(/ /g, '_')}.pdf`)
    doc.pipe(res)

    const W = doc.page.width
    const H = doc.page.height

    // Background
    doc.rect(0, 0, W, H).fill('#f0f4ff')

    // Outer border
    doc.rect(20, 20, W - 40, H - 40)
      .lineWidth(4).strokeColor('#1a3a6b').stroke()

    // Inner border
    doc.rect(30, 30, W - 60, H - 60)
      .lineWidth(1).strokeColor('#93c5fd').stroke()

    // Header band
    doc.rect(20, 20, W - 40, 80).fill('#1a3a6b')

    // College name
    doc.fontSize(20).fillColor('#ffffff').font('Helvetica-Bold')
      .text('VISHWAKARMA INSTITUTE OF TECHNOLOGY, PUNE', 0, 36, { align: 'center' })

    doc.fontSize(11).fillColor('#93c5fd').font('Helvetica')
      .text('An Autonomous Institute | Affiliated to Savitribai Phule Pune University', 0, 63, { align: 'center' })

    // Certificate title
    doc.fontSize(30).fillColor('#1a3a6b').font('Helvetica-Bold')
      .text('CERTIFICATE OF PARTICIPATION', 0, 118, { align: 'center' })

    // Decorative divider
    doc.moveTo(150, 162).lineTo(W - 150, 162)
      .lineWidth(2).strokeColor('#1a3a6b').stroke()

    // Certify text
    doc.fontSize(14).fillColor('#475569').font('Helvetica')
      .text('This is to proudly certify that', 0, 180, { align: 'center' })

    // Student name
    doc.fontSize(34).fillColor('#1a3a6b').font('Helvetica-Bold')
      .text(studentName, 0, 205, { align: 'center' })

    // Underline
    const nameW = Math.min(doc.widthOfString(studentName) * 1.1, W - 200)
    const nameX = (W - nameW) / 2
    doc.moveTo(nameX, 248).lineTo(nameX + nameW, 248)
      .lineWidth(1.5).strokeColor('#1a3a6b').stroke()

    // Dept / GR
    const subInfo = [department, grNumber ? `GR No: ${grNumber}` : ''].filter(Boolean).join('  |  ')
    if (subInfo) {
      doc.fontSize(12).fillColor('#64748b').font('Helvetica')
        .text(subInfo, 0, 256, { align: 'center' })
    }

    // Participation line
    doc.fontSize(14).fillColor('#475569').font('Helvetica')
      .text('has successfully participated in', 0, 282, { align: 'center' })

    // Event name
    doc.fontSize(22).fillColor('#2563eb').font('Helvetica-Bold')
      .text(eventName, 0, 308, { align: 'center' })

    // Organised by + date
    doc.fontSize(12).fillColor('#64748b').font('Helvetica')
      .text(`Organised by: ${organisingClub}`, 0, 342, { align: 'center' })
    doc.fontSize(12).fillColor('#64748b')
      .text(`Date: ${eventDate}`, 0, 360, { align: 'center' })

    // Signature divider
    doc.moveTo(150, 393).lineTo(W - 150, 393)
      .lineWidth(1).strokeColor('#93c5fd').stroke()

    // Signatures
    const sigY = 410
    doc.fontSize(11).fillColor('#1a3a6b').font('Helvetica-Bold')
    doc.text('_______________________', 120, sigY)
    doc.text('Event Coordinator', 140, sigY + 18)
    doc.fontSize(10).font('Helvetica').fillColor('#64748b')
    doc.text('VIT Pune', 165, sigY + 33)

    doc.fontSize(11).fillColor('#1a3a6b').font('Helvetica-Bold')
    doc.text('_______________________', W - 260, sigY)
    doc.text('Dean of Student Affairs', W - 245, sigY + 18)
    doc.fontSize(10).font('Helvetica').fillColor('#64748b')
    doc.text('VIT Pune', W - 215, sigY + 33)

    // Certificate ID
    const certId = `VIT-CERT-${eventId}-${studentId}-${Date.now()}`
    doc.fontSize(9).fillColor('#94a3b8').font('Helvetica')
      .text(`Certificate ID: ${certId}`, 0, H - 45, { align: 'center' })

    doc.end()

  } catch (err) {
    console.error('CERTIFICATE ERROR:', err.message)
    if (!res.headersSent) {
      res.status(500).json({ message: err.message })
    }
  }
})

module.exports = router