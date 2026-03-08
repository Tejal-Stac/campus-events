const xml2js = require('xml2js');
const fs = require('fs');
const xlsx = require('xlsx');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

exports.importStudents = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    // DEBUG - will show exact column names from your Excel file
    if (data.length > 0) {
      console.log('Excel column names:', Object.keys(data[0]));
      console.log('First row:', data[0]);
    }

    let imported = 0, skipped = 0;

    for (const row of data) {
      const { first_name, last_name, email, password, department } = row;
      if (!first_name || !email || !password) { skipped++; continue; }

      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) { skipped++; continue; }

      const hashedPassword = await bcrypt.hash(String(password), 10);
      await pool.query(
        'INSERT INTO users (first_name, last_name, email, password, role, department) VALUES ($1, $2, $3, $4, $5, $6)',
        [first_name, last_name || '', email, hashedPassword, 'student', department || null]
      );
      imported++;
    }

    res.json({ message: 'Import complete', imported, skipped });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Import failed', error: err.message });
  }
};

exports.importEvents = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    let imported = 0, skipped = 0;

    for (const row of data) {
      const { title, description, date, location, category, max_participants } = row;
      if (!title || !date) { skipped++; continue; }

      await pool.query(
        'INSERT INTO events (title, description, date, location, category, max_participants, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [title, description || '', date, location || '', category || 'general', max_participants || 100, req.user.id]
      );
      imported++;
    }

    res.json({ message: 'Import complete', imported, skipped });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Import failed', error: err.message });
  }
};

exports.importStudentsXML = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const xmlData = fs.readFileSync(req.file.path, 'utf8');
    const parsed = await xml2js.parseStringPromise(xmlData, { explicitArray: false });

    const root = parsed.students || parsed.data || parsed.root;
    if (!root) return res.status(400).json({ message: 'Invalid XML. Root element must be <students>' });

    const rows = Array.isArray(root.student) ? root.student : [root.student];

    let imported = 0, skipped = 0;

    for (const row of rows) {
      const { first_name, last_name, email, password, department } = row;
      if (!first_name || !email || !password) { skipped++; continue; }

      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) { skipped++; continue; }

      const hashedPassword = await bcrypt.hash(String(password), 10);
      await pool.query(
        'INSERT INTO users (first_name, last_name, email, password, role, department) VALUES ($1, $2, $3, $4, $5, $6)',
        [first_name, last_name || '', email, hashedPassword, 'student', department || null]
      );
      imported++;
    }

    res.json({ message: 'XML Import complete', imported, skipped });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'XML Import failed', error: err.message });
  }
};

exports.importEventsXML = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const xmlData = fs.readFileSync(req.file.path, 'utf8');
    const parsed = await xml2js.parseStringPromise(xmlData, { explicitArray: false });

    const root = parsed.events || parsed.data || parsed.root;
    if (!root) return res.status(400).json({ message: 'Invalid XML. Root element must be <events>' });

    const rows = Array.isArray(root.event) ? root.event : [root.event];

    let imported = 0, skipped = 0;

    for (const row of rows) {
      const { title, organising_club, sa_vertical, date, day, time_from, time_to,
              venue, online_link, target_audience, expected_count, seats, fees,
              contact, category, key_features, description, faculty_id } = row;
      if (!title || !date) { skipped++; continue; }

      await pool.query(
        `INSERT INTO events 
          (title, organising_club, sa_vertical, date, day, time_from, time_to,
           venue, online_link, target_audience, expected_count, seats, fees,
           contact, category, key_features, description, faculty_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
        [
          title, organising_club || '', sa_vertical || '',
          date, day || '', time_from || '', time_to || '',
          venue || '', online_link || '', target_audience || '',
          expected_count || 0, seats || 100, fees || 0,
          contact || '', category || 'general', key_features || '',
          description || '', faculty_id || null
        ]
      );
      imported++;
    }

    res.json({ message: 'XML Import complete', imported, skipped });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'XML Import failed', error: err.message });
  }
};