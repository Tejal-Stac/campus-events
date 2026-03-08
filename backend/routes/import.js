const express = require('express');
const router = express.Router();
const { importStudents, importEvents, importStudentsXML, importEventsXML } = require('../controllers/importController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Excel routes
router.post('/students', auth, upload.single('file'), importStudents);
router.post('/events', auth, upload.single('file'), importEvents);

// XML routes
router.post('/students/xml', auth, upload.single('file'), importStudentsXML);
router.post('/events/xml', auth, upload.single('file'), importEventsXML);

module.exports = router;