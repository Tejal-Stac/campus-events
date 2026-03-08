const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { isDean, isFacultyOrDean } = require('../middleware/auth')
const {
  getAllEvents, getEventById, createEvent,
  updateEventStatus, registerForEvent, getEventRegistrations
} = require('../controllers/eventController')

// Public routes
router.get('/', getAllEvents)
router.get('/:id', getEventById)

// Protected routes
router.post('/', auth, isFacultyOrDean, createEvent)
router.put('/:id/status', auth, isDean, updateEventStatus) // Dean-only approval
router.post('/:id/register', auth, registerForEvent)
router.get('/:id/registrations', auth, getEventRegistrations)

module.exports = router