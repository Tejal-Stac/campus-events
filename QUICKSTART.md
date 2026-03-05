# Campus Events - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Database Setup (2 minutes)

```bash
# Open PostgreSQL command line
psql -U postgres

# Create database
CREATE DATABASE campus_events;
\c campus_events

# Exit psql
\q

# Import schema
cd backend
psql -U postgres -d campus_events -f schema.sql
```

### Step 2: Backend Setup (1 minute)

```bash
cd backend

# Create .env file
echo DB_HOST=localhost > .env
echo DB_PORT=5432 >> .env
echo DB_NAME=campus_events >> .env
echo DB_USER=postgres >> .env
echo DB_PASSWORD=your_postgres_password >> .env
echo JWT_SECRET=my_super_secret_key_12345 >> .env
echo PORT=5000 >> .env

# Install & start
npm install
npm run dev
```

### Step 3: Frontend Setup (1 minute)

```bash
# Go to root directory
cd ..

# Create .env
echo VITE_API_URL=http://localhost:5000/api > .env

# Install & start
npm install
npm run dev
```

### Step 4: Test (1 minute)

Open browser: `http://localhost:5173`

**Test API:**
```bash
# Test health check
curl http://localhost:5000

# Should return: "Campus Events API is running!"
```

---

## 📝 Quick Test Credentials

After running `schema.sql`, you'll have these test users:

```
Email: tejal@vit.edu
Password: (You need to update the hash in schema.sql or register new user)
Role: student

Email: rahul@vit.edu
Role: coordinator
```

**To create a new test user:**
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test Student",
  "email": "test@vit.edu",
  "password": "password123",
  "role": "student"
}
```

---

## 🧪 Testing the API

### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@vit.edu","password":"pass123","role":"student"}'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@vit.edu","password":"pass123"}'
```

Copy the token from response.

### 3. Get Events
```bash
curl http://localhost:5000/api/events
```

### 4. Register for Event (Requires Token)
```bash
curl -X POST http://localhost:5000/api/events/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"event_id":1}'
```

### 5. Get Profile
```bash
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔍 Verify Database

```bash
psql -U postgres -d campus_events

# Check tables
\dt

# View users
SELECT id, name, email, role, points FROM users;

# View events
SELECT id, title, category, registered_count, max_participants FROM events;

# View registrations
SELECT r.id, u.name, e.title FROM registrations r
JOIN users u ON r.user_id = u.id
JOIN events e ON r.event_id = e.id;

# Exit
\q
```

---

## 📱 Frontend Integration

### Replace Hardcoded Data in Events.jsx

**Current (Hardcoded):**
```javascript
const events = [
  { id: 1, title: 'Hackathon', ... }
];
```

**Updated (API):**
```javascript
import { useState, useEffect } from 'react';
import eventService from '../api/eventService';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventService.getEvents();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {events?.map(event => (
        <div key={event.id}>{event.title}</div>
      ))}
    </div>
  );
}
```

---

## 🛠️ Common Issues & Fixes

### Database Connection Failed
```
Error: password authentication failed for user "postgres"
```
**Fix:** Check `DB_PASSWORD` in `backend/.env`

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Fix:** Change `PORT` in `backend/.env` or kill process:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### JWT Token Invalid
```
401 Unauthorized - Invalid token
```
**Fix:** Re-login to get a fresh token (tokens expire after 7 days)

### CORS Error
```
Access to XMLHttpRequest blocked by CORS
```
**Fix:** Ensure backend is running on `http://localhost:5000`

---

## 📂 Project File Locations

```
✅ Database Schema: backend/schema.sql
✅ API Services: src/api/
✅ Auth Middleware: backend/middleware/auth.js
✅ Controllers: backend/controllers/
✅ Example Components: src/examples/
✅ Migration Guide: MIGRATION_GUIDE.md
✅ Quick Reference: FIREBASE_TO_POSTGRESQL_REFERENCE.md
```

---

## 🎯 What's Been Done

✅ **Database Schema Created**
- Users table with roles and points
- Events table with registration tracking
- Registrations table (many-to-many)

✅ **Backend Fixes Applied**
- Fixed SQL injection vulnerabilities
- Added transaction support for event registration
- Added new endpoints: `/my-events`, `/participants`, `/my-registrations`

✅ **Frontend API Layer Created**
- `axiosConfig.js` - JWT interceptor
- `authService.js` - Login/Register
- `eventService.js` - Events CRUD
- `userService.js` - User profile/points

✅ **Error Prevention**
- Optional chaining added to Events.jsx
- Null-safe `.map()` operations

---

## 📚 Next Steps

1. **Test the API:** Use Postman or `curl` to test all endpoints
2. **Update Frontend Pages:** Replace hardcoded data with API calls
3. **Add Authentication UI:** Create Login/Register forms
4. **Protected Routes:** Add role-based access control
5. **Real-time Updates:** Consider WebSockets or Server-Sent Events

---

## 📖 Documentation

- **Full Migration Guide:** [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
- **API Reference:** [FIREBASE_TO_POSTGRESQL_REFERENCE.md](FIREBASE_TO_POSTGRESQL_REFERENCE.md)

---

**Status:** ✅ Backend complete | ⏳ Frontend integration pending

**Need Help?** Check `MIGRATION_GUIDE.md` for detailed troubleshooting.
