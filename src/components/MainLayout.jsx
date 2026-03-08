import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * MainLayout Component
 * Provides consistent Navbar and optional Sidebar across all pages
 * 
 * Usage:
 * <MainLayout>
 *   <YourPageContent />
 * </MainLayout>
 * 
 * Props:
 * - showSidebar: boolean (default: false) - Show left sidebar with navigation
 * - children: React nodes to render as page content
 */

export default function MainLayout({ children, showSidebar = false }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Role-based navigation links for sidebar
  const getNavigationLinks = () => {
    const role = user?.role || user?.assignedRole
    
    const commonLinks = [
      { icon: '🏠', label: 'Home', path: '/' },
      { icon: '📅', label: 'Events', path: '/events' },
      { icon: '👤', label: 'Profile', path: '/profile' },
    ]

    const roleSpecificLinks = {
      student: [
        { icon: '📊', label: 'Dashboard', path: '/student-dashboard' },
        { icon: '🎫', label: 'My Events', path: '/events' },
        { icon: '🏆', label: 'Certificates', path: '/certificates' },
      ],
      faculty: [
        { icon: '📊', label: 'Dashboard', path: '/faculty-dashboard' },
        { icon: '➕', label: 'Create Event', path: '/faculty-dashboard?tab=create' },
      ],
      dean: [
        { icon: '📊', label: 'Dashboard', path: '/dean-dashboard' },
        { icon: '✅', label: 'Approvals', path: '/dean-dashboard?tab=events' },
        { icon: '👥', label: 'Students', path: '/dean-dashboard?tab=students' },
      ],
      coordinator: [
        { icon: '📊', label: 'Dashboard', path: '/coordinator-dashboard' },
        { icon: '📋', label: 'Manage Events', path: '/coordinator-dashboard' },
      ],
      volunteer: [
        { icon: '📊', label: 'Dashboard', path: '/volunteer-dashboard' },
        { icon: '🙋', label: 'My Tasks', path: '/volunteer-dashboard' },
      ],
    }

    return [...commonLinks, ...(roleSpecificLinks[role] || [])]
  }

  const userInfo = {
    name: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User',
    role: user?.role || 'guest',
    avatar: getInitials(user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim())
  }

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Top Navbar - Fixed */}
      <div style={{ 
        background: '#1a3a6b', 
        padding: '0 24px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        height: '56px', 
        position: 'fixed', 
        top: 0, 
        width: '100%', 
        zIndex: 100, 
        boxSizing: 'border-box',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{ 
              background: '#fff', 
              borderRadius: '8px', 
              width: '36px', 
              height: '36px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: '800', 
              color: '#1a3a6b', 
              fontSize: '13px' 
            }}>
              CE
            </div>
            <span style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>CampusEvents</span>
          </Link>
          <span style={{ color: '#93c5fd', fontSize: '13px' }}>· VIT Pune</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Navigation Links */}
          {user && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link to="/events" style={{ color: '#93c5fd', fontSize: '13px', textDecoration: 'none', fontWeight: '600', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = '#93c5fd'}>
                Events
              </Link>
              <Link to="/profile" style={{ color: '#93c5fd', fontSize: '13px', textDecoration: 'none', fontWeight: '600', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = '#93c5fd'}>
                Profile
              </Link>
            </nav>
          )}
          
          {/* User Menu */}
          {user ? (
            <>
              <span style={{ color: '#93c5fd', fontSize: '13px' }}>🔔</span>
              <button 
                onClick={logout} 
                style={{ 
                  color: '#93c5fd', 
                  fontSize: '12px', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  textDecoration: 'none',
                  fontWeight: '600',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = '#93c5fd'}
              >
                Logout
              </button>
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
              }}
              onClick={() => navigate('/profile')}
              title={userInfo.name}>
                {userInfo.avatar}
              </div>
            </>
          ) : (
            <Link 
              to="/login" 
              style={{ 
                background: '#2563eb', 
                color: '#fff', 
                padding: '8px 16px', 
                borderRadius: '8px', 
                fontSize: '13px', 
                fontWeight: '600', 
                textDecoration: 'none',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.target.style.background = '#1d4ed8'}
              onMouseLeave={e => e.target.style.background = '#2563eb'}
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ 
        display: 'flex', 
        marginTop: '56px',
        minHeight: 'calc(100vh - 56px)'
      }}>
        
        {/* Sidebar (Optional) */}
        {showSidebar && user && (
          <aside style={{ 
            width: '240px', 
            background: '#fff', 
            borderRight: '1px solid #dbeafe',
            padding: '20px 0',
            position: 'fixed',
            left: 0,
            top: '56px',
            bottom: 0,
            overflowY: 'auto',
            zIndex: 50
          }}>
            <div style={{ padding: '0 16px', marginBottom: '20px' }}>
              <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Navigation
              </p>
            </div>
            
            <nav>
              {getNavigationLinks().map((link, index) => (
                <Link 
                  key={index}
                  to={link.path}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    padding: '12px 16px',
                    color: '#1a3a6b',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '18px' }}>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>

            {/* User Info Card in Sidebar */}
            <div style={{ 
              margin: '20px 16px',
              padding: '16px',
              background: '#f8faff',
              border: '1px solid #dbeafe',
              borderRadius: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ 
                  background: '#1a3a6b', 
                  borderRadius: '50%', 
                  width: '40px', 
                  height: '40px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#fff', 
                  fontWeight: '700', 
                  fontSize: '14px' 
                }}>
                  {userInfo.avatar}
                </div>
                <div>
                  <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700', marginBottom: '2px' }}>
                    {userInfo.name}
                  </p>
                  <span style={{ 
                    background: '#dcfce7', 
                    color: '#16a34a', 
                    borderRadius: '4px', 
                    fontSize: '10px', 
                    padding: '2px 6px', 
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {userInfo.role}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Page Content */}
        <main style={{ 
          flex: 1,
          marginLeft: showSidebar && user ? '240px' : '0',
          transition: 'margin-left 0.3s'
        }}>
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer style={{ 
        background: '#1a3a6b', 
        color: '#93c5fd', 
        textAlign: 'center', 
        padding: '20px', 
        fontSize: '13px',
        marginLeft: showSidebar && user ? '240px' : '0',
        transition: 'margin-left 0.3s'
      }}>
        © 2025 CampusEvents · Vishwakarma Institute of Technology, Pune
      </footer>
    </div>
  )
}
