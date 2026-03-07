const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const {
  getAllEvents, getEventById, createEvent,
  updateEventStatus, registerForEvent, getEventRegistrations
} = require('../controllers/eventController')

router.get('/', getAllEvents)
router.get('/:id', getEventById)
router.post('/', auth, createEvent)
router.put('/:id/status', auth, updateEventStatus)
router.post('/:id/register', auth, registerForEvent)
router.get('/:id/registrations', auth, getEventRegistrations)

module.exports = router