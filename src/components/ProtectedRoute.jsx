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
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // User doesn't have permission, redirect to their appropriate dashboard
    const redirectMap = {
      student: '/dashboard',
      club_head: '/coordinator',
      coordinator: '/coordinator',
      faculty: '/faculty',
      dean: '/admin',
      admin: '/admin',
    }
    return <Navigate to={redirectMap[user.role] || '/'} replace />
  }

  return children
}
