import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // Hide navbar on login and register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null
  }

  // Smart navigation based on user auth state
  const navLinks = user ? [
    // Logged-in user navigation
    { to: '/dashboard', label: 'Dashboard', requiresAuth: true },
    { to: '/events', label: 'Events', requiresAuth: true },
    { to: '/profile', label: 'Profile', requiresAuth: true },
    // Show "Coordinator Dashboard" if user is faculty with coordinator role
    ...(user.role === 'faculty' && user.coordinator_type && user.coordinator_type !== 'none' ? [
      { to: '/coordinator-dashboard', label: '🎯 Coordinator Hub', requiresAuth: true }
    ] : []),
    // Show "Club Portal" for club_president
    ...(user.role === 'club_president' ? [
      { to: '/club-dashboard', label: '🏆 Club Portal', requiresAuth: true }
    ] : []),
    // Show "Manage Events" for club_head (admin)
    ...(user.role === 'club_head' || user.role === 'coordinator' ? [
      { to: '/admin', label: 'Manage Events', requiresAuth: true, adminOnly: true }
    ] : []),
  ] : [
    // Guest navigation
    { to: '/', label: 'Home' },
    { to: '/events', label: 'Events' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMenuOpen(false)
  }

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
  }

  return (
    <nav style={{ background: '#1a3a6b', position: 'fixed', width: '100%', top: 0, zIndex: 50, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ background: '#fff', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#1a3a6b', fontSize: '13px' }}>CE</div>
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>CampusEvents</span>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="hidden md:flex">
          {navLinks.map(link => {
            // Skip auth-required links if user is not logged in
            if (link.requiresAuth && !user) return null
            
            return (
              <Link key={link.to} to={link.to}
                style={{
                  color: location.pathname === link.to ? '#fff' : '#93c5fd',
                  background: location.pathname === link.to ? 'rgba(255,255,255,0.15)' : 'transparent',
                  padding: '6px 14px', borderRadius: '8px', fontSize: '14px',
                  textDecoration: 'none', fontWeight: location.pathname === link.to ? '600' : '400',
                  transition: 'all 0.2s'
                }}>
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Auth Buttons or User Info */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="hidden md:flex">
            <div style={{ color: '#93c5fd', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>⭐</span>
              <span style={{ fontWeight: '600', color: '#fff' }}>{user.points || 0} pts</span>
            </div>
            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <div style={{ 
                background: '#2563eb', 
                borderRadius: '50%', 
                width: '34px', 
                height: '34px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#fff', 
                fontWeight: '700', 
                fontSize: '13px',
                cursor: 'pointer'
              }}>
                {getInitials(user.name)}
              </div>
            </Link>
            <button 
              onClick={handleLogout}
              style={{ 
                color: '#93c5fd', 
                border: '1px solid rgba(255,255,255,0.3)', 
                background: 'transparent',
                padding: '7px 16px', 
                borderRadius: '8px', 
                fontSize: '13px', 
                fontWeight: '500',
                cursor: 'pointer'
              }}>
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="hidden md:flex">
            <Link to="/login"
              style={{ color: '#93c5fd', border: '1px solid rgba(255,255,255,0.3)', padding: '7px 16px', borderRadius: '8px', fontSize: '13px', textDecoration: 'none', fontWeight: '500' }}>
              Login
            </Link>
            <Link to="/register"
              style={{ background: '#fff', color: '#1a3a6b', padding: '7px 16px', borderRadius: '8px', fontSize: '13px', textDecoration: 'none', fontWeight: '700' }}>
              Register
            </Link>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '22px', cursor: 'pointer', display: 'none' }} className="md:hidden block">
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{ background: '#1a3a6b', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navLinks.map(link => {
            // Skip auth-required links if user is not logged in
            if (link.requiresAuth && !user) return null
            
            return (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                style={{ color: '#93c5fd', textDecoration: 'none', fontSize: '14px', padding: '8px 0' }}>
                {link.label}
              </Link>
            )
          })}
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)} style={{ color: '#93c5fd', textDecoration: 'none', fontSize: '14px', padding: '8px 0' }}>
                Profile ({user.points || 0} pts)
              </Link>
              <button onClick={handleLogout} style={{ color: '#fff', background: 'transparent', border: 'none', textAlign: 'left', fontSize: '14px', padding: '8px 0', fontWeight: '600', cursor: 'pointer' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} style={{ color: '#93c5fd', textDecoration: 'none', fontSize: '14px', padding: '8px 0' }}>Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontSize: '14px', padding: '8px 0', fontWeight: '600' }}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}