# Firebase to PostgreSQL API - Quick Reference

## Authentication

### Firebase
```javascript
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// Login
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const user = userCredential.user;

// Register
const userCredential = await createUserWithEmailAndPassword(auth, email, password);

// Get current user
const user = auth.currentUser;

// Listen to auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User signed in
  }
});
```

### PostgreSQL + JWT
```javascript
import authService from './api/authService';

// Login
const { token, user } = await authService.login(email, password);
// Token auto-stored in localStorage

// Register
const { token, user } = await authService.register({ name, email, password, role });

// Get current user
const user = authService.getCurrentUser(); // From localStorage

// Check if authenticated
const isLoggedIn = authService.isAuthenticated();

// Logout
authService.logout(); // Clears localStorage
```

---

## Fetching Data

### Firebase - Real-time Listener
```javascript
import { collection, onSnapshot, query, where } from 'firebase/firestore';

// Listen to all events
const unsubscribe = onSnapshot(collection(db, 'events'), (snapshot) => {
  const events = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  setEvents(events);
});

// Listen to filtered events
const q = query(collection(db, 'events'), where('category', '==', 'Hackathon'));
onSnapshot(q, (snapshot) => {
  // Handle data
});

// Cleanup
return () => unsubscribe();
```

### PostgreSQL - Polling or WebSocket
```javascript
import eventService from './api/eventService';

// Fetch all events (one-time)
const events = await eventService.getEvents();
setEvents(events);

// Polling (replace real-time)
useEffect(() => {
  const fetchEvents = async () => {
    const data = await eventService.getEvents();
    setEvents(data);
  };
  
  fetchEvents(); // Initial fetch
  const interval = setInterval(fetchEvents, 30000); // Poll every 30s
  
  return () => clearInterval(interval); // Cleanup
}, []);

// Filtered events (client-side)
const filtered = events.filter(e => e.category === 'Hackathon');
```

---

## Creating Documents

### Firebase
```javascript
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

// Add document with auto-generated ID
const docRef = await addDoc(collection(db, 'events'), {
  title: 'Hackathon 2025',
  date: new Date(),
  createdBy: auth.currentUser.uid
});

// Set document with specific ID
await setDoc(doc(db, 'events', 'event123'), {
  title: 'Hackathon 2025',
});
```

### PostgreSQL
```javascript
import eventService from './api/eventService';

// Create event (auto-generated ID from SERIAL)
const newEvent = await eventService.createEvent({
  title: 'Hackathon 2025',
  description: 'Event description',
  date: '2025-03-15',
  location: 'Main Auditorium',
  category: 'Hackathon',
  max_participants: 100
});
// Returns: { id: 123, title: 'Hackathon 2025', ... }
```

---

## Updating Data

### Firebase
```javascript
import { doc, updateDoc, increment } from 'firebase/firestore';

// Update specific fields
await updateDoc(doc(db, 'events', eventId), {
  registered_count: increment(1)
});

// Update user points
await updateDoc(doc(db, 'users', userId), {
  points: increment(100)
});
```

### PostgreSQL
```javascript
// Backend handles this in transaction
// Frontend just calls:
await eventService.registerForEvent(eventId);

// Backend does:
// UPDATE events SET registered_count = registered_count + 1 WHERE id = $1
// UPDATE users SET points = points + 100 WHERE id = $2
// INSERT INTO registrations (user_id, event_id) VALUES ($1, $2)
// All in a single transaction
```

---

## Querying with Filters

### Firebase
```javascript
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

// Complex query
const q = query(
  collection(db, 'events'),
  where('category', '==', 'Hackathon'),
  where('date', '>=', new Date()),
  orderBy('date', 'asc')
);

const snapshot = await getDocs(q);
const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

### PostgreSQL
```javascript
// If backend provides filtered endpoint
const events = await api.get('/events', {
  params: { category: 'Hackathon', date_from: '2025-03-01' }
});

// OR filter client-side
const allEvents = await eventService.getEvents();
const filtered = allEvents.filter(e => 
  e.category === 'Hackathon' && new Date(e.date) >= new Date()
).sort((a, b) => new Date(a.date) - new Date(b.date));
```

---

## Joins / Relationships

### Firebase
```javascript
// Firebase doesn't have joins, need multiple queries

// Get user's registrations
const registrationsSnapshot = await getDocs(
  query(collection(db, 'registrations'), where('userId', '==', currentUserId))
);

// Then fetch each event separately
for (const regDoc of registrationsSnapshot.docs) {
  const eventDoc = await getDoc(doc(db, 'events', regDoc.data().eventId));
  // Process event data
}
```

### PostgreSQL
```javascript
// Backend does SQL JOIN
// GET /api/users/my-registrations
const registrations = await userService.getMyRegistrations();

// Backend query:
// SELECT e.*, r.created_at as registered_at
// FROM registrations r
// JOIN events e ON r.event_id = e.id
// WHERE r.user_id = $1

// Returns fully joined data:
// [{ event_id, title, date, registered_at, ... }]
```

---

## Getting Related Data (Participants)

### Firebase
```javascript
// Get participants for an event
const participantsSnapshot = await getDocs(
  query(collection(db, 'registrations'), where('eventId', '==', eventId))
);

// Get user details for each participant
const participants = await Promise.all(
  participantsSnapshot.docs.map(async (doc) => {
    const userData = await getDoc(doc(db, 'users', doc.data().userId));
    return { ...doc.data(), user: userData.data() };
  })
);
```

### PostgreSQL
```javascript
// Single API call with SQL JOIN
const participants = await eventService.getEventParticipants(eventId);

// Backend does:
// SELECT u.name, u.email, r.created_at
// FROM registrations r
// JOIN users u ON r.user_id = u.id
// WHERE r.event_id = $1

// Returns: [{ user_name, user_email, registered_at }, ...]
```

---

## User Role Checks

### Firebase
```javascript
// Using custom claims
const idTokenResult = await auth.currentUser.getIdTokenResult();
const userRole = idTokenResult.claims.role;

if (userRole === 'club_head') {
  // Show club head features
}
```

### PostgreSQL
```javascript
// Role stored in JWT payload
const user = authService.getCurrentUser();
const userRole = user.role; // 'student', 'club_head', etc.

if (userRole === 'club_head') {
  // Show club head features
}

// OR check directly
const role = authService.getUserRole();
```

---

## Protected Routes

### Firebase
```javascript
// React Router protection
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';

function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return children;
}
```

### PostgreSQL
```javascript
// React Router protection
import { Navigate } from 'react-router-dom';
import authService from './api/authService';

function ProtectedRoute({ children, requiredRole }) {
  const isAuth = authService.isAuthenticated();
  const user = authService.getCurrentUser();
  
  if (!isAuth) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
}

// Usage:
<Route path="/dashboard" element={
  <ProtectedRoute requiredRole="student">
    <StudentDashboard />
  </ProtectedRoute>
} />
```

---

## Transactions

### Firebase
```javascript
import { runTransaction, doc } from 'firebase/firestore';

await runTransaction(db, async (transaction) => {
  const eventRef = doc(db, 'events', eventId);
  const userRef = doc(db, 'users', userId);
  
  const eventDoc = await transaction.get(eventRef);
  if (!eventDoc.exists()) throw new Error('Event not found');
  
  transaction.update(eventRef, { registered_count: increment(1) });
  transaction.update(userRef, { points: increment(100) });
  transaction.set(doc(db, 'registrations', `${userId}_${eventId}`), {
    userId, eventId, timestamp: new Date()
  });
});
```

### PostgreSQL
```javascript
// Frontend just calls API
await eventService.registerForEvent(eventId);

// Backend handles transaction in eventController.js
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('UPDATE events SET registered_count = registered_count + 1 WHERE id = $1', [event_id]);
  await client.query('UPDATE users SET points = points + 100 WHERE id = $1', [user_id]);
  await client.query('INSERT INTO registrations (user_id, event_id) VALUES ($1, $2)', [user_id, event_id]);
  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  client.release();
}
```

---

## Summary Table

| Feature | Firebase | PostgreSQL + JWT |
|---------|----------|------------------|
| **Authentication** | Firebase Auth | JWT tokens in localStorage |
| **User Session** | `onAuthStateChanged` | Check token in localStorage |
| **Real-time Data** | `onSnapshot` listeners | HTTP polling or WebSockets |
| **Queries** | Firestore queries | SQL queries on backend |
| **Relationships** | Multiple queries | SQL JOINs |
| **Transactions** | `runTransaction` | PostgreSQL transactions |
| **Security Rules** | Firestore rules | Middleware + SQL permissions |
| **Offline Support** | Built-in | Requires custom implementation |
| **Type Safety** | Firebase SDK types | Manual types or Prisma |

---

## Migration Checklist

- [x] Replace Firebase Auth with JWT authentication
- [x] Replace Firestore queries with PostgreSQL API calls
- [x] Replace onSnapshot with polling (or implement WebSockets)
- [x] Implement transactions for atomic operations
- [x] Add optional chaining to prevent null errors
- [x] Update environment variables (.env files)
- [x] Create database schema
- [x] Fix SQL injection vulnerabilities
- [ ] Test all API endpoints
- [ ] Replace hardcoded data in frontend with API calls
- [ ] Add role-based access control in React Router
- [ ] Deploy backend and frontend

---

**Next Step:** Replace hardcoded data in `src/pages/Events.jsx` with actual API calls using the services in `src/api/`
