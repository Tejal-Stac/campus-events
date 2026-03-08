import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { eventService } from '../api/eventService'

const saVerticals = [
  'Technical', 'Cultural', 'Sports', 'Social', 'Entrepreneurship',
  'Literary', 'NSS', 'NCC', 'Professional Body', 'Other'
]

export default function FacultyDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [myEvents, setMyEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingEvent, setEditingEvent] = useState(null)
  const [newEvent, setNewEvent] = useState({
    title: '',
    organisingClub: '',
    saVertical: '',
    date: '',
    timeFrom: '',
    timeTo: '',
    venue: '',
    onlineLink: '',
    targetAudience: '',
    expectedCount: '',
    fees: '',
    contact: '',
    category: '',
    seats: '',
    keyFeatures: '',
    desc: '',
  })

  const updateEvent = (field, value) => setNewEvent(prev => ({ ...prev, [field]: value }))

  // Fetch faculty's events on mount
  useEffect(() => {
    fetchMyEvents()
  }, [])

  const fetchMyEvents = async () => {
    try {
      setLoading(true)
      const events = await eventService.getAllEvents()
      
      // Filter events created by this faculty (you may need to add created_by field in backend)
      // For now, showing all events - update this when you have creator tracking
      setMyEvents(events || [])
    } catch (err) {
      console.error('Error fetching events:', err)
      setMyEvents([])
    } finally {
      setLoading(false)
    }
  }

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'FA'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  // Download report as CSV
  const downloadReportCSV = (event) => {
    const csvContent = [
      ['Event Report'],
      [''],
      ['Event Name', event.title],
      ['Organising Club/Dept', event.organising_club || event.organisingClub || 'N/A'],
      ['SA Vertical', event.sa_vertical || event.saVertical || 'N/A'],
      ['Date', formatDate(event.date)],
      ['Time', `${event.time_from || event.timeFrom || 'N/A'} to ${event.time_to || event.timeTo || 'N/A'}`],
      ['Venue', event.venue],
      ['Target Audience', event.target_audience || event.targetAudience || 'All'],
      ['Expected Count', event.expected_count || event.expectedCount || 0],
      ['Total Seats', event.seats],
      ['Fees', event.fees || 'Free'],
      ['Contact', event.contact],
      ['Status', event.status || 'Active'],
      [''],
      ['Generated on', new Date().toLocaleString()],
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}_report.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Download report as PDF (simple version using print)
  const downloadReportPDF = (event) => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>${event.title} - Event Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #1a3a6b; border-bottom: 3px solid #1a3a6b; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            td:first-child { font-weight: bold; width: 200px; color: #1a3a6b; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>📋 Event Report</h1>
          <table>
            <tr><td>Event Name</td><td>${event.title}</td></tr>
            <tr><td>Organising Club/Dept</td><td>${event.organising_club || event.organisingClub || 'N/A'}</td></tr>
            <tr><td>SA Vertical</td><td>${event.sa_vertical || event.saVertical || 'N/A'}</td></tr>
            <tr><td>Date</td><td>${formatDate(event.date)}</td></tr>
            <tr><td>Time</td><td>${event.time_from || event.timeFrom || 'N/A'} to ${event.time_to || event.timeTo || 'N/A'}</td></tr>
            <tr><td>Venue</td><td>${event.venue}</td></tr>
            <tr><td>Target Audience</td><td>${event.target_audience || event.targetAudience || 'All'}</td></tr>
            <tr><td>Expected Count</td><td>${event.expected_count || event.expectedCount || 0}</td></tr>
            <tr><td>Total Seats</td><td>${event.seats}</td></tr>
            <tr><td>Fees</td><td>${event.fees || 'Free'}</td></tr>
            <tr><td>Contact</td><td>${event.contact}</td></tr>
            <tr><td>Status</td><td>${event.status || 'Active'}</td></tr>
          </table>
          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>© 2025 CampusEvents - VIT Pune</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  // Edit event handler
  const handleEditEvent = (event) => {
    setEditingEvent(event)
    setNewEvent({
      title: event.title,
      organisingClub: event.organising_club || event.organisingClub || '',
      saVertical: event.sa_vertical || event.saVertical || '',
      date: event.date?.split('T')[0] || '',
      timeFrom: event.time_from || event.timeFrom || '',
      timeTo: event.time_to || event.timeTo || '',
      venue: event.venue || '',
      onlineLink: event.online_link || event.onlineLink || '',
      targetAudience: event.target_audience || event.targetAudience || '',
      expectedCount: event.expected_count || event.expectedCount || '',
      fees: event.fees || 'Free',
      contact: event.contact || '',
      category: event.category || '',
      seats: event.seats || '',
      keyFeatures: Array.isArray(event.key_features) ? event.key_features.join(', ') : event.keyFeatures || '',
      desc: event.description || event.desc || '',
    })
    setActiveTab('create')
  }

  // Save edited event
  const handleSaveEvent = async () => {
    try {
      if (editingEvent) {
        // Update existing event
        await eventService.updateEvent(editingEvent.id, newEvent)
        alert('Event updated successfully!')
      } else {
        // Create new event - include eventType
        const eventData = {
          ...newEvent,
          eventType: newEvent.category || 'General'
        }
        await eventService.createEvent(eventData)
        alert('Event created and submitted for approval!')
      }
      setEditingEvent(null)
      setNewEvent({
        title: '', organisingClub: '', saVertical: '', date: '', timeFrom: '',
        timeTo: '', venue: '', onlineLink: '', targetAudience: '', expectedCount: '',
        fees: '', contact: '', category: '', seats: '', keyFeatures: '', desc: ''
      })
      fetchMyEvents()
    } catch (err) {
      console.error('Error saving event:', err)
      alert('Failed to save event: ' + (err.response?.data?.message || err.message))
    }
  }

  const inputStyle = {
    background: '#f8faff', border: '1px solid #cbd5e1', color: '#1a3a6b',
    borderRadius: '10px', width: '100%', padding: '11px 14px',
    fontSize: '13px', outline: 'none', boxSizing: 'border-box'
  }
  const labelStyle = {
    color: '#1a3a6b', fontSize: '13px', fontWeight: '600',
    display: 'block', marginBottom: '6px'
  }

  // Get faculty info from AuthContext with proper null checks
  const facultyInfo = {
    name: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Faculty',
    designation: user?.designation || 'Faculty',
    department: user?.department || 'N/A',
    campus: user?.campus || 'N/A',
    email: user?.email || 'N/A',
    avatar: getInitials(user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim())
  }

  // Pending approvals - TODO: Fetch from backend when approval system is implemented
  const pendingApprovals = []

  // Role-based protection: Redirect if not faculty or dean
  useEffect(() => {
    const userRole = user?.assignedRole || user?.role
    if (user && !['faculty', 'dean'].includes(userRole)) {
      const roleRedirectMap = {
        student: '/student-dashboard',
        coordinator: '/coordinator-dashboard',
        club_head: '/coordinator-dashboard',
        volunteer: '/volunteer-dashboard',
        admin: '/admin-dashboard'
      }
      const redirectPath = roleRedirectMap[userRole] || '/dashboard'
      navigate(redirectPath, { replace: true })
    }
  }, [user, navigate])

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'events', label: '📅 My Events' },
    { id: 'create', label: editingEvent ? '✏️ Edit Event' : '➕ Create Event' },
    { id: 'reports', label: '📋 Reports' },
  ]

  if (loading) {
    return (
      <div style={{ background: '#f0f4ff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#1a3a6b', fontSize: '16px', fontWeight: '600' }}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* Top Navbar */}
      <div style={{ background: '#1a3a6b', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px', position: 'fixed', top: 0, width: '100%', zIndex: 100, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#fff', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#1a3a6b', fontSize: '13px' }}>CE</div>
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>CampusEvents</span>
          <span style={{ color: '#93c5fd', fontSize: '13px' }}>· VIT Pune</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#93c5fd', fontSize: '13px' }}>🔔</span>
          <button onClick={logout} style={{ color: '#93c5fd', fontSize: '12px', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}>
            Logout
          </button>
          <div style={{ background: '#2563eb', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '13px' }}>{facultyInfo.avatar}</div>
        </div>
      </div>

      {/* Faculty Info Bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #dbeafe', padding: '10px 24px', marginTop: '56px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#1a3a6b', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '16px' }}>{facultyInfo.avatar}</div>
          <div>
            <p style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '15px' }}>{facultyInfo.name}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#dcfce7', color: '#16a34a', borderRadius: '20px', fontSize: '11px', padding: '2px 10px', fontWeight: '600' }}>● Active</span>
              <span style={{ color: '#64748b', fontSize: '12px' }}>{facultyInfo.designation}</span>
            </div>
          </div>
        </div>
        <div style={{ color: '#64748b', fontSize: '13px' }}>Dept: <strong style={{ color: '#1a3a6b' }}>{facultyInfo.department}</strong></div>
        <div style={{ color: '#64748b', fontSize: '13px' }}>Campus: <strong style={{ color: '#1a3a6b' }}>{facultyInfo.campus}</strong></div>
        <div style={{ color: '#64748b', fontSize: '13px' }}>Email: <strong style={{ color: '#1a3a6b' }}>{facultyInfo.email}</strong></div>
      </div>

      {/* Breadcrumb */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '8px 24px' }}>
        <p style={{ color: '#64748b', fontSize: '13px' }}>🏠 Home / <span style={{ color: '#1a3a6b', fontWeight: '600' }}>Faculty Dashboard</span></p>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Events Created', value: myEvents.length, icon: '📅', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
            { label: 'Active Events', value: myEvents.filter(e => e.status === 'Active').length, icon: '👥', color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
            { label: 'Completed Events', value: myEvents.filter(e => e.status === 'Completed').length, icon: '✅', color: '#7c3aed', bg: '#fdf4ff', border: '#e9d5ff' },
            { label: 'Pending Approvals', value: pendingApprovals.length, icon: '⏳', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '16px', textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>{s.icon}</div>
              <div style={{ color: s.color, fontSize: '26px', fontWeight: '800' }}>{s.value}</div>
              <div style={{ color: '#64748b', fontSize: '12px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '4px', display: 'inline-flex', gap: '4px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', border: 'none', cursor: 'pointer',
                background: activeTab === tab.id ? '#1a3a6b' : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#64748b'
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ color: '#1a3a6b', fontWeight: '700' }}>📅 My Events</h2>
                <button onClick={() => setActiveTab('create')}
                  style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                  + New Event
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {myEvents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                    <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>No events created yet</p>
                    <p style={{ fontSize: '12px' }}>Create your first event to get started</p>
                  </div>
                ) : (
                  myEvents.slice(0, 5).map(e => {
                    const pct = e.registered && e.seats ? Math.round((e.registered / e.seats) * 100) : 0
                    return (
                      <div key={e.id} style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <div>
                            <p style={{ color: '#1a3a6b', fontSize: '14px', fontWeight: '700' }}>{e.title}</p>
                            <p style={{ color: '#64748b', fontSize: '11px' }}>
                              📅 {formatDate(e.date)}
                            </p>
                            <p style={{ color: '#64748b', fontSize: '11px' }}>📍 {e.venue}</p>
                          </div>
                          <span style={{ 
                            background: e.status === 'Active' ? '#dcfce7' : '#f1f5f9', 
                            color: e.status === 'Active' ? '#16a34a' : '#64748b', 
                            borderRadius: '6px', fontSize: '11px', padding: '3px 8px', 
                            fontWeight: '600', height: 'fit-content' 
                          }}>
                            {e.status || 'Active'}
                          </span>
                        </div>
                        {e.seats && (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ color: '#64748b', fontSize: '11px' }}>
                                {e.registered || 0}/{e.seats} registered
                              </span>
                              <span style={{ color: pct > 80 ? '#dc2626' : '#16a34a', fontSize: '11px', fontWeight: '600' }}>
                                {pct}%
                              </span>
                            </div>
                            <div style={{ background: '#dbeafe', borderRadius: '4px', height: '5px' }}>
                              <div style={{ 
                                width: `${pct}%`, 
                                background: pct > 80 ? '#dc2626' : '#1a3a6b', 
                                borderRadius: '4px', height: '5px' 
                              }} />
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
                <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>⏳ Approval Status</h2>
                {pendingApprovals.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                    <p style={{ fontSize: '12px' }}>All events approved</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {pendingApprovals.map(p => (
                      <div key={p.id} style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700' }}>{p.title}</p>
                          <p style={{ color: '#64748b', fontSize: '11px' }}>Submitted: {p.submittedOn}</p>
                        </div>
                        <span style={{ background: p.status === 'Approved' ? '#dcfce7' : '#fef9c3', color: p.status === 'Approved' ? '#16a34a' : '#a16207', borderRadius: '6px', fontSize: '11px', padding: '3px 10px', fontWeight: '600' }}>
                          {p.status === 'Approved' ? '✅ Approved' : '⏳ Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
                <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>⚡ Quick Actions</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { icon: '➕', label: 'Create Event', action: () => setActiveTab('create') },
                    { icon: '📋', label: 'View Reports', action: () => setActiveTab('reports') },
                    { icon: '📅', label: 'My Events', action: () => setActiveTab('events') },
                    { icon: '📜', label: 'Certificates', action: () => {} },
                  ].map(a => (
                    <button key={a.label} onClick={a.action}
                      style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '10px', padding: '16px', textAlign: 'center', cursor: 'pointer' }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = '#1a3a6b'; e.currentTarget.style.background = '#eff6ff' }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = '#dbeafe'; e.currentTarget.style.background = '#f8faff' }}>
                      <div style={{ fontSize: '24px', marginBottom: '4px' }}>{a.icon}</div>
                      <p style={{ color: '#1a3a6b', fontSize: '12px', fontWeight: '600' }}>{a.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Events Tab */}
        {activeTab === 'events' && (
          <div>
            {myEvents.length === 0 ? (
              <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '60px', textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📅</div>
                <h3 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '8px' }}>No events yet</h3>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Create your first event to get started</p>
                <button 
                  onClick={() => setActiveTab('create')}
                  style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                >
                  ➕ Create Event
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                {myEvents.map(e => {
                  const pct = e.seats ? Math.round(((e.registered || 0) / e.seats) * 100) : 0
                  return (
                    <div key={e.id} style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: '6px', fontSize: '12px', padding: '3px 10px', fontWeight: '600' }}>{e.category || 'Event'}</span>
                        <span style={{ background: e.status === 'Active' ? '#dcfce7' : '#f1f5f9', color: e.status === 'Active' ? '#16a34a' : '#64748b', borderRadius: '6px', fontSize: '11px', padding: '3px 8px', fontWeight: '600' }}>{e.status || 'Active'}</span>
                      </div>
                      <h3 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '16px', marginBottom: '10px' }}>{e.title}</h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{ fontSize: '11px' }}>📅</span>
                          <span style={{ color: '#64748b', fontSize: '11px' }}>Date:</span>
                          <span style={{ color: '#1a3a6b', fontSize: '11px', fontWeight: '600' }}>{formatDate(e.date)}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{ fontSize: '11px' }}>⏰</span>
                          <span style={{ color: '#64748b', fontSize: '11px' }}>Time:</span>
                          <span style={{ color: '#1a3a6b', fontSize: '11px', fontWeight: '600' }}>{e.time_from || e.timeFrom || 'TBA'} to {e.time_to || e.timeTo || 'TBA'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{ fontSize: '11px' }}>📍</span>
                          <span style={{ color: '#64748b', fontSize: '11px' }}>Venue:</span>
                          <span style={{ color: '#1a3a6b', fontSize: '11px', fontWeight: '600' }}>{e.venue}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{ fontSize: '11px' }}>👥</span>
                          <span style={{ color: '#64748b', fontSize: '11px' }}>Capacity:</span>
                          <span style={{ color: '#1a3a6b', fontSize: '11px', fontWeight: '600' }}>{e.seats || 'N/A'}</span>
                        </div>
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: '#64748b', fontSize: '11px' }}>{e.registered || 0}/{e.seats} registered</span>
                          <span style={{ color: pct > 80 ? '#dc2626' : '#16a34a', fontSize: '11px', fontWeight: '600' }}>{pct}%</span>
                        </div>
                        <div style={{ background: '#dbeafe', borderRadius: '4px', height: '6px' }}>
                          <div style={{ width: `${pct}%`, background: pct > 80 ? '#dc2626' : '#1a3a6b', borderRadius: '4px', height: '6px' }} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleEditEvent(e)}
                          style={{ flex: 1, background: '#f0f4ff', color: '#1a3a6b', border: '1px solid #dbeafe', borderRadius: '8px', padding: '7px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => downloadReportCSV(e)}
                          style={{ flex: 1, background: '#f0f4ff', color: '#1a3a6b', border: '1px solid #dbeafe', borderRadius: '8px', padding: '7px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}
                        >
                          📊 CSV
                        </button>
                        <button 
                          onClick={() => downloadReportPDF(e)}
                          style={{ flex: 1, background: '#f0f4ff', color: '#1a3a6b', border: '1px solid #dbeafe', borderRadius: '8px', padding: '7px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}
                        >
                          📜 PDF
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Create Event Tab */}
        {activeTab === 'create' && (
          <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '28px', maxWidth: '700px' }}>
            <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '4px' }}>
              {editingEvent ? '✏️ Edit Event' : '➕ Create New Event'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>
              Fill in all details. It will be sent to Dean for approval.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <div>
                <label style={labelStyle}>Event Name *</label>
                <input style={inputStyle} placeholder="e.g. National Hackathon 2025"
                  value={newEvent.title} onChange={e => updateEvent('title', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              </div>

              <div>
                <label style={labelStyle}>Organising Club / Dept Name *</label>
                <input style={inputStyle} placeholder="e.g. CSE Department / Tech Club"
                  value={newEvent.organisingClub} onChange={e => updateEvent('organisingClub', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              </div>

              <div>
                <label style={labelStyle}>SA Vertical Name *</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }}
                  value={newEvent.saVertical} onChange={e => updateEvent('saVertical', e.target.value)}>
                  <option value="">Select SA Vertical</option>
                  {saVerticals.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Event Date *</label>
                  <input style={inputStyle} type="date"
                    value={newEvent.date} onChange={e => updateEvent('date', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }}
                    value={newEvent.category} onChange={e => updateEvent('category', e.target.value)}>
                    <option value="">Select category</option>
                    {['Hackathon', 'Cultural', 'Seminar', 'Sports', 'Workshop', 'Networking'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Time *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '10px', alignItems: 'center' }}>
                  <input style={inputStyle} type="time"
                    value={newEvent.timeFrom} onChange={e => updateEvent('timeFrom', e.target.value)} />
                  <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>to</span>
                  <input style={inputStyle} type="time"
                    value={newEvent.timeTo} onChange={e => updateEvent('timeTo', e.target.value)} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Venue *</label>
                <input style={inputStyle} placeholder="e.g. Main Auditorium, Lab Block 3"
                  value={newEvent.venue} onChange={e => updateEvent('venue', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              </div>

              <div>
                <label style={labelStyle}>If Online Link <span style={{ color: '#94a3b8', fontWeight: '400' }}>(optional)</span></label>
                <input style={inputStyle} placeholder="e.g. meet.google.com/abc-xyz"
                  value={newEvent.onlineLink} onChange={e => updateEvent('onlineLink', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              </div>

              <div>
                <label style={labelStyle}>Target Audience *</label>
                <input style={inputStyle} placeholder="e.g. All Branches - 2nd & 3rd Year"
                  value={newEvent.targetAudience} onChange={e => updateEvent('targetAudience', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Expected Count *</label>
                  <input style={inputStyle} type="number" placeholder="e.g. 150"
                    value={newEvent.expectedCount} onChange={e => updateEvent('expectedCount', e.target.value)}
                    onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                    onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
                </div>
                <div>
                  <label style={labelStyle}>Total Seats *</label>
                  <input style={inputStyle} type="number" placeholder="e.g. 120"
                    value={newEvent.seats} onChange={e => updateEvent('seats', e.target.value)}
                    onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                    onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Fees if any *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {['Free', 'Paid'].map(f => (
                    <button key={f} onClick={() => updateEvent('fees', f)}
                      style={{
                        padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                        background: newEvent.fees === f ? '#1a3a6b' : '#f0f4ff',
                        color: newEvent.fees === f ? '#fff' : '#64748b',
                        border: `2px solid ${newEvent.fees === f ? '#1a3a6b' : '#dbeafe'}`
                      }}>
                      {f === 'Free' ? '🆓 Free' : '💰 Paid'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Contact No *</label>
                <input style={inputStyle} placeholder="e.g. 9876543210"
                  value={newEvent.contact} onChange={e => updateEvent('contact', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              </div>

              <div>
                <label style={labelStyle}>Key Features *</label>
                <input style={inputStyle} placeholder="e.g. Cash Prizes, Certificate, Industry Mentors"
                  value={newEvent.keyFeatures} onChange={e => updateEvent('keyFeatures', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              </div>

              <div>
                <label style={labelStyle}>Event Description *</label>
                <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                  placeholder="Describe your event in detail..."
                  value={newEvent.desc} onChange={e => updateEvent('desc', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              </div>

              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px' }}>
                <p style={{ color: '#a16207', fontSize: '12px' }}>⚠️ This event will be submitted to the <strong>Dean for approval</strong> before going live.</p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => {
                    setEditingEvent(null)
                    setNewEvent({
                      title: '', organisingClub: '', saVertical: '', date: '', timeFrom: '',
                      timeTo: '', venue: '', onlineLink: '', targetAudience: '', expectedCount: '',
                      fees: '', contact: '', category: '', seats: '', keyFeatures: '', desc: ''
                    })
                    setActiveTab('overview')
                  }}
                  style={{ flex: 1, background: '#f0f4ff', color: '#1a3a6b', border: '1px solid #dbeafe', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                >
                  ❌ Cancel
                </button>
                <button 
                  onClick={handleSaveEvent}
                  style={{ flex: 2, background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
                >
                  {editingEvent ? '💾 Update Event' : '📤 Submit for Approval'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>📋 Event Reports</h2>
            {myEvents.filter(e => e.status === 'Completed').length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                <p style={{ fontSize: '14px', fontWeight: '600' }}>No completed events yet</p>
                <p style={{ fontSize: '12px' }}>Reports will appear here after events are completed</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {myEvents.filter(e => e.status === 'Completed').map(e => (
                  <div key={e.id} style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>{e.title}</h3>
                        <span style={{ background: '#dcfce7', color: '#16a34a', borderRadius: '6px', fontSize: '11px', padding: '3px 10px', fontWeight: '600' }}>✅ Completed</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => downloadReportCSV(e)}
                          style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          📊 CSV
                        </button>
                        <button 
                          onClick={() => downloadReportPDF(e)}
                          style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          📜 PDF
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                      {[
                        { label: 'Event Name', value: e.title },
                        { label: 'Venue', value: e.venue },
                        { label: 'Date', value: formatDate(e.date) },
                        { label: 'Registered', value: `${e.registered || 0}/${e.seats}` },
                      ].map(item => (
                        <div key={item.label} style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '8px', padding: '10px 14px' }}>
                          <p style={{ color: '#64748b', fontSize: '11px' }}>{item.label}</p>
                          <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700' }}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      <footer style={{ background: '#1a3a6b', color: '#93c5fd', textAlign: 'center', padding: '20px', fontSize: '13px', marginTop: '40px' }}>
        © 2025 CampusEvents · Vishwakarma Institute of Technology, Pune
      </footer>
    </div>
  )
}
