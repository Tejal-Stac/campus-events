# 🧪 Testing Guide - Campus Events Application

## ✅ What Has Been Fixed

### Part 1: Backend Infrastructure
- ✅ **Request Logging**: Added middleware to log all incoming requests with timestamp, method, and URL
- ✅ **Database SSL**: Confirmed SSL configuration for Neon PostgreSQL connection
- ✅ **Controller Debugging**: Added console.log statements to all controller functions and routes
- ✅ **Auth Middleware Logging**: Added detailed JWT verification logging

### Part 2: Frontend API Bridge
- ✅ **Axios Configuration**: Already configured with `baseURL: 'http://localhost:5000/api'`
- ✅ **Auth Interceptor**: JWT token is automatically attached to all requests from localStorage
- ✅ **Error Handling**: 401 responses trigger automatic logout and redirect to login

### Part 3: Frontend Data Integration
- ✅ **Login/Register Pages**: Already integrated with backend API (previous task)
- ✅ **Events Page**: Already fetching real data from PostgreSQL (previous task)
- ✅ **Student Dashboard**: Now fetches real user profile and registrations from API
  - Displays user name, email, role, and points from PostgreSQL
  - Shows upcoming registered events
  - Loading and error states implemented

### Part 4: Cleanup
- ✅ **No Firebase References**: All Firebase code is only in comments/documentation
- ✅ **Environment Variables**: Properly configured with VITE_ prefix on frontend

---

## 🚀 How to Test the Application

### Step 1: Start Backend Server

```powershell
cd backend
npm install  # If not already done
npm run dev
```

**Expected Output:**
```
Server running on port 5000
✅ Successfully connected to the Neon Cloud Database.
Timestamp: 2026-03-05T...
```

**What to Look For:**
- The backend should connect to Neon PostgreSQL successfully
- You'll see green checkmark confirming database connection

---

### Step 2: Start Frontend

Open a new terminal:

```powershell
npm install  # If not already done
npm run dev
```

**Expected Output:**
```
VITE v7.3.1  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### Step 3: Test User Registration

1. **Navigate to Registration**: http://localhost:5173/register

2. **Create a Test User**:
   - Name: `Test Student`
   - Email: `test@vit.edu`
   - Password: `password123`
   - Role: Select `student`

3. **Click "Create Account"**

**Backend Console (Expected):**
```
[2026-03-05T...] POST /api/auth/register
🔵 authController.register - Request Body: { name: 'Test Student', email: 'test@vit.edu', ... }
```

**Frontend Behavior:**
- Redirects to `/login` after successful registration
- Shows success message

---

### Step 4: Test User Login

1. **On Login Page**: http://localhost:5173/login

2. **Enter Credentials**:
   - Email: `test@vit.edu`
   - Password: `password123`

3. **Click "Sign In"**

**Backend Console (Expected):**
```
[2026-03-05T...] POST /api/auth/login
🔵 authController.login - Request Body: { email: 'test@vit.edu', ... }
```

**Frontend Behavior:**
- Redirects to `/student-dashboard`
- JWT token stored in localStorage
- User object stored in localStorage

**Verify in Browser DevTools:**
```javascript
// Open DevTools Console (F12)
localStorage.getItem('token')  // Should show JWT token
localStorage.getItem('user')   // Should show user object
```

---

### Step 5: Test Events Page

1. **Navigate to Events**: http://localhost:5173/events

**Backend Console (Expected):**
```
[2026-03-05T...] GET /api/events
🔵 eventController.getAllEvents - Fetching all events
```

**Frontend Behavior:**
- Shows loading spinner initially
- Displays list of events from PostgreSQL
- Each event card shows: title, description, date, location, category

2. **Register for an Event**:
   - Click "Register Now" button on any event

**Backend Console (Expected):**
```
[2026-03-05T...] POST /api/events/register
🔵 auth.middleware - Checking authorization...
✅ auth.middleware - Token verified, User: { id: 1, role: 'student', ... }
🔵 eventController.registerForEvent - Request Body: { event_id: 1 }
🔵 eventController.registerForEvent - User: { id: 1, role: 'student' }
```

**Frontend Behavior:**
- Alert: "Successfully registered! 100 points added to your profile!"
- Events list refreshes automatically
- Button text changes or event becomes unavailable

---

### Step 6: Test Student Dashboard

1. **Navigate to Dashboard**: http://localhost:5173/student-dashboard

**Backend Console (Expected):**
```
[2026-03-05T...] GET /api/users/profile
🔵 auth.middleware - Checking authorization...
✅ auth.middleware - Token verified
🔵 users.profile - User: { id: 1, role: 'student' }

[2026-03-05T...] GET /api/users/my-registrations
🔵 auth.middleware - Checking authorization...
✅ auth.middleware - Token verified
🔵 users.my-registrations - User: { id: 1, role: 'student' }
```

**Frontend Behavior:**
- Shows loading spinner initially
- Displays real user data:
  - User avatar with initials
  - Name from PostgreSQL
  - Email from PostgreSQL
  - Role from PostgreSQL
  - Points (should be 100 if registered for 1 event)
- Shows "Events Registered" count
- Shows "Points Earned" from database
- Lists upcoming events user is registered for

**Verify Real Data:**
- Name should match what you entered during registration
- Email should be `test@vit.edu`
- Points should be 100 (if you registered for 1 event)
- Upcoming events section shows events you registered for

---

## 🔍 Debugging Tips

### Backend Logs Help You Track:
1. **Request Flow**: See every API call in real-time
2. **Authentication**: Verify JWT tokens are being validated
3. **Database Queries**: Confirm data is being fetched/updated
4. **Transaction Logic**: See registration + points being added atomically

### Frontend DevTools:
```javascript
// Check if user is logged in
localStorage.getItem('user')

// Check JWT token
localStorage.getItem('token')

// Check axios requests in Network tab
// Filter by: XHR
// Look for: /api/auth, /api/events, /api/users
```

### Common Issues:

**1. "No token, access denied"**
- Solution: Login again, token might have expired (7 days)

**2. "Failed to load events"**
- Check backend console for errors
- Verify backend server is running on port 5000
- Check database connection

**3. "CORS Error"**
- Backend already has `cors()` middleware
- Ensure frontend is on `localhost:5173` and backend on `localhost:5000`

**4. Empty Dashboard**
- Register for some events first on `/events` page
- Check backend logs to verify registration succeeded

---

## 🎯 Expected Testing Flow

1. ✅ Register new user → See backend log registration
2. ✅ Login → See JWT token in localStorage + backend log
3. ✅ View Events → See real events from database
4. ✅ Register for Event → See transaction log + 100 points added
5. ✅ View Dashboard → See real user data + registered events + points

---

## 📊 Database Verification (Optional)

If you want to verify data directly in Neon PostgreSQL:

```sql
-- Check users table
SELECT id, name, email, role, points FROM users;

-- Check events table
SELECT id, title, registered_count, max_participants FROM events;

-- Check registrations
SELECT 
  u.name as user_name,
  e.title as event_title,
  r.created_at
FROM registrations r
JOIN users u ON r.user_id = u.id
JOIN events e ON r.event_id = e.id;
```

You can run these queries in the **Neon Console → SQL Editor**.

---

## ✅ Success Criteria

- [ ] Backend logs show all requests with timestamps
- [ ] User registration creates entry in PostgreSQL
- [ ] Login returns JWT token and user object
- [ ] Events page displays data from database
- [ ] Event registration increments count and adds 100 points
- [ ] Student Dashboard shows real user data from PostgreSQL
- [ ] Points are correctly displayed after event registration
- [ ] Upcoming events list shows only user's registered events

---

## 🎉 What's Working Now

**Frontend → Backend → PostgreSQL Connection:**
```
React Components
    ↓
API Services (authService, eventService, userService)
    ↓
Axios (with JWT interceptor)
    ↓
Node.js Express Server
    ↓
PostgreSQL Pool (with SSL)
    ↓
Neon Cloud Database
```

**Data Flow:**
- User actions → API calls → Backend controllers → Database queries → Response → State update → UI refresh

**Real-Time Simulation:**
- Events page polls every 30 seconds (simulates Firebase onSnapshot)
- Dashboard fetches fresh data on mount

---

## 🚨 Important Notes

1. **Database Must Have Data**: Run `backend/schema.sql` in Neon if you haven't already
2. **Environment Variables**: Backend `.env` must have valid Neon credentials
3. **Ports**: Backend on 5000, Frontend on 5173 (default Vite)
4. **JWT Expiry**: 7 days. After that, users must login again

---

**Happy Testing! 🚀**
