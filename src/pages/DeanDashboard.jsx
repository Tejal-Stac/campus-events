import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { deanService } from '../api/deanService'
import { eventService } from '../api/eventService'

export default function DeanDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [students, setStudents] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [campusFilter, setCampusFilter] = useState('All')
  const [assignModal, setAssignModal] = useState(null)
  const [assignRole, setAssignRole] = useState('coordinator')

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch students
      const studentsData = await deanService.getStudents()
      setStudents(studentsData || [])
      
      // Fetch events
      try {
        const eventsData = await eventService.getAllEvents()
        setEvents(eventsData || [])
      } catch (err) {
        console.error('Error fetching events:', err)
        setEvents([])
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      alert('Failed to load dashboard data: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  // Promote student handler
  const handlePromote = async () => {
    if (!assignModal || !assignRole) return
    
    try {
      const result = await deanService.promoteStudent(assignModal.id, assignRole)
      alert(result.message || 'Student promoted successfully!')
      setAssignModal(null)
      
      // Refresh students list
      fetchDashboardData()
    } catch (err) {
      console.error('Error promoting student:', err)
      alert('Failed to promote student: ' + (err.response?.data?.message || err.message))
    }
  }

  // Approve event handler
  const handleApproveEvent = async (eventId) => {
    if (!window.confirm('Approve this event?')) return
    
    try {
      await eventService.approveEvent(eventId)
      alert('✅ Event approved successfully!')
      fetchDashboardData() // Refresh events list
    } catch (err) {
      console.error('Error approving event:', err)
      alert('Failed to approve event: ' + (err.response?.data?.message || err.message))
    }
  }

  // Reject event handler
  const handleRejectEvent = async (eventId) => {
    if (!window.confirm('Reject this event? This cannot be undone.')) return
    
    try {
      await eventService.rejectEvent(eventId)
      alert('❌ Event rejected')
      fetchDashboardData() // Refresh events list
    } catch (err) {
      console.error('Error rejecting event:', err)
      alert('Failed to reject event: ' + (err.response?.data?.message || err.message))
    }
  }

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'DN'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Dean info from AuthContext with proper null checks
  const deanInfo = {
    name: user?.name || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Dean'),
    email: user?.email || 'dean@vit.edu',
    avatar: getInitials(user?.name || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null))
  }

  // Role-based protection: Redirect if not dean/admin
  useEffect(() => {
    if (user && !['dean', 'admin'].includes(user.role)) {
      const roleRedirectMap = {
        student: '/student-dashboard',
        faculty: '/faculty-dashboard',
        coordinator: '/coordinator-dashboard',
        club_head: '/coordinator-dashboard',
        volunteer: '/volunteer-dashboard'
      }
      const redirectPath = roleRedirectMap[user.role] || '/dashboard'
      navigate(redirectPath, { replace: true })
    }
  }, [user, navigate])

  const filteredUsers = students.filter(u => {
    const matchCampus = campusFilter === 'All' || u.campus === campusFilter
    return matchCampus
  })

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'events', label: '🎫 Event Approvals' },
    { id: 'students', label: '👥 Manage Students' },
    { id: 'assign', label: '🎯 Promote Students' },
    { id: 'reports', label: '📈 Reports' },
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

      {/* Assign Role Modal */}
      {assignModal && (
        <div 
          onClick={() => setAssignModal(null)}
          style={{ 
            position: 'fixed', inset: 0, background: 'rgba(26,58,107,0.5)', 
            zIndex: 200, display: 'flex', alignItems: 'center', 
            justifyContent: 'center', padding: '20px' 
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{ 
              background: '#fff', borderRadius: '20px', padding: '32px', 
              maxWidth: '460px', width: '100%', 
              boxShadow: '0 24px 64px rgba(26,58,107,0.2)' 
            }}
          >
            <h2 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '18px', marginBottom: '4px' }}>
              🎯 Promote Student
            </h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
              Promoting: <strong style={{ color: '#1a3a6b' }}>
                {assignModal?.firstName || assignModal?.first_name || ''} {assignModal?.lastName || assignModal?.last_name || ''}
              </strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                  Select Role *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {['coordinator', 'volunteer'].map(r => (
                    <button 
                      key={r} 
                      onClick={() => setAssignRole(r)}
                      style={{
                        padding: '12px', borderRadius: '10px', fontSize: '13px', 
                        fontWeight: '600', cursor: 'pointer',
                        background: assignRole === r ? '#1a3a6b' : '#f0f4ff',
                        color: assignRole === r ? '#fff' : '#64748b',
                        border: `2px solid ${assignRole === r ? '#1a3a6b' : '#dbeafe'}`
                      }}
                    >
                      {r === 'coordinator' ? '🎯 Coordinator' : '🙋 Volunteer'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '10px', padding: '12px' }}>
                <p style={{ color: '#1a3a6b', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                  📋 Promotion Summary
                </p>
                <p style={{ color: '#64748b', fontSize: '12px' }}>
                  👤 {assignModal?.firstName || assignModal?.first_name || ''} {assignModal?.lastName || assignModal?.last_name || ''}
                </p>
                <p style={{ color: '#64748b', fontSize: '12px' }}>
                  🏫 {assignModal?.department || 'N/A'} - {assignModal?.campus || 'N/A'}
                </p>
                <p style={{ color: '#64748b', fontSize: '12px' }}>
                  🎯 New Role: <strong>{assignRole}</strong>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setAssignModal(null)}
                  style={{ 
                    flex: 1, background: '#f0f4ff', color: '#1a3a6b', 
                    border: '1px solid #dbeafe', borderRadius: '10px', 
                    padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' 
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePromote}
                  style={{ 
                    flex: 2, background: '#1a3a6b', color: '#fff', 
                    border: 'none', borderRadius: '10px', padding: '12px', 
                    fontSize: '14px', fontWeight: '700', cursor: 'pointer' 
                  }}
                >
                  ✅ Confirm Promotion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <div style={{ 
        background: '#1a3a6b', padding: '0 24px', display: 'flex', 
        alignItems: 'center', justifyContent: 'space-between', height: '56px', 
        position: 'fixed', top: 0, width: '100%', zIndex: 100, boxSizing: 'border-box' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            background: '#fff', borderRadius: '8px', width: '36px', height: '36px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontWeight: '800', color: '#1a3a6b', fontSize: '13px' 
          }}>
            CE
          </div>
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>CampusEvents</span>
          <span style={{ color: '#93c5fd', fontSize: '13px' }}>· VIT Pune</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#93c5fd', fontSize: '13px' }}>🔔</span>
          <button 
            onClick={logout} 
            style={{ 
              color: '#93c5fd', fontSize: '12px', background: 'none', 
              border: 'none', cursor: 'pointer', textDecoration: 'none' 
            }}
          >
            Logout
          </button>
          <div style={{ 
            background: '#2563eb', borderRadius: '50%', width: '34px', height: '34px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            color: '#fff', fontWeight: '700', fontSize: '13px' 
          }}>
            {deanInfo?.avatar || 'DN'}
          </div>
        </div>
      </div>

      {/* Dean Info Bar */}
      <div style={{ 
        background: '#fff', borderBottom: '1px solid #dbeafe', padding: '10px 24px', 
        marginTop: '56px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            background: '#1a3a6b', borderRadius: '50%', width: '44px', height: '44px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            color: '#fff', fontWeight: '700', fontSize: '16px' 
          }}>
            {deanInfo?.avatar || 'DN'}
          </div>
          <div>
            <p style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '15px' }}>
              {deanInfo?.name || 'Dean'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                background: '#fef2f2', color: '#dc2626', borderRadius: '20px', 
                fontSize: '11px', padding: '2px 10px', fontWeight: '600' 
              }}>
                👑 Dean
              </span>
              <span style={{ color: '#64748b', fontSize: '12px' }}>Full System Access</span>
            </div>
          </div>
        </div>
        <div style={{ color: '#64748b', fontSize: '13px' }}>
          VIT Pune · <strong style={{ color: '#1a3a6b' }}>Both Campuses</strong>
        </div>
        <div style={{ color: '#64748b', fontSize: '13px' }}>
          Email: <strong style={{ color: '#1a3a6b' }}>{deanInfo?.email || 'N/A'}</strong>
        </div>
      </div>

      {/* Breadcrumb */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '8px 24px' }}>
        <p style={{ color: '#64748b', fontSize: '13px' }}>
          🏠 Home / <span style={{ color: '#1a3a6b', fontWeight: '600' }}>Dean Dashboard</span>
        </p>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '24px' }}>
          {[
            { label: 'Total Students', value: students?.length || 0, icon: '🎓', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
            { label: 'Coordinators', value: students?.filter(u => u.assignedRole === 'coordinator').length || 0, icon: '🎯', color: '#7c3aed', bg: '#fdf4ff', border: '#e9d5ff' },
            { label: 'Volunteers', value: students?.filter(u => u.assignedRole === 'volunteer').length || 0, icon: '🙋', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
            { label: 'Total Events', value: events?.length || 0, icon: '📅', color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
            { label: 'Active Events', value: events?.filter(e => e.status === 'Active').length || 0, icon: '✅', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
          ].map(s => (
            <div 
              key={s.label} 
              style={{ 
                background: s.bg, border: `1px solid ${s.border}`, 
                borderRadius: '16px', textAlign: 'center', padding: '18px' 
              }}
            >
              <div style={{ fontSize: '22px', marginBottom: '4px' }}>{s.icon}</div>
              <div style={{ color: s.color, fontSize: '24px', fontWeight: '800' }}>{s.value}</div>
              <div style={{ color: '#64748b', fontSize: '11px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ 
          background: '#fff', border: '1px solid #dbeafe', borderRadius: '12px', 
          padding: '4px', display: 'inline-flex', gap: '4px', 
          marginBottom: '20px', flexWrap: 'wrap' 
        }}>
          {tabs.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px', borderRadius: '8px', fontSize: '13px', 
                fontWeight: '600', border: 'none', cursor: 'pointer',
                background: activeTab === tab.id ? '#1a3a6b' : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#64748b'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>📊 Platform Overview</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Total Students', value: students?.length || 0 },
                { label: 'Coordinators', value: students?.filter(u => u.assignedRole === 'coordinator').length || 0 },
                { label: 'Volunteers', value: students?.filter(u => u.assignedRole === 'volunteer').length || 0 },
                { label: 'Active Events', value: events?.filter(e => e.status === 'Active').length || 0 },
                { label: 'Total Events', value: events?.length || 0 },
              ].map((s, i) => (
                <div 
                  key={s.label} 
                  style={{ 
                    background: '#f8faff', border: '1px solid #dbeafe', 
                    borderRadius: '10px', padding: '12px 14px', 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                  }}
                >
                  <span style={{ color: '#64748b', fontSize: '13px' }}>{s.label}</span>
                  <span style={{ color: '#1a3a6b', fontSize: '18px', fontWeight: '800' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Approvals Tab */}
        {activeTab === 'events' && (
          <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>🎫 Event Approvals</h2>
            
            {/* Pending Events */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#1a3a6b', fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>⏳ Pending Approval ({events?.filter(e => e.status === 'pending').length || 0})</h3>
              {events?.filter(e => e.status === 'pending').length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: '#f8faff', borderRadius: '12px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                  <p style={{ fontSize: '14px', fontWeight: '600' }}>No pending events</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {events?.filter(e => e.status === 'pending').map(event => (
                    <div key={event.id} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ color: '#1a3a6b', fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>{event.title}</h4>
                          <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>
                            📅 {new Date(event.date).toLocaleDateString()} · 📍 {event.venue} · 🎯 {event.organising_club || event.organisingClub || 'N/A'}
                          </p>
                          <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#64748b' }}>
                            <span>⏰ {event.time_from || event.timeFrom || 'TBA'} - {event.time_to || event.timeTo || 'TBA'}</span>
                            <span>👥 {event.seats || 0} seats</span>
                            <span>💰 {event.fees || 'Free'}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <button 
                            onClick={() => handleApproveEvent(event.id)}
                            style={{ 
                              background: '#16a34a', color: '#fff', border: 'none', 
                              borderRadius: '8px', padding: '8px 16px', fontSize: '12px', 
                              cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' 
                            }}
                          >
                            ✅ Approve
                          </button>
                          <button 
                            onClick={() => handleRejectEvent(event.id)}
                            style={{ 
                              background: '#dc2626', color: '#fff', border: 'none', 
                              borderRadius: '8px', padding: '8px 16px', fontSize: '12px', 
                              cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' 
                            }}
                          >
                            ❌ Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Approved Events */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#1a3a6b', fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>✅ Approved Events ({events?.filter(e => e.status === 'approved' || e.status === 'Active').length || 0})</h3>
              {events?.filter(e => e.status === 'approved' || e.status === 'Active').length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', background: '#f8faff', borderRadius: '12px' }}>
                  <p style={{ fontSize: '12px' }}>No approved events yet</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                  {events?.filter(e => e.status === 'approved' || e.status === 'Active').slice(0, 6).map(event => (
                    <div key={event.id} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px' }}>
                      <h4 style={{ color: '#1a3a6b', fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>{event.title}</h4>
                      <p style={{ color: '#64748b', fontSize: '11px' }}>📅 {new Date(event.date).toLocaleDateString()} · 📍 {event.venue}</p>
                      <span style={{ background: '#dcfce7', color: '#16a34a', borderRadius: '6px', fontSize: '10px', padding: '2px 8px', fontWeight: '600', display: 'inline-block', marginTop: '8px' }}>
                        ✅ Approved
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rejected Events */}
            {events?.filter(e => e.status === 'rejected').length > 0 && (
              <div>
                <h3 style={{ color: '#1a3a6b', fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>❌ Rejected Events ({events?.filter(e => e.status === 'rejected').length || 0})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {events?.filter(e => e.status === 'rejected').map(event => (
                    <div key={event.id} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700' }}>{event.title}</h4>
                        <p style={{ color: '#64748b', fontSize: '11px' }}>📅 {new Date(event.date).toLocaleDateString()}</p>
                      </div>
                      <span style={{ background: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '10px', padding: '2px 8px', fontWeight: '600' }}>
                        ❌ Rejected
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700' }}>👥 All Students</h2>
              <select 
                value={campusFilter} 
                onChange={e => setCampusFilter(e.target.value)}
                style={{ 
                  background: '#f8faff', border: '1px solid #cbd5e1', color: '#1a3a6b', 
                  borderRadius: '8px', padding: '8px 12px', fontSize: '13px', cursor: 'pointer' 
                }}
              >
                <option>All</option>
                <option>Kondhwa</option>
                <option>Bibwewadi</option>
              </select>
            </div>
            
            {filteredUsers?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                <p style={{ fontSize: '14px', fontWeight: '600' }}>No students found</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8faff', borderBottom: '2px solid #dbeafe' }}>
                      {['#', 'Name', 'Email', 'Department', 'Campus', 'Assigned Role', 'Action'].map(h => (
                        <th 
                          key={h} 
                          style={{ 
                            color: '#1a3a6b', fontSize: '12px', fontWeight: '700', 
                            padding: '10px 12px', textAlign: 'left' 
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers?.map((s, i) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #dbeafe' }}>
                        <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '13px' }}>{i + 1}</td>
                        <td style={{ padding: '10px 12px', color: '#1a3a6b', fontSize: '13px', fontWeight: '600' }}>
                          {s.name || `${s.firstName || s.first_name || ''} ${s.lastName || s.last_name || ''}`.trim()}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '13px' }}>{s.email}</td>
                        <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '13px' }}>{s.department || 'N/A'}</td>
                        <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '13px' }}>{s.campus || 'N/A'}</td>
                        <td style={{ padding: '10px 12px', fontSize: '13px' }}>
                          {s.assignedRole ? (
                            <span style={{ 
                              background: '#dcfce7', color: '#16a34a', 
                              borderRadius: '6px', fontSize: '11px', 
                              padding: '3px 10px', fontWeight: '600' 
                            }}>
                              {s.assignedRole}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '11px' }}>None</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <button 
                            onClick={() => setAssignModal(s)}
                            style={{ 
                              background: '#1a3a6b', color: '#fff', border: 'none', 
                              borderRadius: '6px', padding: '6px 12px', 
                              fontSize: '11px', cursor: 'pointer', fontWeight: '600' 
                            }}
                          >
                            Promote
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Assign Tab */}
        {activeTab === 'assign' && (
          <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>🎯 Promote Students</h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
              Click "Promote" on any student to assign them as a Coordinator or Volunteer
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {students?.slice(0, 10).map(s => (
                <div 
                  key={s.id} 
                  style={{ 
                    background: '#f8faff', border: '1px solid #dbeafe', 
                    borderRadius: '12px', padding: '16px' 
                  }}
                >
                  <p style={{ color: '#1a3a6b', fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>
                    {s.name || `${s.firstName || s.first_name || ''} ${s.lastName || s.last_name || ''}`.trim()}
                  </p>
                  <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}>{s.email}</p>
                  <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '12px' }}>
                    {s.department || 'N/A'} • {s.campus || 'N/A'}
                  </p>
                  <button 
                    onClick={() => setAssignModal(s)}
                    style={{ 
                      background: '#1a3a6b', color: '#fff', border: 'none', 
                      borderRadius: '8px', padding: '8px 16px', width: '100%', 
                      fontSize: '12px', cursor: 'pointer', fontWeight: '600' 
                    }}
                  >
                    🎯 Promote
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>📈 Reports</h2>
            <p style={{ color: '#64748b', fontSize: '13px' }}>Reports functionality coming soon...</p>
          </div>
        )}

      </div>

      <footer style={{ 
        background: '#1a3a6b', color: '#93c5fd', textAlign: 'center', 
        padding: '20px', fontSize: '13px', marginTop: '40px' 
      }}>
        © 2025 CampusEvents · Vishwakarma Institute of Technology, Pune
      </footer>
    </div>
  )
}
