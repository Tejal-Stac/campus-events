import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { userService } from '../api/userService'
import { eventService } from '../api/eventService'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [student, setStudent] = useState(null)
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Fetch user profile from PostgreSQL
      const profile = await userService.getProfile()
      setStudent(profile)
      
      // Fetch user's registered events from PostgreSQL
      const registrations = await userService.getMyRegistrations()
      
      // CRITICAL FIX: Filter for approved events only and upcoming dates
      const now = new Date()
      const upcoming = (registrations || []).filter(event => {
        const eventDate = new Date(event.date || event.event_date)
        const isUpcoming = eventDate >= now
        const isApproved = event.status === 'approved' || event.status === 'Active'
        return isUpcoming && isApproved
      })
      
      console.log(`📊 Student Dashboard: ${registrations?.length || 0} total registrations, ${upcoming.length} approved & upcoming`)
      setUpcomingEvents(upcoming)
      setError(null)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ background: '#f0f4ff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '56px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#1a3a6b', fontSize: '16px', fontWeight: '600' }}>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ background: '#f0f4ff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '56px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <p style={{ color: '#dc2626', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>{error}</p>
          <button onClick={fetchDashboardData} style={{ background: '#2563eb', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div style={{ background: '#f0f4ff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '56px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <p style={{ color: '#1a3a6b', fontSize: '16px', fontWeight: '600' }}>Please log in to view your dashboard</p>
        </div>
      </div>
    )
  }

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'NA'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Dummy data for features not yet implemented with real data
  const aiSuggestions = [
    { title: 'Robotics Competition', match: '94%', reason: 'Based on your tech event history' },
    { title: 'Industry Connect – CSE', match: '88%', reason: 'Matches your branch & year' },
    { title: 'Finance & Startup Summit', match: '76%', reason: 'Similar seminars attended' },
  ]

  const skills = ['Python', 'Machine Learning', 'C++', 'Problem Solving', 'Leadership', 'Coordination', 'Teamwork', 'Public Speaking']

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* Student Info Bar - VIT Style */}
      <div style={{ background: '#fff', borderBottom: '1px solid #dbeafe', padding: '10px 24px', marginTop: '56px', display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
        <div className="flex items-center gap-3">
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#1a3a6b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '16px' }}>
            {getInitials(student?.name || `${student?.firstName} ${student?.lastName}`)}
          </div>
          <div>
            <p style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '15px' }}>
              {student?.name || `${student?.firstName || ''} ${student?.lastName || ''}`.trim() || 'Student'}
            </p>
            <div className="flex items-center gap-2">
              <span style={{ background: '#dcfce7', color: '#16a34a', borderRadius: '20px', fontSize: '11px', padding: '2px 10px', fontWeight: '600' }}>● Active</span>
            </div>
          </div>
        </div>
        <div style={{ color: '#64748b', fontSize: '13px' }}>Email: <strong style={{ color: '#1a3a6b' }}>{student?.email || 'N/A'}</strong></div>
        <div style={{ color: '#64748b', fontSize: '13px' }}>GR No: <strong style={{ color: '#1a3a6b' }}>{student?.grNumber || 'N/A'}</strong></div>
        <div style={{ color: '#64748b', fontSize: '13px' }}>Dept: <strong style={{ color: '#1a3a6b' }}>{student?.department || 'N/A'}</strong></div>
        <div style={{ color: '#64748b', fontSize: '13px' }}>Points: <strong style={{ color: '#1a3a6b' }}>{student?.points || 0}</strong></div>
      </div>

      {/* Breadcrumb */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '8px 24px' }}>
        <p style={{ color: '#64748b', fontSize: '13px' }}>🏠 Home / <span style={{ color: '#1a3a6b', fontWeight: '600' }}>Dashboard</span></p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Events Registered', value: upcomingEvents?.length || 0, icon: '🎯', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
            { label: 'Certificates', value: 0, icon: '📜', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
            { label: 'Skills Gained', value: 0, icon: '💡', bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
            { label: 'Points Earned', value: student?.points || 0, icon: '⭐', bg: '#fdf4ff', color: '#7e22ce', border: '#e9d5ff' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '12px', textAlign: 'center', padding: '20px' }}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div style={{ color: s.color, fontSize: '28px', fontWeight: '700' }}>{s.value}</div>
              <div style={{ color: '#64748b', fontSize: '12px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Quick Links - VIT Style Tiles */}
            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px', fontSize: '16px' }}>⚡ Quick Access</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: '📅', label: 'Browse Events', to: '/events', bg: '#eff6ff' },
                  { icon: '📜', label: 'My Certificates', to: '/certificates', bg: '#f0fdf4' },
                  { icon: '👤', label: 'My Profile', to: '/profile', bg: '#fdf4ff' },
                  { icon: '🤝', label: 'Find Team', to: '/team', bg: '#fff7ed' },
                  { icon: '🏆', label: 'Leaderboard', to: '/dashboard', bg: '#fffbeb' },
                  { icon: '🔔', label: 'Reminders', to: '/dashboard', bg: '#fef2f2' },
                ].map(q => (
                  <Link key={q.label} to={q.to} style={{ background: q.bg, border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px 12px', textAlign: 'center', textDecoration: 'none', display: 'block', transition: 'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = '#1a3a6b'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{q.icon}</div>
                    <p style={{ color: '#1a3a6b', fontSize: '12px', fontWeight: '600' }}>{q.label}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
              <div className="flex justify-between items-center mb-4">
                <h2 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '16px' }}>📅 My Upcoming Events</h2>
                <Link to="/events" style={{ color: '#2563eb', fontSize: '12px', textDecoration: 'none' }}>View all →</Link>
              </div>
              {upcomingEvents?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
                  <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>No upcoming events</p>
                  <p style={{ fontSize: '12px' }}>Register for events to see them here</p>
                  <Link to="/events" style={{ display: 'inline-block', marginTop: '16px', background: '#2563eb', color: '#fff', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px' }}>Browse Events</Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {upcomingEvents?.map(e => (
                    <div key={e.event_id} style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '10px', padding: '14px' }} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div style={{ background: '#dbeafe', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🎫</div>
                        <div>
                          <p style={{ color: '#1a3a6b', fontSize: '14px', fontWeight: '600' }}>{e.title}</p>
                          <p style={{ color: '#64748b', fontSize: '12px' }}>{formatDate(e.date)} · {e.category || 'Event'}</p>
                        </div>
                      </div>
                      <span style={{ background: '#dcfce7', color: '#16a34a', borderRadius: '6px', fontSize: '11px', padding: '3px 10px', fontWeight: '600' }}>
                        Registered
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Participation History */}
            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '16px', marginBottom: '16px' }}>🏆 Participation History</h2>
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Coming Soon</p>
                <p style={{ fontSize: '12px' }}>Past event participation will appear here</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">

            {/* AI Suggestions */}
            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>🤖 AI Recommendations</h2>
              <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '16px' }}>Based on your profile & history</p>
              <div className="flex flex-col gap-3">
                {aiSuggestions.map(s => (
                  <div key={s.title} style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '10px', padding: '12px', cursor: 'pointer' }}
                    onMouseOver={e => e.currentTarget.style.borderColor = '#1a3a6b'}
                    onMouseOut={e => e.currentTarget.style.borderColor = '#dbeafe'}>
                    <div className="flex justify-between items-start mb-1">
                      <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '600' }}>{s.title}</p>
                      <span style={{ background: '#dbeafe', color: '#1d4ed8', borderRadius: '6px', fontSize: '10px', padding: '2px 6px', flexShrink: 0, marginLeft: '8px', fontWeight: '700' }}>{s.match}</span>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '11px' }}>{s.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '16px', marginBottom: '16px' }}>💡 Skills Gained</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <span key={s} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '20px', fontSize: '12px', padding: '4px 12px', fontWeight: '500' }}>{s}</span>
                ))}
              </div>
            </div>

            {/* Search Bar - VIT Style */}
            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '16px', marginBottom: '12px' }}>🔍 Search Events</h2>
              <div style={{ position: 'relative' }}>
                <input placeholder="Search Link..." style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 40px 10px 14px', fontSize: '13px', outline: 'none', color: '#1a3a6b', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#1a3a6b'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#1a3a6b', color: '#93c5fd', textAlign: 'center', padding: '16px', fontSize: '12px', marginTop: '32px' }}>
        Powered by <strong style={{ color: '#fff' }}>CampusEvents</strong> · Vishwakarma Institute of Technology, Pune
      </div>

    </div>
  )
}