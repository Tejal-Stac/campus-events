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
  
  // Auto-redirect: If logged in, go to role-specific dashboard
  if (user) {
    const dashboardMap = {
      student: '/student-dashboard',
      coordinator: '/coordinator-dashboard',
      volunteer: '/volunteer-dashboard',
      faculty: '/faculty-dashboard',
      dean: '/dean-dashboard',
      admin: '/admin-dashboard',
      club_head: '/coordinator-dashboard',
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
          {/* Public Routes - No login needed */}
          <Route path="/" element={<SmartHomeRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/events" element={<Events />} />
          <Route path="/team-building" element={<TeamBuilding />} />

          {/* Protected Routes - Require Authentication */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Standardized Dashboard Routes */}
          <Route 
            path="/student-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/coordinator-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['coordinator', 'club_head']}>
                <CoordinatorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'dean']}>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/volunteer-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['volunteer']}>
                <VolunteerDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Legacy Routes (kept for backward compatibility) */}
          <Route 
            path="/faculty" 
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/faculty-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyDashboard />
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
          <Route 
            path="/volunteer" 
            element={
              <ProtectedRoute>
                <VolunteerDashboard />
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
          <Route 
            path="/dean" 
            element={
              <ProtectedRoute allowedRoles={['dean']}>
                <DeanDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dean-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['dean']}>
                <DeanDashboard />
              </ProtectedRoute>
            } 
          />
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