-- 1. Create Helper Function
CREATE OR REPLACE FUNCTION public.update_updated_at_column() 
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create Users Table
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'dean', 'coordinator', 'volunteer', 'admin')),
    points INTEGER DEFAULT 0,
    branch VARCHAR(100),
    year VARCHAR(20),
    roll_no VARCHAR(50),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    gr_number VARCHAR(50),
    designation VARCHAR(100),
    department VARCHAR(100),
    division VARCHAR(50),
    campus VARCHAR(100),
    phone VARCHAR(20),
    interests JSONB,
    assigned_role VARCHAR(50),
    promoted_by INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
    promotion_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    bio TEXT,
    profile_pic_url TEXT,
    organising_club VARCHAR(255),
    assigned_event_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Events Table
CREATE TABLE public.events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMP NOT NULL,
    location VARCHAR(255),
    venue VARCHAR(255),
    category VARCHAR(100),
    max_participants INTEGER DEFAULT 100,
    registered_count INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
    organising_club VARCHAR(255),
    sa_vertical VARCHAR(100),
    fees VARCHAR(50) DEFAULT 'Free',
    contact VARCHAR(50),
    contact_no VARCHAR(20),
    online_link TEXT,
    status VARCHAR(50) DEFAULT 'Active',
    tags TEXT[],
    key_features TEXT,
    campus VARCHAR(100),
    event_type VARCHAR(100),
    day VARCHAR(20),
    capacity INTEGER DEFAULT 100,
    current_registrations INTEGER DEFAULT 0,
    time_from TIME,
    time_to TIME,
    target_audience VARCHAR(255),
    department VARCHAR(100),
    image_url TEXT,
    expected_count INTEGER,
    total_seats INTEGER,
    seats INTEGER,
    volunteer_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Registrations Table
CREATE TABLE public.registrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    event_id INTEGER NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'confirmed',
    attended BOOLEAN DEFAULT false,
    certificate_issued BOOLEAN DEFAULT false,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, event_id)
);

-- 5. Create Performance Indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_events_category ON public.events(category);
CREATE INDEX idx_events_date ON public.events(date);
CREATE INDEX idx_registrations_user_id ON public.registrations(user_id);
CREATE INDEX idx_registrations_event_id ON public.registrations(event_id);

-- 6. Apply Auto-Update Triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update the event to match Tejal's (ID: 9) club name exactly
UPDATE events 
SET organising_club = (SELECT organising_club FROM users WHERE id = 9)
WHERE title = 'AI Summit 2026';

-- 7. Add Non-VITian Student Support
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS college_type VARCHAR(20) DEFAULT 'vitian' CHECK (college_type IN ('vitian', 'non_vitian')),
  ADD COLUMN IF NOT EXISTS college_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS college_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE;