import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import userService from '../api/userService'
import eventService from '../api/eventService'

const duties = ['Registration Desk', 'Stage Management', 'Food & Logistics', 'Judging Coordination', 'Photography', 'Security', 'Guest Handling']

const EVENT_TYPE_OPTIONS = ['National', 'Intercollege', 'Intracollege', 'Department']
const EVENT_TYPE_STYLES = {
  National:     { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', icon: '🏆' },
  Intercollege: { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe', icon: '🎓' },
  Intracollege: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', icon: '🏫' },
  Department:   { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', icon: '📚' },
}

export default function CoordinatorDashboard() {
  const { user: authUser } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [user, setUser] = useState(null)
  const [events, setEvents] = useState([])
  const [volunteers, setVolunteers] = useState([])
  const [stats, setStats] = useState({ eventsCount: 0, registrationsCount: 0, volunteersCount: 0 })
  const [loading, setLoading] = useState(true)
  const [pendingUsers, setPendingUsers] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileData = await userService.getProfile()
        setUser(profileData)

        const eventsData = await eventService.getAllEvents()
        const coordinatorEvents = (eventsData || []).filter(event => {
          const eventClub = event.organising_club || event.organizing_club
          const userClub = profileData.organisingClub
          return eventClub === userClub
        })
        console.log(`📊 Coordinator: ${coordinatorEvents.length} events found for ${profileData.organisingClub || 'user ' + profileData.id}`)
        setEvents(coordinatorEvents)

        try {
          const statsData = await eventService.getCoordinatorStats()
          setStats(statsData)
        } catch (err) {
          console.error('Stats fetch failed:', err)
        }

        try {
          const volunteersData = await eventService.getCoordinatorVolunteers()
          setVolunteers(volunteersData || [])
        } catch (err) {
          console.error('Volunteers fetch failed:', err)
        }

        try {
          const pending = await userService.getPendingApprovals()
          setPendingUsers(pending || [])
        } catch (err) {
          console.error('Pending approvals fetch failed:', err)
        }

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // ── FIXED: approve calls approveUser, reject calls rejectUser ──
  const handleApproval = async (userId, approve) => {
    try {
      if (approve) {
        await userService.approveUser(userId)
        alert('✅ User approved successfully!')
      } else {
        if (!window.confirm('Are you sure you want to reject and remove this user?')) return
        await userService.rejectUser(userId)
        alert('❌ User rejected and removed.')
      }
      setPendingUsers(prev => prev.filter(u => u.id !== userId))
    } catch (err) {
      alert('Failed to process approval. Please try again.')
    }
  }

  const appointVolunteer = async (studentId, eventId) => {
    try {
      const response = await userService.updateUserRole(studentId, 'volunteer', eventId)
      alert(`✅ ${response.message}`)
      const volunteersData = await eventService.getCoordinatorVolunteers()
      setVolunteers(volunteersData || [])
      const statsData = await eventService.getCoordinatorStats()
      setStats(statsData)
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to appoint volunteer'
      alert(`❌ ${errorMsg}`)
    }
  }

  const removeVolunteer = async (userId) => {
    if (!window.confirm('Remove this volunteer? They will return to student role.')) return
    try {
      const response = await userService.updateUserRole(userId, 'student')
      alert(`✅ ${response.message}`)
      const volunteersData = await eventService.getCoordinatorVolunteers()
      setVolunteers(volunteersData || [])
      const statsData = await eventService.getCoordinatorStats()
      setStats(statsData)
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to remove volunteer'
      alert(`❌ ${errorMsg}`)
    }
  }

  useEffect(() => {
    if (authUser && authUser.role !== 'coordinator' && authUser.role !== 'club_head') {
      const roleRedirectMap = {
        student: '/dashboard',
        faculty: '/faculty-dashboard',
        dean: '/dean-dashboard',
        admin: '/admin'
      }
      const redirectPath = roleRedirectMap[authUser.role] || '/dashboard'
      navigate(redirectPath, { replace: true })
    }
  }, [authUser, navigate])

  const inputStyle = {
    background: '#f8faff', border: '1px solid #cbd5e1', color: '#1a3a6b',
    borderRadius: '10px', width: '100%', padding: '11px 14px',
    fontSize: '13px', outline: 'none', boxSizing: 'border-box'
  }
  const labelStyle = { color: '#1a3a6b', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'C'
  }

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'events', label: '📅 My Events' },
    { id: 'volunteers', label: '👥 Volunteers' },
    { id: 'approvals', label: `🔔 Approvals${pendingUsers.length > 0 ? ` (${pendingUsers.length})` : ''}` },
  ]

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />

      {loading ? (
        <div style={{ paddingTop: '100px', textAlign: 'center', color: '#1a3a6b' }}>
          <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #dbeafe', borderTop: '4px solid #1a3a6b', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '16px', fontSize: '14px' }}>Loading profile...</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #1a3a6b, #2563eb)', paddingTop: '56px' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: '#fff', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a3a6b', fontWeight: '800', fontSize: '18px' }}>
                    {getInitials(user?.firstName, user?.lastName)}
                  </div>
                  <div>
                    <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '700' }}>Coordinator Dashboard 🎯</h1>
                    <p style={{ color: '#bfdbfe', fontSize: '13px' }}>
                      {user?.firstName} {user?.lastName} · {user?.branch || 'N/A'} Dept · VIT Pune
                      {user?.promotedByName && ` · Assigned by ${user.promotedByName}`}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {pendingUsers.length > 0 && (
                    <button onClick={() => setActiveTab('approvals')}
                      style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 16px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                      🔔 {pendingUsers.length} Pending
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Events Created', value: String(stats.eventsCount || events.length), icon: '📅', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
                { label: 'Total Registrations', value: String(stats.registrationsCount || 0), icon: '👥', color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
                { label: 'Volunteers Managed', value: String(stats.volunteersCount || volunteers.length), icon: '🙋', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
                { label: 'Pending Approvals', value: String(pendingUsers.length), icon: '🔔', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
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
                    color: activeTab === tab.id ? '#fff' : tab.id === 'approvals' && pendingUsers.length > 0 ? '#dc2626' : '#64748b'
                  }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
                  <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>📅 Recent Events</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {events.length === 0 ? (
                      <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No events yet</p>
                    ) : (
                      events.slice(0, 5).map(e => {
                        const registered = e.registered || 0
                        const seats = e.seats || 100
                        const pct = Math.round((registered / seats) * 100)
                        const typeStyle = EVENT_TYPE_STYLES[e.event_type] || EVENT_TYPE_STYLES['Intracollege']
                        return (
                          <div key={e.id} style={{ background: '#f8faff', borderRadius: '12px', border: '1px solid #dbeafe', padding: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <div>
                                <p style={{ color: '#1a3a6b', fontSize: '14px', fontWeight: '700' }}>{e.title}</p>
                                <p style={{ color: '#64748b', fontSize: '12px' }}>{e.date ? new Date(e.date).toLocaleDateString() : 'TBD'}</p>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                <span style={{ background: e.status === 'approved' || e.status === 'Active' ? '#dcfce7' : '#eff6ff', color: e.status === 'approved' || e.status === 'Active' ? '#16a34a' : '#1d4ed8', borderRadius: '6px', fontSize: '11px', padding: '3px 8px', fontWeight: '600' }}>{e.status}</span>
                                {e.event_type && (
                                  <span style={{ background: typeStyle.bg, color: typeStyle.color, border: `1px solid ${typeStyle.border}`, borderRadius: '6px', fontSize: '10px', padding: '2px 7px', fontWeight: '600' }}>
                                    {typeStyle.icon} {e.event_type}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ color: '#64748b', fontSize: '11px' }}>{registered}/{seats} registered</span>
                              <span style={{ color: pct > 80 ? '#dc2626' : '#16a34a', fontSize: '11px', fontWeight: '600' }}>{pct}%</span>
                            </div>
                            <div style={{ background: '#dbeafe', borderRadius: '4px', height: '6px' }}>
                              <div style={{ width: `${pct}%`, background: pct > 80 ? '#dc2626' : '#1a3a6b', borderRadius: '4px', height: '6px' }} />
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
                  <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>👥 Volunteer Summary</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {volunteers.length === 0 ? (
                      <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No volunteers yet</p>
                    ) : (
                      volunteers.slice(0, 4).map(v => {
                        const name = `${v.first_name} ${v.last_name}`
                        const initials = `${v.first_name?.[0] || ''}${v.last_name?.[0] || ''}`.toUpperCase()
                        return (
                          <div key={v.id} style={{ background: '#f8faff', borderRadius: '12px', border: '1px solid #dbeafe', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ background: '#dbeafe', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a3a6b', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                                {initials}
                              </div>
                              <div>
                                <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700' }}>{name}</p>
                                <p style={{ color: '#64748b', fontSize: '11px' }}>{v.event_title || 'N/A'}</p>
                              </div>
                            </div>
                            <span style={{ background: '#dcfce7', color: '#16a34a', borderRadius: '6px', fontSize: '11px', padding: '3px 8px', fontWeight: '600' }}>Active</span>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* My Events Tab */}
            {activeTab === 'events' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {events.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }}>No events yet. Create your first event!</p>
                ) : (
                  events.map(e => {
                    const registered = e.registered || 0
                    const seats = e.seats || 100
                    const pct = Math.round((registered / seats) * 100)
                    const typeStyle = EVENT_TYPE_STYLES[e.event_type] || EVENT_TYPE_STYLES['Intracollege']
                    return (
                      <div key={e.id} style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: '6px', fontSize: '12px', padding: '3px 10px', fontWeight: '600' }}>{e.category || 'General'}</span>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {e.event_type && (
                              <span style={{ background: typeStyle.bg, color: typeStyle.color, border: `1px solid ${typeStyle.border}`, borderRadius: '6px', fontSize: '11px', padding: '3px 8px', fontWeight: '600' }}>
                                {typeStyle.icon} {e.event_type}
                              </span>
                            )}
                            <span style={{ background: e.status === 'approved' || e.status === 'Active' ? '#dcfce7' : '#f1f5f9', color: e.status === 'approved' || e.status === 'Active' ? '#16a34a' : '#64748b', borderRadius: '6px', fontSize: '11px', padding: '3px 8px', fontWeight: '600' }}>{e.status}</span>
                          </div>
                        </div>
                        <h3 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '4px' }}>{e.title}</h3>
                        <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '12px' }}>📅 {e.date ? new Date(e.date).toLocaleDateString() : 'TBD'} · 📍 {e.venue || 'TBD'}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: '#64748b', fontSize: '11px' }}>{registered}/{seats} registered</span>
                          <span style={{ color: pct > 80 ? '#dc2626' : '#16a34a', fontSize: '11px', fontWeight: '600' }}>{pct}% full</span>
                        </div>
                        <div style={{ background: '#dbeafe', borderRadius: '4px', height: '6px', marginBottom: '16px' }}>
                          <div style={{ width: `${pct}%`, background: pct > 80 ? '#dc2626' : '#1a3a6b', borderRadius: '4px', height: '6px' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {['✏️ Edit', '📊 Analytics', '📜 Certs'].map(btn => (
                            <button key={btn} style={{ flex: 1, background: '#f0f4ff', color: '#1a3a6b', border: '1px solid #dbeafe', borderRadius: '8px', padding: '7px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>{btn}</button>
                          ))}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* Volunteers Tab */}
            {activeTab === 'volunteers' && (
              <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ color: '#1a3a6b', fontWeight: '700' }}>👥 Volunteer & Duty Management</h2>
                  <button
                    onClick={() => alert('Feature coming soon: Select a student and event to appoint as volunteer')}
                    style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                    + Add Volunteer
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                  <span style={{ color: '#64748b', fontSize: '12px', alignSelf: 'center' }}>Duties:</span>
                  {duties.map(d => (
                    <span key={d} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '20px', fontSize: '11px', padding: '3px 10px', fontWeight: '500' }}>{d}</span>
                  ))}
                </div>

                {volunteers.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '40px' }}>No volunteers assigned yet</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #dbeafe', background: '#f8faff' }}>
                          {['Volunteer', 'Branch', 'Year', 'Event', 'Email', 'Action'].map(h => (
                            <th key={h} style={{ color: '#1a3a6b', fontSize: '12px', fontWeight: '700', padding: '12px', textAlign: 'left' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {volunteers.map(v => {
                          const name = `${v.first_name} ${v.last_name}`
                          const initials = `${v.first_name?.[0] || ''}${v.last_name?.[0] || ''}`.toUpperCase()
                          return (
                            <tr key={v.id} style={{ borderBottom: '1px solid #dbeafe' }}>
                              <td style={{ padding: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ background: '#dbeafe', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a3a6b', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
                                    {initials}
                                  </div>
                                  <span style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '600' }}>{name}</span>
                                </div>
                              </td>
                              <td style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>{v.department || 'N/A'}</td>
                              <td style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>{v.year || 'N/A'}</td>
                              <td style={{ padding: '12px', color: '#64748b', fontSize: '12px' }}>{v.event_title || 'Unassigned'}</td>
                              <td style={{ padding: '12px', color: '#64748b', fontSize: '11px' }}>{v.email}</td>
                              <td style={{ padding: '12px' }}>
                                <button
                                  onClick={() => removeVolunteer(v.id)}
                                  style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                                  Remove
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Approvals Tab */}
            {activeTab === 'approvals' && (
              <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
                <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '6px' }}>🔔 Non-VITian Student Approvals</h2>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
                  Review and approve students from other colleges who want to participate in events.
                </p>

                {pendingUsers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                    <p style={{ color: '#16a34a', fontWeight: '700', fontSize: '16px' }}>All caught up!</p>
                    <p style={{ color: '#64748b', fontSize: '13px' }}>No pending approvals at the moment.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {pendingUsers.map(u => (
                      <div key={u.id} style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ background: '#fef3c7', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#92400e', fontWeight: '800', fontSize: '15px', flexShrink: 0 }}>
                            {`${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase()}
                          </div>
                          <div>
                            <p style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '14px' }}>{u.first_name} {u.last_name}</p>
                            <p style={{ color: '#64748b', fontSize: '12px' }}>📧 {u.email}</p>
                            <p style={{ color: '#64748b', fontSize: '12px' }}>🏫 {u.college_name}</p>
                            {u.phone && <p style={{ color: '#64748b', fontSize: '12px' }}>📞 {u.phone}</p>}
                            <p style={{ color: '#94a3b8', fontSize: '11px' }}>
                              Registered: {new Date(u.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleApproval(u.id, true)}
                            style={{ background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '8px 20px', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}>
                            ✅ Approve
                          </button>
                          <button
                            onClick={() => handleApproval(u.id, false)}
                            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px 20px', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}>
                            ❌ Reject
                          </button>
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
        </>
      )}
    </div>
  )
}