<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const { 
  getAllEvents, 
  createEvent, 
  registerForEvent,
  getEventParticipants,
  getMyEvents 
} = require('../controllers/eventController');
const auth = require('../middleware/auth');

router.get('/', getAllEvents);
router.post('/', auth, createEvent);
router.post('/register', auth, registerForEvent);
router.get('/my-events', auth, getMyEvents);
router.get('/:eventId/participants', auth, getEventParticipants);

module.exports = router;
=======
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
>>>>>>> a1ebcb0 (Connect frontend to backend - Register and Login with PostgreSQL)
