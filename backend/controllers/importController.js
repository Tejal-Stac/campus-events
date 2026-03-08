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
    const parsed = await xml2js.parseStringPromise(xmlData, { explicitArray: true });

    console.log('📋 Parsed XML structure:', JSON.stringify(parsed, null, 2));

    const root = parsed.students || parsed.data || parsed.root;
    if (!root) return res.status(400).json({ message: 'Invalid XML. Root element must be <students>, <data>, or <root>' });

    // Handle both single student and array of students
    let rows = [];
    if (root.student) {
      rows = Array.isArray(root.student) ? root.student : [root.student];
    } else if (root.row) {
      rows = Array.isArray(root.row) ? root.row : [root.row];
    } else {
      return res.status(400).json({ message: 'No student data found in XML. Expected <student> or <row> tags.' });
    }

    let imported = 0, skipped = 0;

    for (const row of rows) {
      // Safety check: ensure row exists
      if (!row) { 
        skipped++; 
        continue; 
      }

      // Helper function to extract value from xml2js array format
      const getValue = (field) => {
        if (!field) return '';
        if (Array.isArray(field)) return field[0] || '';
        return field.toString();
      };

      // Extract fields - handle both array format (xml2js with explicitArray: true) and object format
      const first_name = getValue(row.first_name || row.firstName);
      const last_name = getValue(row.last_name || row.lastName);
      const email = getValue(row.email);
      const password = getValue(row.password);
      const department = getValue(row.department) || null;
      const gr_number = getValue(row.gr_number || row.grNumber) || null;
      const role = getValue(row.role) || 'student';

      if (!first_name || !email || !password) { 
        console.log(`⚠️  Skipping row: missing required fields`, { first_name, email, password: password ? '***' : '' });
        skipped++; 
        continue; 
      }

      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) { 
        console.log(`⚠️  Skipping ${email}: already exists`);
        skipped++; 
        continue; 
      }

      const hashedPassword = await bcrypt.hash(String(password), 10);
      await pool.query(
        'INSERT INTO users (first_name, last_name, email, password, role, department, gr_number) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [first_name, last_name || '', email, hashedPassword, role, department, gr_number]
      );
      console.log(`✅ Imported student: ${first_name} ${last_name} (${email})`);
      imported++;
    }

    res.json({ message: 'XML Import complete', imported, skipped });
  } catch (err) {
    console.error('❌ XML Import Error:', err);
    res.status(500).json({ message: 'XML Import failed', error: err.message, stack: err.stack });
  }
};

exports.importEventsXML = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const xmlData = fs.readFileSync(req.file.path, 'utf8');
    const parsed = await xml2js.parseStringPromise(xmlData, { explicitArray: true });

    console.log('📋 Parsed Events XML structure:', JSON.stringify(parsed, null, 2));

    const root = parsed.events || parsed.data || parsed.root;
    if (!root) return res.status(400).json({ message: 'Invalid XML. Root element must be <events>, <data>, or <root>' });

    // Handle both single event and array of events
    let rows = [];
    if (root.event) {
      rows = Array.isArray(root.event) ? root.event : [root.event];
    } else if (root.row) {
      rows = Array.isArray(root.row) ? root.row : [root.row];
    } else {
      return res.status(400).json({ message: 'No event data found in XML. Expected <event> or <row> tags.' });
    }

    let imported = 0, skipped = 0;

    for (const row of rows) {
      // Safety check: ensure row exists
      if (!row) { 
        skipped++; 
        continue; 
      }

      // Helper function to extract value from xml2js array format
      const getValue = (field) => {
        if (!field) return '';
        if (Array.isArray(field)) return field[0] || '';
        return field.toString();
      };

      // Extract all fields - handle both array format and object format
      const title = getValue(row.title);
      const organising_club = getValue(row.organising_club || row.organisingClub);
      const sa_vertical = getValue(row.sa_vertical || row.saVertical);
      const date = getValue(row.date);
      const day = getValue(row.day);
      const time_from = getValue(row.time_from || row.timeFrom);
      const time_to = getValue(row.time_to || row.timeTo);
      const venue = getValue(row.venue);
      const online_link = getValue(row.online_link || row.onlineLink);
      const target_audience = getValue(row.target_audience || row.targetAudience);
      const expected_count = parseInt(getValue(row.expected_count || row.expectedCount)) || 0;
      const seats = parseInt(getValue(row.seats || row.total_seats)) || 100;
      const fees = getValue(row.fees) || 'Free';
      const contact = getValue(row.contact || row.contact_no);
      const category = getValue(row.category) || 'general';
      const key_features = getValue(row.key_features || row.keyFeatures);
      const description = getValue(row.description || row.desc);
      const department = getValue(row.department) || null;
      const contact_number = getValue(row.contact_number || row.contactNumber || row.contact_no) || contact || null;

      if (!title || !date) { 
        console.log(`⚠️  Skipping event: missing title or date`, { title, date });
        skipped++; 
        continue; 
      }

      await pool.query(
        `INSERT INTO events 
          (title, organising_club, sa_vertical, date, day, time_from, time_to,
           venue, online_link, target_audience, expected_count, seats, fees,
           contact, category, key_features, description, created_by, status, department, contact_number)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
        [
          title, organising_club, sa_vertical,
          date, day, time_from, time_to,
          venue, online_link, target_audience,
          expected_count, seats, fees,
          contact, category, key_features,
          description, req.user.id, 'pending',
          department, contact_number
        ]
      );
      console.log(`✅ Imported event: ${title} on ${date}`);
      imported++;
    }

    res.json({ message: 'XML Import complete', imported, skipped });
  } catch (err) {
    console.error('❌ XML Import Error:', err);
    res.status(500).json({ message: 'XML Import failed', error: err.message, stack: err.stack });
  }
};