import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Events from './pages/Events'
import StudentDashboard from './pages/StudentDashboard'
import Register from './pages/Register'
import CoordinatorDashboard from './pages/CoordinatorDashboard'
import Certificates from './pages/Certificates'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'
import TeamBuilding from './pages/TeamBuilding'
import FacultyDashboard from './pages/FacultyDashboard'
import VolunteerDashboard from './pages/VolunteerDashboard'
import DeanDashboard from './pages/DeanDashboard'
import HODDashboard from './pages/HODDashboard'

function SmartHomeRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0f4ff' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #dbeafe', borderTop: '4px solid #1a3a6b', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (user) {
    const dashboardMap = {
      student:     '/student-dashboard',
      coordinator: '/coordinator-dashboard',
      volunteer:   '/volunteer-dashboard',
      faculty:     '/faculty-dashboard',
      hod:         '/hod-dashboard',
      dean:        '/dean-dashboard',
      admin:       '/admin-dashboard',
      club_head:   '/coordinator-dashboard',
    }
    return <Navigate to={dashboardMap[user.role] || '/student-dashboard'} replace />
  }

  return <Home />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<SmartHomeRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/events" element={<Events />} />
          <Route path="/team-building" element={<TeamBuilding />} />

          {/* HOD Dashboard */}
          <Route
            path="/hod-dashboard"
            element={
              <ProtectedRoute allowedRoles={['hod', 'faculty']}>
                <HODDashboard />
              </ProtectedRoute>
            }
          />

          {/* Dean Dashboard */}
          <Route
            path="/dean-dashboard"
            element={
              <ProtectedRoute allowedRoles={['dean', 'admin']}>
                <DeanDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dean"
            element={
              <ProtectedRoute allowedRoles={['dean', 'admin']}>
                <DeanDashboard />
              </ProtectedRoute>
            }
          />

          {/* Student */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Coordinator */}
          <Route
            path="/coordinator-dashboard"
            element={
              <ProtectedRoute allowedRoles={['coordinator', 'club_head']}>
                <CoordinatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coordinator"
            element={
              <ProtectedRoute allowedRoles={['club_head', 'coordinator']}>
                <CoordinatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coord-dashboard"
            element={
              <ProtectedRoute allowedRoles={['coordinator', 'club_head']}>
                <CoordinatorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'dean']}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin', 'dean']}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* Volunteer */}
          <Route
            path="/volunteer-dashboard"
            element={
              <ProtectedRoute allowedRoles={['volunteer']}>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer"
            element={
              <ProtectedRoute>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Faculty */}
          <Route
            path="/faculty-dashboard"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'hod']}>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'hod']}>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />

          {/* Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App