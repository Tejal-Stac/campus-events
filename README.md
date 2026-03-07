# 🎓 Campus Event Management System

A comprehensive, multi-role event management platform designed for educational institutions. Built with modern web technologies to streamline event organization, registration, and participation tracking.

## 🌟 Project Overview

The **Campus Event Management System** empowers educational institutions to manage events across multiple stakeholder roles:

- **Students**: Browse events, register, track participation points, manage profile
- **Faculty**: Oversee events, review student participation, manage academic activities
- **Dean/Admin**: Approve events, assign roles, monitor campus-wide activities
- **Coordinator/Club Head**: Create and manage events, track registrations, coordinate logistics

### 🎯 Key Features

#### 🔐 Authentication & Authorization
- **Secure JWT-based authentication** with role-based access control (RBAC)
- **Multi-role dashboards** with personalized navigation and features
- **Global AuthContext** for real-time user state synchronization
- **Automatic role-based redirects** to prevent unauthorized access

#### 📅 Live Event Dashboard
- **Dynamic event cards** with hero images, gradient overlays, and glassmorphism badges
- **Real-time capacity tracking** with visual progress bars
- **Category-based filtering** (Hackathons, Seminars, Workshops, Cultural, Sports)
- **Smart registration buttons** that update to "Already Registered" with visual feedback
- **Persistent registration state** synchronized with PostgreSQL database

#### 👤 Profile Management
- **Editable user profiles** with instant database updates
- **Real-time navbar synchronization** using refreshUser() in AuthContext
- **Profile fields**: Name, Email, Phone, Branch, Year, Bio, Interests, Skills, Social Links
- **Points tracking** visible across all pages after event participation

#### 🎭 Event Registration System
- **Transaction-based duplicate prevention** at database level
- **Atomic operations**: Registration + Points Award (100 points per event)
- **Frontend validation**: Disabled buttons for fully booked or already registered events
- **Background data refresh** to keep UI synchronized after registration

#### 🛡️ Role-Based Security
- **useEffect-based protection** in all dashboard components
- **Automatic redirects** based on user role from database
- **Navigation guards** using react-router's ProtectedRoute component
- **Replace navigation** to prevent back-button security bypass

#### 🎨 Modern UI/UX
- **Tailwind CSS** for responsive, mobile-friendly design
- **Hero images** with gradient overlays and smooth hover animations
- **Glassmorphism effects** for badges and status indicators
- **Visual feedback** for all user interactions (loading states, success alerts)
- **Consistent design language** across all dashboard variants

---

## 🛠️ Core Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Lightning-fast build tool and dev server
- **React Router v6** - Client-side routing with protected routes
- **Axios** - Centralized HTTP client with JWT interceptors
- **Tailwind CSS** - Utility-first styling framework
- **Context API** - Global state management (AuthContext)

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - RESTful API framework
- **PostgreSQL (Local)** - Relational database system
- **JWT** - Stateless authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Database
- **PostgreSQL** - Local or cloud-hosted PostgreSQL database
- **Transaction support** for atomic operations
- **Indexed queries** for optimal performance

---

## 📦 Installation Guide

### Prerequisites
- **Node.js** v16 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js) or **yarn**
- **PostgreSQL** installed locally ([Download](https://www.postgresql.org/download/))
- **Git** for version control

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Tejal-Stac/campus-events.git
cd campus-events
```

### 2️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment variables file
cp .env.example .env

# Edit .env with your database credentials (see Database Setup below)
notepad .env  # Windows
nano .env     # Linux/Mac
```

### 3️⃣ Frontend Setup

```bash
# Navigate to project root
cd ..

# Install dependencies
npm install
```

---

## 🗄️ Database Setup

### Local PostgreSQL (Recommended for Development)

1. **Install PostgreSQL**: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)

2. **Create a database**:
   ```sql
   CREATE DATABASE campus_events;
   ```

3. **Execute schema** to create tables:
   ```bash
   # Windows (PowerShell)
   psql -U postgres -d campus_events -f backend/schema.sql
   
   # Linux/Mac
   psql -U postgres -d campus_events -f backend/schema.sql
   ```

4. **Update `backend/.env`** with your local credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=campus_events
   DB_USER=postgres
   DB_PASSWORD=your_local_password
   JWT_SECRET=your_super_secret_jwt_key
   PORT=5000
   ```

### Cloud PostgreSQL (Optional for Production)

If deploying to production, you can use cloud providers like:
- **Render** - Free PostgreSQL with 90-day retention
- **Railway** - Easy PostgreSQL deployment
- **Supabase** - PostgreSQL with additional features
- **Neon** - Serverless PostgreSQL

Update your `.env` with cloud credentials:
```env
DB_HOST=your-cloud-host.com
DB_PORT=5432
DB_NAME=campus_events
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
```

### 📊 Database Tables

The schema creates three core tables:

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| **users** | Store user accounts with role-based fields | id, first_name, last_name, email, password (hashed), role, gr_number, department, division, year, designation |
| **events** | Store event details | id, title, description, date, location, category, max_participants, registered_count |
| **registrations** | Track user-event relationships | id, user_id, event_id, status, attended, certificate_issued |

#### Sample Data Included
- ✅ Admin account (admin@vit.edu)
- ✅ Coordinator account (rahul@vit.edu)
- ✅ Student account (tejal@vit.edu / password: `password123`)
- ✅ Student account (tejal@vit.edu / password: `password123`)
- ✅ 3 sample events (Hackathon, Tech Talk, Cultural Fest)
- ✅ Sample registrations

---

## 🚀 Running the Application

### Development Mode

Open **two terminal windows**:

#### Terminal 1: Backend Server
```bash
cd backend
npm run dev
```
✅ Backend runs on `http://localhost:5000`

#### Terminal 2: Frontend Dev Server
```bash
npm run dev
```
✅ Frontend runs on `http://localhost:5173` (or port shown in terminal)

### Testing the Application

1. **Open browser**: Navigate to `http://localhost:5173`
2. **Login with sample account**:
   - Email: `tejal@vit.edu`
   - Password: `password123`
3. **Test features**:
   - Browse events on Events page
   - Register for an event (watch button change to "Already Registered")
   - Check points increase in navbar (100 points per registration)
   - Edit profile and see navbar update immediately
   - Try accessing different role dashboards (auto-redirects based on role)

---

## 🏗️ Project Structure

```
campus-events/
├── backend/                    # Express.js API server
│   ├── config/
│   │   └── db.js              # PostgreSQL connection configuration
│   ├── controllers/
│   │   ├── authController.js  # Login, register, JWT validation
│   │   └── eventController.js # Event CRUD, registration logic
│   ├── middleware/
│   │   └── auth.js            # JWT verification middleware
│   ├── routes/
│   │   ├── auth.js            # Auth endpoints: POST /login, /register
│   │   ├── events.js          # Event endpoints: GET/POST /events
│   │   └── users.js           # User endpoints: GET/PUT /profile
│   ├── schema.sql              # Database schema and sample data
│   ├── server.js              # Express app entry point
│   ├── .env.example           # Environment template
│   └── package.json
│
├── src/                        # React frontend
│   ├── api/
│   │   ├── axiosConfig.js     # ✅ Centralized Axios instance with JWT
│   │   ├── authService.js     # Login/register API calls
│   │   ├── eventService.js    # Event CRUD API calls
│   │   └── userService.js     # Profile, registrations API calls
│   ├── components/
│   │   └── Navbar.jsx         # Global navbar with role-based links
│   ├── context/
│   │   └── AuthContext.jsx    # Global auth state + refreshUser()
│   ├── pages/
│   │   ├── Login.jsx          # Login with role-based redirect
│   │   ├── Register.jsx       # User registration
│   │   ├── Home.jsx           # Landing page
│   │   ├── Events.jsx         # ✅ Live event dashboard with registration
│   │   ├── Profile.jsx        # ✅ Editable profile with DB persistence
│   │   ├── StudentDashboard.jsx      # Student-specific features
│   │   ├── FacultyDashboard.jsx      # Faculty view with protection
│   │   ├── DeanDashboard.jsx         # Admin approval dashboard
│   │   └── CoordinatorDashboard.jsx  # Event creation and management
│   ├── App.jsx                # ✅ Router with ProtectedRoute
│   ├── main.jsx               # React entry point
│   └── index.css              # Tailwind base styles
│
├── .gitignore                  # ✅ Excludes .env, node_modules, dist
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md                   # This file
```

---

## 🔌 API Documentation

### Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: Update `VITE_API_URL` in .env

### Authentication Endpoints

#### `POST /api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@vit.edu",
  "password": "securepassword",
  "role": "student",
  "branch": "CSE",
  "year": "2nd"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": { "id": 5, "name": "John Doe", "email": "john@vit.edu", "role": "student" },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### `POST /api/auth/login`
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "tejal@vit.edu",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": { "id": 1, "name": "Tejal Jadhav", "role": "student", "points": 1240 },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Event Endpoints

#### `GET /api/events`
Fetch all active events.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "National Hackathon 2025",
    "description": "24-hour coding marathon...",
    "date": "2025-03-15T09:00:00Z",
    "location": "Main Auditorium",
    "category": "Hackathon",
    "max_participants": 120,
    "registered_count": 89,
    "fees": "Free"
  }
]
```

#### `POST /api/events/register`
Register for an event (adds 100 points).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "event_id": 1
}
```

**Response:**
```json
{
  "message": "Registered successfully! 100 points added.",
  "points_earned": 100
}
```

### User Endpoints

#### `GET /api/users/profile`
Get authenticated user's profile with latest data.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": 1,
  "name": "Tejal Jadhav",
  "email": "tejal@vit.edu",
  "role": "student",
  "points": 1340,
  "branch": "BTech-Computer Engineering",
  "year": "3rd Year"
}
```

#### `PUT /api/users/profile`
Update user profile (name, phone, bio, etc.).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "Tejal Updated",
  "phone": "9876543210",
  "bio": "Passionate about technology",
  "interests": ["AI", "Web Development"],
  "skills": ["React", "Node.js"]
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Tejal Updated",
  "phone": "9876543210",
  "bio": "Passionate about technology",
  ...
}
```

#### `GET /api/users/my-registrations`
Fetch user's registered events.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "event_id": 1,
    "title": "National Hackathon 2025",
    "date": "2025-03-15T09:00:00Z"
  }
]
```

---

## 🔒 Environment Security

### ✅ Security Checklist
- ✅ `.env` files are excluded from Git via `.gitignore`
- ✅ `.env.example` provided for reference (no actual credentials)
- ✅ JWT secrets use strong random strings in production
- ✅ Passwords hashed with bcrypt (salt rounds: 10)
- ✅ Role-based authentication with GR Number (Students) and Employee ID (Faculty)
- ✅ CORS configured for specific origins in production
- ✅ SQL injection prevented with parameterized queries
- ✅ JWT verification middleware on protected routes

### Production Deployment Best Practices

1. **Environment Variables**:
   - Never commit `.env` to version control
   - Use platform-specific environment variable management (Vercel, Heroku, Railway)
   - Rotate JWT secrets regularly

2. **Database**:
   - Use connection pooling for scalability
   - Regular backups of PostgreSQL data
   - Enable secure connections for cloud databases

3. **Frontend**:
   - Update `VITE_API_URL` to production backend URL
   - Enable HTTPS for all connections
   - Build with `npm run build` for optimized production bundle

4. **Backend**:
   - Set `NODE_ENV=production`
   - Use process managers (PM2, Docker)
   - Implement rate limiting for API endpoints
   - Add monitoring (Sentry, LogRocket)

---

## 📤 Git Deployment Strategy

### Initial Repository Setup

```bash
# Initialize Git (if not already done)
git init

# Check current status
git status

# Add all files (respecting .gitignore)
git add .

# Verify .env is NOT added (should be excluded)
git status

# Commit with descriptive message
git commit -m "feat: Complete Campus Event Management System

- Multi-role authentication (Student, Faculty, Dean, Coordinator)
- Live event dashboard with dynamic registration
- Profile management with real-time state sync
- Role-based dashboards with security redirects
- PostgreSQL database with Neon Cloud integration
- Centralized API configuration with JWT interceptors
- Transaction-based event registration with duplicate prevention"

# Add remote repository (replace with your GitHub repo)
git remote add origin https://github.com/Tejal-Stac/campus-events.git

# Push to main branch
git push -u origin main
```

### Subsequent Updates

```bash
# Pull latest changes (if working in a team)
git pull origin main

# Make changes to code...

# Stage changes
git add .

# Commit with descriptive message
git commit -m "fix: Update profile persistence logic"

# Push to remote
git push origin main
```

### Branch Strategy (Recommended)

```bash
# Create feature branch
git checkout -b feature/new-dashboard

# Work on changes...
git add .
git commit -m "feat: Add volunteer dashboard"

# Push feature branch
git push origin feature/new-dashboard

# Create pull request on GitHub, then merge to main
```

### Verify Before Pushing

```bash
# Ensure .env is NOT tracked
git ls-files | grep .env
# Should return nothing (or only .env.example)

# Check ignored files are working
git check-ignore -v backend/.env
# Should show: .gitignore:5:backend/.env
```

---

## 🚢 Deployment Readiness

### ✅ Verification Checklist

#### API Configuration
- ✅ All API calls use centralized `axiosConfig.js`
- ✅ JWT token automatically attached via Axios interceptors
- ✅ Base URL configurable via `VITE_API_URL` environment variable
- ✅ Error handling with 401 auto-logout

#### Hardcoded Data Removal
- ✅ Events fetched from PostgreSQL (no hardcoded arrays)
- ✅ User data from database via AuthContext
- ✅ Registrations tracked in `registrations` table
- ✅ Points calculated dynamically from backend
- ✅ Profile updates persist to database

#### Security
- ✅ Role-based protection on all dashboards
- ✅ JWT expiration handled gracefully
- ✅ SQL injection prevention with parameterized queries
- ✅ CORS configured for production origins

#### Database
- ✅ Local PostgreSQL with proper configuration
- ✅ Schema includes indexes for performance
- ✅ Transactions for atomic operations
- ✅ Timestamps for audit trails

### Production Deployment Platforms

#### Frontend (Vercel - Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
VITE_API_URL=https://your-backend-url.com/api
```

#### Backend (Railway/Render)
```bash
# Railway deployment
railway login
railway init
railway up

# Add environment variables in dashboard
# Connect to Neon PostgreSQL automatically
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Authors

- **Tejal Jadhav** - Initial work - [Tejal-Stac](https://github.com/Tejal-Stac)

---

## 🙏 Acknowledgments

- VIT Pune for project inspiration
- Neon Cloud for serverless PostgreSQL
- React and Vite communities for excellent tooling
- Tailwind CSS for modern styling utilities

---

## 📞 Support

For issues, questions, or contributions:
- **GitHub Issues**: [Create an issue](https://github.com/Tejal-Stac/campus-events/issues)
- **Email**: tejal@vit.edu

---

**⭐ Star this repository if you found it helpful!**
