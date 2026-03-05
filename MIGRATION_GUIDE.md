# VIT Pune Campus Events - Migration Guide
## Firebase → Node.js + PostgreSQL

---

## 📁 Project Structure Overview

```
campus-events/
├── backend/                          # Node.js + Express API
│   ├── config/
│   │   └── db.js                    # PostgreSQL connection (pg Pool)
│   ├── controllers/
│   │   ├── authController.js        # Registration & Login (JWT)
│   │   └── eventController.js       # Events CRUD + Transaction logic
│   ├── middleware/
│   │   └── auth.js                  # JWT verification middleware
│   ├── routes/
│   │   ├── auth.js                  # /api/auth routes
│   │   ├── events.js                # /api/events routes
│   │   └── users.js                 # /api/users routes
│   ├── schema.sql                   # ✨ NEW: PostgreSQL schema
│   ├── .env                         # Environment variables
│   └── server.js                    # Express server entry
│
├── src/                              # React Frontend
│   ├── api/                         # ✨ NEW: API service layer
│   │   ├── axiosConfig.js           # Axios instance with JWT interceptor
│   │   ├── authService.js           # Auth API calls
│   │   ├── eventService.js          # Event API calls
│   │   └── userService.js           # User API calls
│   ├── examples/                    # ✨ NEW: Example components
│   │   ├── EventsListExample.jsx    # Student event list
│   │   └── ClubHeadDashboardExample.jsx
│   ├── components/
│   ├── pages/
│   │   └── Events.jsx               # ✨ UPDATED: Added optional chaining
│   └── ...
```

---

## 🔧 Database Technology Stack

### **Current Setup:**
- **Database:** PostgreSQL
- **Connection:** Raw `pg` Pool (NOT using ORM like Prisma/Sequelize)
- **Query Style:** Direct SQL with parameterized queries (`$1`, `$2`, etc.)

### **Database Schema:**
Location: `backend/schema.sql`

**Tables:**
1. **users** - User accounts with roles and points
2. **events** - Event details with registration tracking
3. **registrations** - User-Event relationship (many-to-many)

---

## 🔐 Authentication & Authorization

### **JWT-Based Authentication:**

**How it works:**
1. User registers/logs in → Backend generates JWT token
2. Token contains: `{ id: user.id, role: user.role }`
3. Frontend stores token in `localStorage`
4. Every API call sends: `Authorization: Bearer <token>`
5. Backend middleware verifies token and attaches `req.user`

### **Role System:**

Stored in `users.role` column (VARCHAR):
- `student` - Can register for events
- `club_head` - Can create events, view participants
- `coordinator` - Manages events
- `dean` - Approves events
- `admin` - Full access

**Accessing user role in backend:**
```javascript
const userRole = req.user.role; // From JWT payload
```

---

## 🔄 Firebase → PostgreSQL Migration

### **1. Authentication Migration**

| Firebase | PostgreSQL (JWT) |
|----------|-----------------|
| `signInWithEmailAndPassword()` | `POST /api/auth/login` |
| `createUserWithEmailAndPassword()` | `POST /api/auth/register` |
| `onAuthStateChanged()` | `localStorage.getItem('token')` |
| Firebase UID | Database `users.id` |
| Firebase Claims | JWT payload `{ id, role }` |

### **2. Real-time Data Migration**

| Firebase | PostgreSQL |
|----------|-----------|
| `onSnapshot(collection(db, 'events'), ...)` | `eventService.getEvents()` + polling |
| `onSnapshot(doc(db, 'users', uid), ...)` | `userService.getProfile()` |
| Real-time updates | HTTP polling every 30s OR WebSocket |

### **3. Event Registration with Transaction**

**Firebase (OLD):**
```javascript
// Separate operations, not atomic
await updateDoc(eventRef, { registered_count: increment(1) });
await updateDoc(userRef, { points: increment(100) });
await addDoc(registrationsRef, { user_id, event_id });
```

**PostgreSQL (NEW):**
```javascript
// Single atomic transaction
await pool.query('BEGIN');
await pool.query('UPDATE events SET registered_count = registered_count + 1 WHERE id = $1', [event_id]);
await pool.query('UPDATE users SET points = points + 100 WHERE id = $1', [user_id]);
await pool.query('INSERT INTO registrations (user_id, event_id) VALUES ($1, $2)', [user_id, event_id]);
await pool.query('COMMIT');
```

✅ **Implemented in:** `backend/controllers/eventController.js` → `registerForEvent()`

---

## 📡 API Endpoints

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login & get JWT token

### **Events**
- `GET /api/events` - Fetch all events (public)
- `POST /api/events` - Create event (auth required)
- `POST /api/events/register` - Register for event (auth + transaction)
- `GET /api/events/my-events` - Get events created by current user
- `GET /api/events/:eventId/participants` - Get participant list

### **Users**
- `GET /api/users/profile` - Get current user profile
- `GET /api/users/my-registrations` - Get user's registered events
- `GET /api/users/points` - Get user points

---

## 🛠️ Setup Instructions

### **1. Database Setup**

```bash
# Install PostgreSQL (if not installed)
# Windows: Download from https://www.postgresql.org/download/windows/

# Create database
psql -U postgres
CREATE DATABASE campus_events;
\c campus_events

# Run schema
\i backend/schema.sql
```

### **2. Backend Setup**

```bash
cd backend

# Install dependencies
npm install

# Create .env file
# Copy this template:
```

**backend/.env:**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=campus_events
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server
PORT=5000
```

```bash
# Start server
npm run dev  # Development with nodemon
# OR
npm start    # Production
```

### **3. Frontend Setup**

```bash
# Root directory
npm install

# Create .env file
```

**Frontend .env (root directory):**
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
# Start frontend
npm run dev
```

---

## 🔧 Using the API Services

### **Example 1: Login & Store Token**

```javascript
import authService from './api/authService';

const handleLogin = async (email, password) => {
  try {
    const { token, user } = await authService.login(email, password);
    console.log('Logged in:', user);
    // Token is automatically stored in localStorage
  } catch (error) {
    console.error('Login failed:', error.response?.data?.message);
  }
};
```

### **Example 2: Fetch Events (Students)**

```javascript
import { useEffect, useState } from 'react';
import eventService from './api/eventService';

function EventsList() {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    const fetchEvents = async () => {
      const data = await eventService.getEvents();
      setEvents(data);
    };
    fetchEvents();
    
    // Optional: Poll every 30 seconds
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div>
      {events?.map(event => (
        <div key={event.id}>{event.title}</div>
      ))}
    </div>
  );
}
```

### **Example 3: Register for Event**

```javascript
const handleRegister = async (eventId) => {
  try {
    await eventService.registerForEvent(eventId);
    alert('Registration successful! 100 points added.');
  } catch (error) {
    alert(error.response?.data?.message || 'Registration failed');
  }
};
```

### **Example 4: View Participants (Club Heads)**

```javascript
const fetchParticipants = async (eventId) => {
  const participants = await eventService.getEventParticipants(eventId);
  console.log(participants);
  // [{user_id, user_name, user_email, registered_at}, ...]
};
```

---

## 🛡️ Security Improvements Made

### **1. Fixed SQL Injection Vulnerabilities** ✅

**Before (VULNERABLE):**
```javascript
pool.query('SELECT * FROM users WHERE email = ' + '', [email])
```

**After (SECURE):**
```javascript
pool.query('SELECT * FROM users WHERE email = $1', [email])
```

### **2. Added Password Hashing** ✅
- Using `bcryptjs` with 10 salt rounds
- Passwords never stored in plain text

### **3. JWT Token Security** ✅
- Tokens expire after 7 days
- Stored in `localStorage` (consider `httpOnly` cookies for production)
- Token verification on every protected route

---

## ⚠️ Error Prevention (Task 4 - Optional Chaining)

### **Problem:**
If PostgreSQL returns `null` for fields like `tags`, `keyFeatures`, or `participants` before they're populated, calling `.map()` will crash the app.

### **Solution: Optional Chaining** ✅

**Updated in:** `src/pages/Events.jsx`

**Before:**
```javascript
{event.keyFeatures.map(f => <span>{f}</span>)}
// ❌ Crashes if keyFeatures is null/undefined
```

**After:**
```javascript
{event.keyFeatures?.map(f => <span>{f}</span>)}
// ✅ Returns undefined if keyFeatures is null, no crash
```

**All `.map()` calls now protected:**
- `filtered?.map(event => ...)`
- `event.keyFeatures?.map(f => ...)`
- `branches?.map(b => ...)`
- `categories?.map(cat => ...)`
- Filter function: `events?.filter(e => ...)` with fallback `|| []`

---

## 🎯 Next Steps & Recommendations

### **Immediate:**
1. ✅ Run `backend/schema.sql` to create database tables
2. ✅ Configure `.env` files in both frontend and backend
3. ✅ Test API endpoints with Postman or Thunder Client
4. ✅ Replace hardcoded data in `Events.jsx` with API calls

### **Short-term:**
- Add WebSockets for real-time event updates (replace polling)
- Implement role-based route guards in React Router
- Add form validation (Joi or Zod on backend, React Hook Form on frontend)
- Add error boundaries in React components
- Implement pagination for events list

### **Long-term:**
- Consider migrating to Prisma ORM for better type safety
- Add testing (Jest + React Testing Library)
- Implement rate limiting (express-rate-limit)
- Add API documentation (Swagger/OpenAPI)
- Deploy to production (Vercel + Railway/Render)

---

## 🐛 Troubleshooting

### **Database Connection Failed**
```
Error: Database connection error
```
**Solution:** Check `.env` variables, ensure PostgreSQL is running

### **JWT Token Invalid**
```
401 Unauthorized - Invalid token
```
**Solution:** Token expired or wrong `JWT_SECRET`. Re-login to get new token.

### **CORS Error**
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Backend already has `cors()` enabled. Check `VITE_API_URL` in frontend.

### **Array .map() Crash**
```
TypeError: Cannot read property 'map' of undefined
```
**Solution:** Already fixed with optional chaining (`?.`) in `Events.jsx`

---

## 📞 Support

If you encounter issues:
1. Check backend logs in terminal
2. Check browser console for frontend errors
3. Verify database has data: `SELECT * FROM events;`
4. Ensure JWT token is in localStorage: `localStorage.getItem('token')`

---

**Migration Status:** ✅ Complete
**Last Updated:** March 5, 2026
**Tech Stack:** Node.js + Express + PostgreSQL + React + JWT
