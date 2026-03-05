# ✅ Testing Checklist - Global Navigation & State Management

## Quick Start

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```
**Expected:** `Server running on port 5000` + Database connection ✅

### Terminal 2 - Frontend:
```bash
npm run dev
```
**Expected:** `Local: http://localhost:5173/`

---

## 🧪 Complete Testing Flow

### 1. Home Page (Guest View)
- [ ] Visit http://localhost:5173/
- [ ] **Check:** Navbar visible at top
- [ ] **Check:** Shows "Login" and "Register" buttons
- [ ] **Check:** Navbar has: Home | Events | Team Building
- [ ] **Check:** No "Dashboard" link (requires login)
- [ ] **Check:** Content doesn't hide under navbar

---

### 2. Protected Route Test (Not Logged In)
- [ ] Click on "Events" link or go to http://localhost:5173/events
- [ ] **Expected:** Redirected to `/login` automatically
- [ ] **Check:** Login page appears (no navbar visible on login page)

---

### 3. User Registration
- [ ] Go to http://localhost:5173/register
- [ ] **Check:** No navbar visible (clean registration page)
- [ ] Fill in details:
  - First Name: `Test`
  - Last Name: `Student`
  - Email: `test.student@vit.edu`
  - Password: `password123`
  - Role: `student`
- [ ] Click "Create Account"
- [ ] **Expected:** Redirected to `/login`
- [ ] **Check:** Success alert appears

---

### 4. User Login & Role-Based Redirection
- [ ] On login page, enter:
  - Email: `test.student@vit.edu`
  - Password: `password123`
- [ ] Click "Sign In"
- [ ] **Expected:** Redirected to `/dashboard` (student role)
- [ ] **Check:** Navbar now shows:
  - User avatar with initials (TS)
  - Points display (⭐ 0 pts)
  - Logout button
  - Dashboard link visible
- [ ] **Check:** No more "Login/Register" buttons

---

### 5. Student Dashboard
- [ ] You should be on `/dashboard`
- [ ] **Check:** Navbar visible at top
- [ ] **Check:** Your name displayed: "Test Student"
- [ ] **Check:** Email: test.student@vit.edu
- [ ] **Check:** Role: student
- [ ] **Check:** Points: 0
- [ ] **Check:** "No upcoming events" message
- [ ] **Check:** Page layout doesn't overlap with navbar

---

### 6. Events Page & Registration
- [ ] Click "Events" in navbar
- [ ] **Expected:** Events page loads (no redirect)
- [ ] **Check:** List of events displayed
- [ ] Pick any event and click "Register Now"
- [ ] **Expected:** Alert: "✅ Successfully registered! 🎉 100 points added!"
- [ ] Click OK on alert
- [ ] **Check:** Navbar points update to ⭐ 100 pts (instantly!)
- [ ] **Check:** Event count updates

---

### 7. Points Sync Test
- [ ] Look at navbar: Should show ⭐ 100 pts
- [ ] Click on your avatar or go to `/profile`
- [ ] **Check:** Profile shows 100 points
- [ ] Go back to `/dashboard`
- [ ] **Check:** Dashboard shows 100 points
- [ ] **Check:** "1 Event Registered" in stats
- [ ] **Check:** Event appears in "My Upcoming Events"

**Result:** ✅ Points synced across all pages!

---

### 8. Persistent Login Test
- [ ] Press F5 to refresh the page
- [ ] **Check:** Still logged in (no redirect to login)
- [ ] **Check:** Navbar still shows your avatar and points
- [ ] **Check:** Dashboard still loads your data
- [ ] **Check:** No loading flash

**Result:** ✅ Session persists across refreshes!

---

### 9. Navigation Test
- [ ] Click "Home" in navbar → Goes to home page
- [ ] Click "Events" in navbar → Goes to events page
- [ ] Click "Dashboard" in navbar → Goes to dashboard
- [ ] Click "Team Building" in navbar → Goes to team building page
- [ ] **Check:** No page reloads (instant navigation)
- [ ] **Check:** Navbar stays fixed at top on all pages
- [ ] **Check:** User info visible on all pages

---

### 10. Logout Test
- [ ] Click "Logout" button in navbar
- [ ] **Expected:** Redirected to `/login`
- [ ] **Check:** Navbar now shows guest view (Login/Register)
- [ ] **Check:** Avatar and points no longer visible
- [ ] Try to access `/dashboard` directly
- [ ] **Expected:** Redirected to `/login` (protected)

**Result:** ✅ Logout works correctly!

---

### 11. Protected Route Access Test
- [ ] Logout (if logged in)
- [ ] Try to access these URLs directly:
  - http://localhost:5173/events
  - http://localhost:5173/dashboard
  - http://localhost:5173/profile
  - http://localhost:5173/certificates
- [ ] **Expected:** All redirect to `/login`
- [ ] **Check:** Login page loads each time

**Result:** ✅ Routes are protected!

---

### 12. Role-Based Access Test

#### As Student:
- [ ] Login as student: `test.student@vit.edu`
- [ ] **Expected:** Redirected to `/dashboard`
- [ ] Try to access http://localhost:5173/admin
- [ ] **Expected:** Redirected back to `/dashboard` (not authorized)

#### As Admin/Dean (if you have one):
- [ ] Create admin account with role `admin`
- [ ] Login
- [ ] **Expected:** Redirected to `/admin`
- [ ] **Check:** Can access admin panel

**Result:** ✅ Role-based access works!

---

### 13. "Remember Page" Test
- [ ] Logout
- [ ] Try to access http://localhost:5173/events directly
- [ ] **Expected:** Redirected to `/login`
- [ ] Login with credentials
- [ ] **Expected:** Redirected back to `/events` (the page you wanted!)
- [ ] **Check:** Not redirected to dashboard, but to original destination

**Result:** ✅ Smart redirection works!

---

### 14. Multiple Event Registration Test
- [ ] Login as student
- [ ] Go to Events page
- [ ] Register for 3 different events
- [ ] **Check:** After each registration:
  - Alert appears
  - Points increase by 100 each time (0 → 100 → 200 → 300)
  - Navbar updates immediately
- [ ] Go to Dashboard
- [ ] **Check:** "Events Registered" shows 3
- [ ] **Check:** Points show 300

**Result:** ✅ Global state management works perfectly!

---

### 15. Navbar Visibility Test
- [ ] Visit these pages and check navbar:
  - [ ] `/` (Home) - Navbar visible ✅
  - [ ] `/login` - **No navbar** (clean page) ✅
  - [ ] `/register` - **No navbar** (clean page) ✅
  - [ ] `/events` - Navbar visible ✅
  - [ ] `/dashboard` - Navbar visible ✅
  - [ ] `/profile` - Navbar visible ✅

**Result:** ✅ Conditional navbar rendering works!

---

### 16. Mobile Responsive Test
- [ ] Open DevTools (F12)
- [ ] Click device toolbar (mobile view)
- [ ] **Check:** Hamburger menu (☰) appears
- [ ] Click hamburger menu
- [ ] **Check:** Mobile menu opens
- [ ] **Check:** When logged in: Shows avatar, points, logout
- [ ] **Check:** When logged out: Shows login/register
- [ ] Click menu item
- [ ] **Check:** Menu closes and navigates

**Result:** ✅ Mobile navigation works!

---

### 17. Browser DevTools Verification

#### Check localStorage:
```javascript
// Open Console (F12)
localStorage.getItem('token')  // Should show JWT token
localStorage.getItem('user')   // Should show user object
```

#### Expected Output:
```javascript
// token
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// user
{"id":1,"name":"Test Student","email":"test.student@vit.edu","role":"student","points":300}
```

---

### 18. Error Handling Test

#### Test 1: Invalid Login
- [ ] Try to login with wrong password
- [ ] **Check:** Error message appears
- [ ] **Check:** Not redirected
- [ ] **Check:** Can retry

#### Test 2: Network Error (Backend Down)
- [ ] Stop backend server
- [ ] Try to register for an event
- [ ] **Check:** Error alert appears
- [ ] **Check:** Points don't update
- [ ] Restart backend
- [ ] Try again
- [ ] **Check:** Works now

---

## 🎯 Success Criteria

All these should be ✅:

- [x] Navbar visible on all pages except login/register
- [x] User stays logged in after page refresh
- [x] Points update globally after event registration
- [x] Protected routes redirect to login when not authenticated
- [x] Role-based redirection works (student → dashboard, admin → admin panel)
- [x] Logout clears session and shows guest navbar
- [x] No page reloads during navigation (React Router)
- [x] No duplicate navbars on any page
- [x] Layout consistent across all pages (no content under navbar)
- [x] User avatar and initials display correctly
- [x] Mobile responsive menu works

---

## 🐛 Common Issues & Solutions

### Issue: "Navbar not showing"
**Check:** Not on `/login` or `/register`?  
**Check:** `<Navbar />` in App.jsx above `<Routes>`?

### Issue: "User logged out after refresh"
**Check:** Token in localStorage?  
**Check:** Backend returning valid JWT?  
**Check:** Token not expired?

### Issue: "Can't access protected route"
**Check:** User logged in?  
**Check:** Correct role for the route?  
**Check:** ProtectedRoute wrapping component in App.jsx?

### Issue: "Points not updating"
**Check:** Called `updateUserPoints()` after registration?  
**Check:** Backend adds points in transaction?  
**Check:** API `/users/profile` returns updated data?

---

## 📊 Backend Console Logs to Verify

When you perform actions, watch backend console:

**Login:**
```
[2026-03-05T...] POST /api/auth/login
🔵 authController.login - Request Body: { email: '...' }
```

**Event Registration:**
```
[2026-03-05T...] POST /api/events/register
🔵 auth.middleware - Token verified, User: { id: 1, role: 'student' }
🔵 eventController.registerForEvent - Request Body: { event_id: 3 }
```

**Profile Fetch:**
```
[2026-03-05T...] GET /api/users/profile
🔵 auth.middleware - Token verified
🔵 users.profile - User: { id: 1, role: 'student' }
```

---

## ✅ Final Verification

If all tests pass:

✅ **Global navigation system working**  
✅ **User state synchronized across app**  
✅ **Protected routes functioning**  
✅ **Role-based access control active**  
✅ **Persistent login implemented**  
✅ **Clean UI with no duplicate navbars**  

**🎉 Your app is ready for production! 🚀**
