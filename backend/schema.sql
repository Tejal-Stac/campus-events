-- Campus Events Database Schema
-- PostgreSQL Schema for VIT Pune Campus Events System

-- Enable UUID extension (optional, if using UUIDs)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables (for clean setup)
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'student', -- student, club_head, coordinator, dean, admin
  points INTEGER DEFAULT 0, -- Points earned from events
  branch VARCHAR(100), -- CSE, IT, MECH, etc.
  year VARCHAR(20), -- 1st, 2nd, 3rd, 4th
  roll_no VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date TIMESTAMP NOT NULL,
  location VARCHAR(255),
  venue VARCHAR(255),
  category VARCHAR(100), -- Hackathon, Seminar, Workshop, Cultural, Sports, etc.
  max_participants INTEGER DEFAULT 100,
  registered_count INTEGER DEFAULT 0,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  organizing_club VARCHAR(255),
  sa_vertical VARCHAR(100), -- Technical, Cultural, Sports, etc.
  fees VARCHAR(50) DEFAULT 'Free',
  contact VARCHAR(50),
  online_link TEXT,
  status VARCHAR(50) DEFAULT 'Active', -- Active, Completed, Cancelled, Pending
  tags TEXT[], -- Array of tags
  key_features TEXT[], -- Array of key features
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registrations Table (User-Event relationship)
CREATE TABLE registrations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'confirmed', -- confirmed, waitlisted, cancelled
  attended BOOLEAN DEFAULT FALSE,
  certificate_issued BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, event_id) -- Prevent duplicate registrations
);

-- Indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_registrations_user_id ON registrations(user_id);
CREATE INDEX idx_registrations_event_id ON registrations(event_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO users (name, email, password, role, branch, year, roll_no, points)
VALUES 
  ('Tejal Jadhav', 'tejal@vit.edu', '$2a$10$example.hash', 'student', 'BTech-Computer Engineering', '3rd Year', 'VIT2023CSE045', 1240),
  ('Rahul Coordinator', 'rahul@vit.edu', '$2a$10$example.hash', 'coordinator', 'CSE Department', 'Faculty', 'FAC001', 0),
  ('Admin User', 'admin@vit.edu', '$2a$10$example.hash', 'admin', 'All', 'Admin', 'ADMIN001', 0);

INSERT INTO events (title, description, date, location, category, max_participants, registered_count, created_by, organizing_club, sa_vertical, fees, contact, tags, key_features)
VALUES 
  (
    'National Hackathon 2025',
    'A 24-hour coding marathon with industry mentors and exciting prizes.',
    '2025-03-15 09:00:00',
    'Main Auditorium',
    'Hackathon',
    120,
    89,
    2,
    'CSE Department',
    'Technical',
    'Free',
    '9876543210',
    ARRAY['coding', 'technology', 'competition'],
    ARRAY['24 Hour Coding', 'Cash Prizes', 'Industry Mentors']
  ),
  (
    'Tech Talk: AI & Future',
    'Industry experts discussing the future of AI and machine learning.',
    '2025-04-02 11:00:00',
    'Seminar Hall A',
    'Seminar',
    80,
    67,
    2,
    'CSE Department',
    'Technical',
    'Free',
    '9876543211',
    ARRAY['ai', 'machine learning', 'technology'],
    ARRAY['Industry Experts', 'Q&A Session', 'Certificate']
  ),
  (
    'Cultural Fest 2025',
    'Annual cultural festival featuring dance, music, drama, and food stalls.',
    '2025-04-20 10:00:00',
    'Open Air Theatre',
    'Cultural',
    400,
    310,
    2,
    'Cultural Club',
    'Cultural',
    '₹50',
    '9876543213',
    ARRAY['cultural', 'entertainment', 'festival'],
    ARRAY['Dance', 'Music', 'Drama', 'Food Stalls']
  );

-- Sample registrations
INSERT INTO registrations (user_id, event_id, status)
VALUES 
  (1, 1, 'confirmed'),
  (1, 2, 'confirmed');

-- Verify data
SELECT 'Users count:' as info, COUNT(*) as count FROM users
UNION ALL
SELECT 'Events count:', COUNT(*) FROM events
UNION ALL
SELECT 'Registrations count:', COUNT(*) FROM registrations;
