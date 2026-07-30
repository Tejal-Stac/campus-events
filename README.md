# Campus Events Platform

A centralized, role-based web application designed to digitize, track, and audit the complete lifecycle of university club activities, technical fests, and departmental events.

## Executive Summary and Problem Statement

In traditional academic institutions, organizing and auditing campus events often relies on fragmented social media channels, unmanaged spreadsheets, and physical paper sign-offs. This results in poor event visibility for students, tedious registration tracking for clubs, and administrative overhead for faculty and deans.

The Campus Events Platform unifies students, club leaders, faculty coordinators, department heads, and institutional administrators into a single, decoupled client-server network:

* Students discover events, register with one click, earn skill points, and access unified schedules.
* Club Presidents manage event creation, track attendee counts, and submit event reports.
* HODs and Faculty review proposed events, control registration gates, and export clean registration manifests.
* Deans and Admins oversee institutional analytics, assign user roles, and onboard accounts in bulk via CSV parsers.

## Technology Stack

### Frontend

* React.js (v18): Component-based UI library compiled with Vite
* Tailwind CSS: Utility-first CSS framework for responsive design
* React Router DOM (v6): Client-side routing with custom RBAC security guards
* Axios: HTTP client for REST API communication

### Backend

* Node.js and Express.js: Server-side execution environment and RESTful routing layer
* Multer: Middleware handling FormData multi-part file uploads
* JSON Web Tokens (JWT): Token-based authentication and authorization
* bcryptjs: Cryptographic hashing for secure user passwords

### Database

* PostgreSQL: Relational database engine with foreign keys and ACID compliance
* pg (node-postgres): Connection pool driver for high-throughput SQL queries

## System Features by User Role

### 1. Student Portal

* Live Discovery Feed: Filter public events into Live, Upcoming, or Past categories.
* One-Click Registration: Instant registration trigger that awards 100 skill points upon completion.
* Profile Management: Update personal details, contact info, bio, and track accumulated points in real time.
* Non-VIT Participation: Native registration support for outside college students during intercollegiate events.

### 2. Club President Portal

* Event Creation Interface: Form wizard to publish new departmental, intercollegiate, or national events.
* Document Persistence Engine: Upload official event reports (.pdf, .odf, .doc, .docx) directly to local server storage.
* State Persistence: Persistent Report Uploaded state pinned across page reloads once stored in the database.

### 3. Head of Department (HOD) Portal

* Departmental Gatekeeping: Review event proposals submitted by student clubs.
* Approval Workflow: Approve events to make them live on the public feed or reject them with mandatory feedback notes.

### 4. Faculty Coordinator Hub

* Registration Controls: Real-time toggles to flip event states between Open and Closed.
* Audit Center: View and download official event completion reports uploaded by student clubs.
* Native CSV Export Engine: Client-side JavaScript serialization loop that compiles raw database JSON matrices into dual-quoted CSV spreadsheets for clean Excel integration.

### 5. On-Ground Volunteer Interface

* Mobile-Responsive Checklist: Attendance sheet for event volunteers to mark student status as Present during live events.

### 6. Dean and Admin Dashboard

* System Analytics: High-level metrics on total events, student involvement, and departmental engagement.
* Role Assignment Panel: Grant or revoke user permissions for Club President, Faculty Coordinator, or HOD roles.
* Bulk Import Engine: Batch process mass CSV files (students.csv and faculty.csv) within wrapped PostgreSQL transaction blocks (BEGIN to COMMIT), ensuring automated ROLLBACK triggers if unique constraint violations occur.

## Architecture and Diagrams

The system follows a decoupled, local client-server architecture designed to operate seamlessly on local university networks.

All architecture diagrams, sequence visuals, and system flowcharts can be viewed at: [https://drive.google.com/drive/folders/1cWes0fhABLcNT7-VBAFcK1fTAbVhKOav?usp=sharing](https://drive.google.com/drive/folders/1cWes0fhABLcNT7-VBAFcK1fTAbVhKOav?usp=sharing)

## Repository Directory Structure

campus-events-platform/
├── backend/
│   ├── config/
│   │   └── db.js                 # PostgreSQL connection pool setup
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, and JWT generation
│   │   ├── eventController.js    # Event CRUD, registration logic, and status toggles
│   │   ├── deanController.js     # Bulk import parsers and system analytics
│   │   └── hodController.js      # Departmental event approval logic
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification and RBAC role checks
│   │   └── uploadMiddleware.js   # Multer local storage configuration
│   ├── uploads/
│   │   └── reports/              # Static local storage disk for event PDFs
│   ├── routes/                   # Express REST API endpoint definitions
│   ├── .env.example              # Sample environment configuration file
│   └── server.js                 # Main Express server entry point
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, EventCard, ProtectedRoute
│   │   ├── context/              # AuthContext global state management
│   │   ├── pages/                # Student, Faculty, Club, HOD, and Dean Dashboards
│   │   ├── App.jsx               # React Router configuration tree
│   │   └── main.jsx              # Vite entry point
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
└── schema.sql                    # Core PostgreSQL database schema

## Getting Started (Local Setup Guide)

### Prerequisites

Make sure you have the following software installed locally:

* Node.js (v18.0.0 or higher)
* npm (v9.0.0 or higher)
* PostgreSQL Server (v14 or higher)


### Step 1: Database Setup

1. Open PostgreSQL (via pgAdmin or terminal) and create a fresh database:
      CREATE DATABASE campus_events_db;



2. Import the schema script to initialize all tables, constraints, and indexes:
      psql -U postgres -d campus_events_db -f schema.sql


### Step 2: Backend Configuration and Execution

1. Navigate to the backend directory and install dependencies:

cd backend
npm install

2. Create a .env file in the root of the backend folder and populate it:

PORT=5000
DATABASE_URL=postgres://postgres:your_password@localhost:5432/campus_events_db
JWT_SECRET=your_super_secret_jwt_key

3. Start the backend Node server:

npm start

The server should now be listening on http://localhost:5000.

### Step 3: Frontend Configuration and Execution

1. Open a new terminal window, navigate to the frontend directory, and install dependencies:
cd frontend
npm install

2. Launch the Vite development server:
npm run dev

3. Open your browser and navigate to http://localhost:5173.

## REST API Endpoint Summary

* POST /api/auth/login (Public): Authenticates credentials and returns JWT token
* GET /api/events (Public/Student): Fetches live, upcoming, and past event cards
* POST /api/events/:id/register (Student): Registers student for an event and deposits 100 points
* POST /api/club/upload-report (Club President): Uploads multi-part event report PDF via FormData
* PATCH /api/hod/events/:id/status (HOD): Updates event status to Approved or Rejected
* GET /api/faculty/events/:id/export (Faculty): Retrieves aggregate registration data for CSV output
* POST /api/dean/bulk-import (Dean): Processes mass student/faculty CSV onboardings

## Authors and Project Team Members

This project was engineered and developed by:

* Vedant Patkar
* Tejal Jadhav
* Sujal Patil
* Siddhivinayak Patil
* Vainteya Patole

## License

This project is open-source and available under the MIT License.
