import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ 
        background: '#f0f4ff', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#1a3a6b', fontSize: '16px', fontWeight: '600' }}>
            Loading...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    // Redirect to login but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role-based access if allowedRoles are specified
  if (allowedRoles.length > 0) {
    // Check both primary role and assigned_role for coordinator access
    const userEffectiveRole = user.assignedRole || user.assigned_role || user.role
    const hasAccess = allowedRoles.includes(user.role) || allowedRoles.includes(userEffectiveRole)
    
    if (!hasAccess) {
      // User doesn't have permission, redirect to their appropriate dashboard
      const redirectMap = {
        student: '/student-dashboard',
        club_head: '/coordinator-dashboard',
        coordinator: '/coordinator-dashboard',
        faculty: '/faculty-dashboard',
        dean: '/dean-dashboard',
        volunteer: '/volunteer-dashboard',
        admin: '/admin-dashboard',
      }
      return <Navigate to={redirectMap[userEffectiveRole] || redirectMap[user.role] || '/dashboard'} replace />
    }
  }

  return children
}
