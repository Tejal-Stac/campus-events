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