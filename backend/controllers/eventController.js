const pool = require('../config/db');
exports.getAllEvents = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY date ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.createEvent = async (req, res) => {
  const { title, description, date, location, category, max_participants } = req.body;
  try {
    const result = await pool.query('INSERT INTO events (title, description, date, location, category, max_participants, created_by) VALUES (' + ',,,,,,) RETURNING *', [title, description, date, location, category, max_participants, req.user.id]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};
exports.registerForEvent = async (req, res) => {
  const { event_id } = req.body;
  try {
    const existing = await pool.query('SELECT * FROM registrations WHERE user_id = ' + ' AND event_id = ', [req.user.id, event_id]);
    if (existing.rows.length > 0) return res.status(400).json({ message: 'Already registered' });
    await pool.query('INSERT INTO registrations (user_id, event_id) VALUES (' + ',)', [req.user.id, event_id]);
    res.status(201).json({ message: 'Registered successfully!' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
};