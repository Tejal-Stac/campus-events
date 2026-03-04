import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/events', label: 'Events' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/team', label: 'Team Building' },
  ]

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
          {navLinks.map(link => (
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
          ))}
        </div>

        {/* Auth Buttons */}
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

        {/* Mobile Menu Button */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '22px', cursor: 'pointer', display: 'none' }} className="md:hidden block">
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{ background: '#1a3a6b', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
              style={{ color: '#93c5fd', textDecoration: 'none', fontSize: '14px', padding: '8px 0' }}>
              {link.label}
            </Link>
          ))}
          <Link to="/login" onClick={() => setMenuOpen(false)} style={{ color: '#93c5fd', textDecoration: 'none', fontSize: '14px', padding: '8px 0' }}>Login</Link>
          <Link to="/register" onClick={() => setMenuOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontSize: '14px', padding: '8px 0', fontWeight: '600' }}>Register</Link>
        </div>
      )}
    </nav>
  )
}