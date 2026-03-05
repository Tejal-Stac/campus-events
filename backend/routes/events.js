const express = require('express');
const router = express.Router();
const { getAllEvents, createEvent, registerForEvent } = require('../controllers/eventController');
const auth = require('../middleware/auth');
router.get('/', getAllEvents);
router.post('/', auth, createEvent);
router.post('/register', auth, registerForEvent);
module.exports = router;