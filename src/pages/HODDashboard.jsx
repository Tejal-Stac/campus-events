import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import * as HodService from '../api/hodService'

const API = 'http://localhost:5000'

// ── Recharts (loaded via CDN in index.html, or import if installed)
// import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
//          XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const DEPT_COLORS = {
  'Computer Engineering': '#1a3a6b',
  'Information Technology': '#2563eb',
  'Mechanical Engineering': '#d97706',
  'Electronics & Telecommunication': '#7c3aed',
  'Civil Engineering': '#059669',
  'Electrical Engineering': '#dc2626',
  'Chemical Engineering': '#0891b2',
  'Production Engineering': '#db2777',
}
const getColor = (dept) => DEPT_COLORS[dept] || '#64748b'

const DEPARTMENTS = [
  'Computer Engineering',
  'Information Technology',
  'Mechanical Engineering',
  'Electronics & Telecommunication',
  'Civil Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Production Engineering',
]

export default function HodDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('overview')
  const [students, setStudents] = useState([])
  const [events, setEvents] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deptFilter, setDeptFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [eventStats, setEventStats] = useState(null)
  const [eventStudents, setEventStudents] = useState([])
  const [loadingModal, setLoadingModal] = useState(false)
  const [faculties, setFaculties] = useState([])

  // Role guard
  useEffect(() => {
    if (user && !['hod', 'faculty'].includes(user.role)) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => { fetchAll() }, [])

  useEffect(() => {
    if (activeTab === 'faculty') {
      fetchFaculties()
    }
  }, [activeTab])

  const getToken = () => localStorage.getItem('token')
  const headers = () => ({ Authorization: `Bearer ${getToken()}` })

  const fetchAll = async () => {
    setLoading(true)
    try {
      await Promise.all([fetchStudents(), fetchEvents(), fetchAnalytics()])
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const res = await HodService.fetchHodStudents()
      setStudents(res.data || [])
    } catch (e) { console.error('Students fetch error:', e.message) }
  }

  const fetchFaculties = async () => {
    try {
      const API = 'http://localhost:5000/api'
      const token = getToken()
      const res = await axios.get(`${API}/users/departmental/faculty`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setFaculties(res.data.data || [])
    } catch (e) { console.error('Faculties fetch error:', e.message) }
  }

  const fetchEvents = async (dept = 'All') => {
    try {
      const res = await HodService.fetchHodEvents(dept)
      setEvents(res.data || [])
    } catch (e) { console.error('Events fetch error:', e.message) }
  }

  const fetchAnalytics = async () => {
    try {
      const res = await HodService.fetchHodAnalytics()
      setAnalytics(res)
    } catch (e) { console.error('Analytics fetch error:', e.message) }
  }

  const fetchEventStats = async (eventId) => {
    setLoadingModal(true)
    try {
      const [statsRes, studentsRes] = await Promise.all([
        HodService.fetchEventStats(eventId),
        HodService.fetchEventStudentList(eventId)
      ])
      setEventStats(statsRes)
      setEventStudents(studentsRes.students || [])
    } catch (e) {
      console.error('Event stats error:', e.message)
      setEventStats(null)
      setEventStudents([])
    } finally {
      setLoadingModal(false)
    }
  }

  const hodDept = user?.department || ''
  const hodName = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
  const getInitials = (name) => name ? name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) : 'HD'

  const filteredStudents = students.filter(s => {
    const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.gr_number?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const tabs = [
    { id: 'overview',  label: '📊 Overview' },
    { id: 'students',  label: '👥 My Students' },
    { id: 'faculty',   label: '👨‍🏫 My Faculty' },
    { id: 'events',    label: '🎫 Events' },
    { id: 'analytics', label: '📈 Analytics' },
  ]

  // ── Styles ────────────────────────────────────────────────
  const card = (extra = {}) => ({
    background: '#fff', border: '1px solid #dbeafe',
    borderRadius: '16px', padding: '24px', ...extra
  })

  const badge = (color, bg) => ({
    background: bg, color, borderRadius: '20px',
    fontSize: '11px', padding: '3px 10px', fontWeight: '600', display: 'inline-block'
  })

  const statCard = (bg, border, color) => ({
    background: bg, border: `1px solid ${border}`,
    borderRadius: '16px', padding: '20px', textAlign: 'center'
  })

  if (loading) return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p style={{ color: '#1a3a6b', fontSize: '16px', fontWeight: '600' }}>Loading HOD Dashboard...</p>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Event Stats Modal ── */}
      {selectedEvent && eventStats && (
        <div onClick={() => { setSelectedEvent(null); setEventStats(null); setEventStudents([]) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(26,58,107,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '20px', padding: '32px', maxWidth: '900px', width: '100%', boxShadow: '0 24px 64px rgba(26,58,107,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h2 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '18px', marginBottom: '4px' }}>
                  📊 {eventStats.eventName}
                </h2>
                <p style={{ color: '#64748b', fontSize: '13px' }}>{eventStats.venue} · {new Date(eventStats.date).toLocaleDateString()}</p>
              </div>
              <button onClick={() => { setSelectedEvent(null); setEventStats(null); setEventStudents([]) }}
                style={{ background: '#f0f4ff', border: '1px solid #dbeafe', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: '#64748b', fontSize: '13px' }}>
                ✕ Close
              </button>
            </div>

            {/* Total Registrations Card */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', marginBottom: '24px', textAlign: 'center' }}>
              <div style={{ color: '#059669', fontSize: '36px', fontWeight: '800' }}>{eventStats.totalRegistered}</div>
              <div style={{ color: '#64748b', fontSize: '13px' }}>Total Registrations</div>
            </div>

            {/* Department Comparison Section */}
            {eventStats.comparison && (
              <div style={{ background: '#fdf4ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                <h3 style={{ color: '#1a3a6b', fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>🏆 Your Department vs Others</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {/* My Department */}
                  <div style={{ background: '#fff', border: '2px solid #7c3aed', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ color: '#7c3aed', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>★ {eventStats.comparison.myDepartment.name}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ color: '#1a3a6b', fontSize: '28px', fontWeight: '800' }}>{eventStats.comparison.myDepartment.count}</span>
                      <span style={{ color: '#64748b', fontSize: '12px' }}>({eventStats.comparison.myDepartment.percentage}%)</span>
                    </div>
                    <div style={{ background: '#fdf4ff', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(eventStats.comparison.myDepartment.percentage, 100)}%`, height: '100%', background: '#7c3aed' }}/>
                    </div>
                  </div>

                  {/* Other Departments */}
                  <div style={{ background: '#fff', border: '2px solid #cbd5e1', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>Other Departments</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ color: '#1a3a6b', fontSize: '28px', fontWeight: '800' }}>{eventStats.comparison.otherDepartments.count}</span>
                      <span style={{ color: '#64748b', fontSize: '12px' }}>({eventStats.comparison.otherDepartments.percentage}%)</span>
                    </div>
                    <div style={{ background: '#e2e8f0', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(eventStats.comparison.otherDepartments.percentage, 100)}%`, height: '100%', background: '#64748b' }}/>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* All Department Stats */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#1a3a6b', fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>📊 Department Breakdown</h3>
              {eventStats.departmentStats?.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '13px' }}>No registrations yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {eventStats.departmentStats?.map(d => (
                    <div key={d.department}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', color: '#1a3a6b', fontWeight: d.isMine ? '700' : '400' }}>
                          {d.isMine ? '★ ' : ''}{d.department}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: d.isMine ? '#7c3aed' : '#64748b' }}>
                          {d.count} ({d.percentage}%)
                        </span>
                      </div>
                      <div style={{ background: '#f0f4ff', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(d.percentage, 100)}%`, height: '100%',
                          background: d.isMine ? '#7c3aed' : getColor(d.department),
                          borderRadius: '6px', transition: 'width 0.5s ease'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Students from HOD's Department */}
            {eventStudents && eventStudents.length > 0 && (
              <div>
                <h3 style={{ color: '#1a3a6b', fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>
                  👥 {hodDept} Students ({eventStudents.length})
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f8faff', borderBottom: '1px solid #dbeafe' }}>
                        <th style={{ color: '#1a3a6b', fontWeight: '700', padding: '8px 10px', textAlign: 'left' }}>Name</th>
                        <th style={{ color: '#1a3a6b', fontWeight: '700', padding: '8px 10px', textAlign: 'left' }}>PRN</th>
                        <th style={{ color: '#1a3a6b', fontWeight: '700', padding: '8px 10px', textAlign: 'left' }}>Email</th>
                        <th style={{ color: '#1a3a6b', fontWeight: '700', padding: '8px 10px', textAlign: 'left' }}>Year</th>
                        <th style={{ color: '#1a3a6b', fontWeight: '700', padding: '8px 10px', textAlign: 'left' }}>Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventStudents.map((student, i) => (
                        <tr key={student.id} style={{ borderBottom: '1px solid #dbeafe' }}>
                          <td style={{ padding: '8px 10px', color: '#1a3a6b', fontWeight: '600' }}>{student.name}</td>
                          <td style={{ padding: '8px 10px', color: '#64748b' }}>{student.prn || '—'}</td>
                          <td style={{ padding: '8px 10px', color: '#64748b', fontSize: '12px' }}>{student.email}</td>
                          <td style={{ padding: '8px 10px', color: '#64748b' }}>{student.year || '—'}</td>
                          <td style={{ padding: '8px 10px', color: '#64748b', fontSize: '12px' }}>
                            {new Date(student.registeredAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {eventStudents && eventStudents.length === 0 && (
              <div style={{ background: '#ffe4f3', border: '1px solid #fbcfe8', borderRadius: '8px', padding: '16px', textAlign: 'center', color: '#be185d' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>👥</div>
                <p style={{ fontSize: '13px', fontWeight: '600' }}>No students from {hodDept} registered for this event</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Top Navbar ── */}
      <div style={{ background: '#1a3a6b', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px', position: 'fixed', top: 0, width: '100%', zIndex: 100, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#fff', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#1a3a6b', fontSize: '13px' }}>CE</div>
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>CampusEvents</span>
          <span style={{ color: '#93c5fd', fontSize: '13px' }}>· VIT Pune</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={logout} style={{ color: '#93c5fd', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button>
          <div style={{ background: '#7c3aed', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '13px' }}>
            {getInitials(hodName)}
          </div>
        </div>
      </div>

      {/* ── HOD Info Bar ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #dbeafe', padding: '10px 24px', marginTop: '56px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#7c3aed', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '16px' }}>
            {getInitials(hodName)}
          </div>
          <div>
            <p style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '15px' }}>{hodName || 'HOD'}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#fdf4ff', color: '#7c3aed', borderRadius: '20px', fontSize: '11px', padding: '2px 10px', fontWeight: '600' }}>🏛️ Head of Department</span>
              <span style={{ color: '#64748b', fontSize: '12px' }}>{hodDept}</span>
            </div>
          </div>
        </div>
        <div style={{ color: '#64748b', fontSize: '13px' }}>
          Department: <strong style={{ color: '#1a3a6b' }}>{hodDept}</strong>
        </div>
        <div style={{ color: '#64748b', fontSize: '13px' }}>
          Email: <strong style={{ color: '#1a3a6b' }}>{user?.email}</strong>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '8px 24px' }}>
        <p style={{ color: '#64748b', fontSize: '13px' }}>🏠 Home / <span style={{ color: '#1a3a6b', fontWeight: '600' }}>HOD Dashboard</span></p>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>

        {/* ── Summary Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '24px' }}>
          {[
            { label: 'Total Students',    value: analytics?.summary?.totalStudents || students.length, icon: '🎓', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
            { label: 'Participated',      value: analytics?.summary?.participated || 0,                icon: '✅', color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
            { label: 'Inactive',          value: analytics?.summary?.inactive || 0,                    icon: '💤', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
            { label: 'Participation %',   value: `${analytics?.summary?.participationRate || 0}%`,     icon: '📈', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
            { label: 'Active Events',     value: events.length,                                        icon: '🎫', color: '#7c3aed', bg: '#fdf4ff', border: '#e9d5ff' },
          ].map(s => (
            <div key={s.label} style={statCard(s.bg, s.border, s.color)}>
              <div style={{ fontSize: '22px', marginBottom: '4px' }}>{s.icon}</div>
              <div style={{ color: s.color, fontSize: '24px', fontWeight: '800' }}>{s.value}</div>
              <div style={{ color: '#64748b', fontSize: '11px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '4px', display: 'inline-flex', gap: '4px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', border: 'none', cursor: 'pointer', background: activeTab === tab.id ? '#1a3a6b' : 'transparent', color: activeTab === tab.id ? '#fff' : '#64748b' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════
            TAB: OVERVIEW
        ════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

            {/* Participation Rate Card */}
            <div style={card()}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '20px', fontSize: '15px' }}>
                📈 Department Participation Rate
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                {/* Donut-style circle */}
                <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#f0f4ff" strokeWidth="14"/>
                    {/* Cap visual at 100% but use true value for display */}
                    <circle cx="60" cy="60" r="50" fill="none"
                      stroke="#1a3a6b" strokeWidth="14"
                      strokeDasharray={`${Math.min(analytics?.summary?.participationRate || 0, 100) * 3.14} 314`}
                      strokeDashoffset="78.5" strokeLinecap="round" transform="rotate(-90 60 60)"/>
                    <text x="60" y="56" textAnchor="middle" fill="#1a3a6b" fontSize="20" fontWeight="700">
                      {analytics?.summary?.participationRate || 0}%
                    </text>
                    <text x="60" y="72" textAnchor="middle" fill="#64748b" fontSize="9">participation</text>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  {[
                    { label: 'Total Students', value: analytics?.summary?.totalStudents || 0, color: '#1a3a6b' },
                    { label: 'Participated',   value: analytics?.summary?.participated || 0,  color: '#059669' },
                    { label: 'Inactive',       value: analytics?.summary?.inactive || 0,      color: '#dc2626' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f4ff' }}>
                      <span style={{ color: '#64748b', fontSize: '13px' }}>{item.label}</span>
                      <span style={{ color: item.color, fontWeight: '700', fontSize: '14px' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Participation Bar - Cap visual at 100% but show true value */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Active</span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {analytics?.summary?.participationRate && analytics?.summary?.participationRate > 100 
                      ? `${analytics?.summary?.participationRate}% (capped at 100% visually)` 
                      : 'Inactive'
                    }
                  </span>
                </div>
                <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', height: '14px' }}>
                  <div style={{ width: `${Math.min(analytics?.summary?.participationRate || 0, 100)}%`, background: '#1a3a6b', transition: 'width 0.5s' }}/>
                  <div style={{ flex: 1, background: '#e2e8f0' }}/>
                </div>
              </div>
            </div>

            {/* Monthly Trend */}
            <div style={card()}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px', fontSize: '15px' }}>
                📅 Monthly Participation Trend
              </h2>
              {analytics?.monthlyTrend?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
                  <p style={{ fontSize: '13px' }}>No participation data yet</p>
                </div>
              ) : (
                <div>
                  {analytics?.monthlyTrend?.map((m, i) => {
                    const max = Math.max(...(analytics?.monthlyTrend?.map(x => parseInt(x.count)) || [1]))
                    const pct = max > 0 ? (parseInt(m.count) / max) * 100 : 0
                    return (
                      <div key={m.month_key} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ width: '72px', fontSize: '11px', color: '#64748b', textAlign: 'right' }}>{m.month}</span>
                        <div style={{ flex: 1, background: '#f0f4ff', borderRadius: '4px', height: '20px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, background: '#1a3a6b', height: '100%', borderRadius: '4px', transition: 'width 0.5s', display: 'flex', alignItems: 'center', paddingLeft: '6px' }}>
                            {pct > 20 && <span style={{ color: '#fff', fontSize: '10px', fontWeight: '600' }}>{m.count}</span>}
                          </div>
                        </div>
                        {pct <= 20 && <span style={{ fontSize: '11px', color: '#64748b' }}>{m.count}</span>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Event-wise bar */}
            <div style={{ ...card(), gridColumn: '1 / -1' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px', fontSize: '15px' }}>
                🎯 Event-wise Participation ({hodDept})
              </h2>
              {analytics?.eventWise?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
                  <p style={{ fontSize: '13px' }}>No event participation data yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {analytics?.eventWise?.map((e, i) => {
                    const max = Math.max(...(analytics?.eventWise?.map(x => x.count) || [1]))
                    const pct = max > 0 ? (e.count / max) * 100 : 0
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '180px', fontSize: '12px', color: '#1a3a6b', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</span>
                        <div style={{ flex: 1, background: '#f0f4ff', borderRadius: '4px', height: '24px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, background: '#1a3a6b', height: '100%', borderRadius: '4px', display: 'flex', alignItems: 'center', paddingLeft: '8px', minWidth: '30px' }}>
                            {pct > 10 && <span style={{ color: '#fff', fontSize: '11px', fontWeight: '600' }}>{e.count}</span>}
                          </div>
                        </div>
                        {pct <= 10 && <span style={{ fontSize: '11px', color: '#64748b' }}>{e.count}</span>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            TAB: STUDENTS
        ════════════════════════════════════════ */}
        {activeTab === 'students' && (
          <div style={card()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '16px' }}>👥 {hodDept} Students</h2>
                <p style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>Showing only your department's students</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ background: '#eff6ff', color: '#1a3a6b', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: '600' }}>
                  {filteredStudents.length} students
                </span>
                <input
                  type="text"
                  placeholder="🔍 Search by name, email, GR..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ background: '#f8faff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', width: '260px', outline: 'none' }}
                />
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                <p style={{ fontSize: '14px', fontWeight: '600' }}>No students found in {hodDept}</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>Students will appear here once they register with this department</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8faff', borderBottom: '2px solid #dbeafe' }}>
                      {['#', 'Name', 'Email', 'GR No.', 'Year', 'Division', 'Campus', 'Role'].map(h => (
                        <th key={h} style={{ color: '#1a3a6b', fontSize: '12px', fontWeight: '700', padding: '10px 12px', textAlign: 'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s, i) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #dbeafe', ':hover': { background: '#f8faff' } }}>
                        <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '13px' }}>{i + 1}</td>
                        <td style={{ padding: '10px 12px', color: '#1a3a6b', fontSize: '13px', fontWeight: '600' }}>
                          {`${s.first_name || ''} ${s.last_name || ''}`.trim()}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '13px' }}>{s.email}</td>
                        <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '13px' }}>{s.gr_number || '—'}</td>
                        <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '13px' }}>{s.year || '—'}</td>
                        <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '13px' }}>{s.division || '—'}</td>
                        <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '13px' }}>{s.campus || '—'}</td>
                        <td style={{ padding: '10px 12px' }}>
                          {s.assigned_role ? (
                            <span style={badge('#16a34a', '#dcfce7')}>{s.assigned_role}</span>
                          ) : (
                            <span style={badge('#64748b', '#f1f5f9')}>student</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════
            TAB: FACULTY
        ════════════════════════════════════════ */}
        {activeTab === 'faculty' && (
          <div style={card()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '16px' }}>👨‍🏫 {hodDept} Faculty</h2>
                <p style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>Faculty members in your department</p>
              </div>
              <span style={{ background: '#eff6ff', color: '#1a3a6b', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: '600' }}>
                {faculties.length} faculty
              </span>
            </div>

            {faculties.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍🏫</div>
                <p style={{ fontSize: '14px', fontWeight: '600' }}>No faculty found in {hodDept}</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>Faculty members will appear here</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8faff', borderBottom: '2px solid #dbeafe' }}>
                      {['#', 'Name', 'Email', 'Designation', 'Coordinator Role', 'Joined'].map(h => (
                        <th key={h} style={{ color: '#1a3a6b', fontSize: '12px', fontWeight: '700', padding: '10px 12px', textAlign: 'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {faculties.map((f, i) => (
                      <tr key={f.id} style={{ borderBottom: '1px solid #dbeafe' }}>
                        <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '13px' }}>{i + 1}</td>
                        <td style={{ padding: '10px 12px', color: '#1a3a6b', fontSize: '13px', fontWeight: '600' }}>
                          {f.name}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '13px' }}>{f.email}</td>
                        <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '13px' }}>{f.designation || '—'}</td>
                        <td style={{ padding: '10px 12px' }}>
                          {f.coordinatorType && f.coordinatorType !== 'none' ? (
                            <span style={badge('#7c3aed', '#fdf4ff')}>{f.coordinatorType}</span>
                          ) : (
                            <span style={badge('#64748b', '#f1f5f9')}>No Role</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '13px' }}>
                          {new Date(f.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Coordinator Legend */}
            {faculties.length > 0 && (
              <div style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '8px', padding: '12px 16px', marginTop: '16px' }}>
                <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>🎯 Coordinator Categories</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                  {['Technical', 'Sports', 'Cultural', 'Other'].map(cat => {
                    const coordinator = faculties.find(f => f.coordinatorType === cat);
                    return (
                      <div key={cat} style={{ fontSize: '12px' }}>
                        <p style={{ color: '#1a3a6b', fontWeight: '600' }}>{cat}</p>
                        <p style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                          {coordinator ? `📌 ${coordinator.name}` : "Unassigned"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════
            TAB: EVENTS
        ════════════════════════════════════════ */}
        {activeTab === 'events' && (
          <div>
            {/* Filter Bar */}
            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700' }}>Filter by Department:</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['All', ...DEPARTMENTS.slice(0, 6)].map(d => (
                  <button key={d} onClick={() => { setDeptFilter(d); fetchEvents(d) }}
                    style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: '1px solid', borderColor: deptFilter === d ? '#1a3a6b' : '#dbeafe', background: deptFilter === d ? '#1a3a6b' : '#f8faff', color: deptFilter === d ? '#fff' : '#64748b', transition: 'all 0.2s' }}>
                    {d === 'Computer Engineering' ? 'CSE' : d === 'Information Technology' ? 'IT' : d === 'Mechanical Engineering' ? 'MECH' : d === 'Electronics & Telecommunication' ? 'ENTC' : d}
                  </button>
                ))}
              </div>
              <span style={{ marginLeft: 'auto', color: '#64748b', fontSize: '12px' }}>{events.length} events found</span>
            </div>

            {events.length === 0 ? (
              <div style={{ ...card(), textAlign: 'center', padding: '60px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎫</div>
                <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>No events found for this filter</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                {events.map(event => (
                  <div key={event.id} style={card({ padding: '20px' })}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: '#1a3a6b', fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>{event.title}</h3>
                        <p style={{ color: '#64748b', fontSize: '12px' }}>📍 {event.venue} · {new Date(event.date).toLocaleDateString()}</p>
                        <p style={{ color: '#64748b', fontSize: '12px' }}>🏷️ {event.organising_club || 'N/A'}</p>
                      </div>
                      <span style={badge('#059669', '#f0fdf4')}>{event.status}</span>
                    </div>

                    {/* Total registrations */}
                    <div style={{ background: '#f0f4ff', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b', fontSize: '13px' }}>Total Registrations</span>
                      <span style={{ color: '#1a3a6b', fontWeight: '800', fontSize: '16px' }}>{event.total_registered}</span>
                    </div>

                    {/* My dept highlight */}
                    {event.myDepartmentStat && event.total_registered > 0 && (
                      <div style={{ background: '#fdf4ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '8px 14px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: '#7c3aed', fontSize: '12px', fontWeight: '700' }}>★ {hodDept}</span>
                          <span style={{ color: '#7c3aed', fontWeight: '700', fontSize: '13px' }}>
                            {event.myDepartmentStat.count} ({event.myDepartmentStat.percentage}%)
                          </span>
                        </div>
                        <div style={{ background: '#e9d5ff', borderRadius: '4px', height: '6px' }}>
                          <div style={{ width: `${event.myDepartmentStat.percentage}%`, background: '#7c3aed', height: '100%', borderRadius: '4px' }}/>
                        </div>
                      </div>
                    )}

                    {/* Top 3 dept stats */}
                    {event.departmentStats?.slice(0, 3).map(d => (
                      <div key={d.department} style={{ marginBottom: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            {d.department === 'Computer Engineering' ? 'CSE' : d.department === 'Information Technology' ? 'IT' : d.department === 'Mechanical Engineering' ? 'MECH' : d.department?.slice(0, 12)}
                          </span>
                          <span style={{ fontSize: '11px', color: '#1a3a6b', fontWeight: '600' }}>{d.count} ({d.percentage}%)</span>
                        </div>
                        <div style={{ background: '#f0f4ff', borderRadius: '3px', height: '5px' }}>
                          <div style={{ width: `${d.percentage}%`, background: getColor(d.department), height: '100%', borderRadius: '3px' }}/>
                        </div>
                      </div>
                    ))}

                    <button onClick={async () => { setSelectedEvent(event); await fetchEventStats(event.id) }}
                      style={{ marginTop: '12px', background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 0', width: '100%', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                      📊 View Full Stats
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════
            TAB: ANALYTICS
        ════════════════════════════════════════ */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Summary Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { label: 'Participation Rate', value: `${analytics?.summary?.participationRate || 0}%`, desc: `${analytics?.summary?.participated || 0} of ${analytics?.summary?.totalStudents || 0} students`, icon: '📈', color: '#1a3a6b', bg: '#eff6ff', border: '#bfdbfe' },
                { label: 'Coordinators',       value: analytics?.summary?.coordinators || 0,            desc: 'from your department',                                                                                  icon: '🎯', color: '#7c3aed', bg: '#fdf4ff', border: '#e9d5ff' },
                { label: 'Volunteers',         value: analytics?.summary?.volunteers || 0,              desc: 'from your department',                                                                                  icon: '🙋', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
              ].map(s => (
                <div key={s.label} style={statCard(s.bg, s.border, s.color)}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
                  <div style={{ color: s.color, fontSize: '28px', fontWeight: '800' }}>{s.value}</div>
                  <div style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '600', marginTop: '4px' }}>{s.label}</div>
                  <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>{s.desc}</div>
                </div>
              ))}
            </div>

            {/* Formula Card */}
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '16px', padding: '20px' }}>
              <h3 style={{ color: '#92400e', fontWeight: '700', fontSize: '14px', marginBottom: '12px' }}>📐 Participation Rate Formula</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ background: '#fff', border: '1px solid #fcd34d', borderRadius: '8px', padding: '10px 16px', textAlign: 'center' }}>
                  <div style={{ color: '#64748b', fontSize: '11px' }}>Students Participated</div>
                  <div style={{ color: '#1a3a6b', fontSize: '20px', fontWeight: '800' }}>{analytics?.summary?.participated || 0}</div>
                </div>
                <span style={{ color: '#d97706', fontWeight: '800', fontSize: '20px' }}>÷</span>
                <div style={{ background: '#fff', border: '1px solid #fcd34d', borderRadius: '8px', padding: '10px 16px', textAlign: 'center' }}>
                  <div style={{ color: '#64748b', fontSize: '11px' }}>Total Dept Students</div>
                  <div style={{ color: '#1a3a6b', fontSize: '20px', fontWeight: '800' }}>{analytics?.summary?.totalStudents || 0}</div>
                </div>
                <span style={{ color: '#d97706', fontWeight: '800', fontSize: '20px' }}>×  100  =</span>
                <div style={{ background: '#1a3a6b', border: 'none', borderRadius: '8px', padding: '10px 16px', textAlign: 'center' }}>
                  <div style={{ color: '#93c5fd', fontSize: '11px' }}>Participation Rate</div>
                  <div style={{ color: '#fff', fontSize: '20px', fontWeight: '800' }}>{analytics?.summary?.participationRate || 0}%</div>
                </div>
              </div>
            </div>

            {/* Monthly Trend Full */}
            <div style={card()}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '15px', marginBottom: '16px' }}>📅 Monthly Trend (Last 6 Months)</h2>
              {!analytics?.monthlyTrend?.length ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '30px' }}>No data yet</p>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '160px', padding: '0 8px' }}>
                    {analytics.monthlyTrend.map((m, i) => {
                      const max = Math.max(...analytics.monthlyTrend.map(x => parseInt(x.count)))
                      const h = max > 0 ? (parseInt(m.count) / max) * 140 : 4
                      return (
                        <div key={m.month_key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '11px', color: '#1a3a6b', fontWeight: '700' }}>{m.count}</span>
                          <div style={{ width: '100%', height: `${h}px`, background: '#1a3a6b', borderRadius: '4px 4px 0 0', minHeight: '4px' }}/>
                          <span style={{ fontSize: '10px', color: '#64748b' }}>{m.month.split(' ')[0]}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Event-wise Full */}
            <div style={card()}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '15px', marginBottom: '16px' }}>🎯 Top Events by {hodDept} Participation</h2>
              {!analytics?.eventWise?.length ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '30px' }}>No participation data yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {analytics.eventWise.map((e, i) => {
                    const max = Math.max(...analytics.eventWise.map(x => x.count))
                    const pct = max > 0 ? (e.count / max) * 100 : 0
                    return (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '600' }}>{i + 1}. {e.title}</span>
                          <span style={badge('#1a3a6b', '#eff6ff')}>{e.count} students</span>
                        </div>
                        <div style={{ background: '#f0f4ff', borderRadius: '6px', height: '10px' }}>
                          <div style={{ width: `${pct}%`, background: '#1a3a6b', height: '100%', borderRadius: '6px' }}/>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      <footer style={{ background: '#1a3a6b', color: '#93c5fd', textAlign: 'center', padding: '20px', fontSize: '13px', marginTop: '40px' }}>
        © 2025 CampusEvents · Vishwakarma Institute of Technology, Pune
      </footer>
    </div>
  )
}