import { useState } from 'react'
import Navbar from '../components/Navbar'

const pendingEvents = [
  { id: 1, title: 'Robotics Competition', coordinator: 'Prof. Mehta', dept: 'MECH', date: 'May 3, 2025', seats: 60, category: 'Hackathon' },
  { id: 2, title: 'Finance Summit', coordinator: 'Prof. Kulkarni', dept: 'MBA', date: 'May 10, 2025', seats: 200, category: 'Seminar' },
  { id: 3, title: 'Drama Fest', coordinator: 'Prof. Joshi', dept: 'Arts', date: 'May 18, 2025', seats: 250, category: 'Cultural' },
]

const allUsers = [
  { id: 1, name: 'Tejal Jadhav', email: 'tejal@vit.edu', role: 'Student', branch: 'CSE', year: '3rd', status: 'Active' },
  { id: 2, name: 'Rahul Coordinator', email: 'rahul@vit.edu', role: 'Coordinator', branch: 'CSE', year: '-', status: 'Active' },
  { id: 3, name: 'Priya Mehta', email: 'priya@vit.edu', role: 'Student', branch: 'IT', year: '2nd', status: 'Active' },
  { id: 4, name: 'Prof. Kulkarni', email: 'kulkarni@vit.edu', role: 'Coordinator', branch: 'MBA', year: '-', status: 'Pending' },
  { id: 5, name: 'Aman Verma', email: 'aman@vit.edu', role: 'Student', branch: 'MECH', year: '3rd', status: 'Active' },
  { id: 6, name: 'Prof. Joshi', email: 'joshi@vit.edu', role: 'Coordinator', branch: 'Arts', year: '-', status: 'Pending' },
]

const recentActivity = [
  { id: 1, action: 'New registration', detail: 'Tejal Jadhav registered for National Hackathon', time: '2 mins ago', icon: '📝' },
  { id: 2, action: 'Event submitted', detail: 'Prof. Mehta submitted Robotics Competition for approval', time: '15 mins ago', icon: '📅' },
  { id: 3, action: 'Certificate issued', detail: '45 certificates issued for CodeSprint 2024', time: '1 hour ago', icon: '📜' },
  { id: 4, action: 'New coordinator', detail: 'Prof. Kulkarni registered as coordinator', time: '2 hours ago', icon: '👤' },
  { id: 5, action: 'Event completed', detail: 'Tech Talk: AI & Future marked as completed', time: '5 hours ago', icon: '✅' },
]

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview')
  const [events, setEvents] = useState(pendingEvents)
  const [users, setUsers] = useState(allUsers)
  const [userFilter, setUserFilter] = useState('All')

  const approveEvent = (id) => setEvents(prev => prev.filter(e => e.id !== id))
  const rejectEvent = (id) => setEvents(prev => prev.filter(e => e.id !== id))
  const toggleUserStatus = (id) => setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u))
  const filteredUsers = userFilter === 'All' ? users : users.filter(u => u.role === userFilter)

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'approvals', label: `📋 Approvals ${events.length > 0 ? `(${events.length})` : ''}` },
    { id: 'users', label: '👥 Users' },
    { id: 'analytics', label: '📈 Analytics' },
  ]

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a6b, #1e40af)', paddingTop: '56px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: '#fff', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a3a6b', fontWeight: '800', fontSize: '18px' }}>AD</div>
              <div>
                <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '700' }}>Admin Panel ⚙️</h1>
                <p style={{ color: '#bfdbfe', fontSize: '13px' }}>Super Admin · VIT Pune · Full Access</p>
              </div>
            </div>
            <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: '700' }}>
              🔴 Admin Access
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Users', value: '5,240', icon: '👥', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
            { label: 'Total Events', value: '200', icon: '📅', color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
            { label: 'Pending Approvals', value: events.length, icon: '⏳', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
            { label: 'Certificates Issued', value: '3,000+', icon: '📜', color: '#7c3aed', bg: '#fdf4ff', border: '#e9d5ff' },
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
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>⚡ Recent Activity</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentActivity.map(a => (
                  <div key={a.id} style={{ background: '#f8faff', borderRadius: '12px', border: '1px solid #dbeafe', padding: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>{a.icon}</span>
                    <div>
                      <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700' }}>{a.action}</p>
                      <p style={{ color: '#64748b', fontSize: '12px' }}>{a.detail}</p>
                      <p style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ color: '#1a3a6b', fontWeight: '700' }}>⏳ Pending Approvals</h2>
                <button onClick={() => setActiveTab('approvals')} style={{ color: '#2563eb', fontSize: '12px', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '600' }}>View all →</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {events.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                    <p>All caught up! No pending approvals.</p>
                  </div>
                ) : events.map(e => (
                  <div key={e.id} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700' }}>{e.title}</p>
                        <p style={{ color: '#64748b', fontSize: '11px' }}>{e.coordinator} · {e.dept} · {e.date}</p>
                      </div>
                      <span style={{ background: '#fef9c3', color: '#a16207', borderRadius: '6px', fontSize: '11px', padding: '2px 8px', fontWeight: '600', height: 'fit-content' }}>{e.category}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => approveEvent(e.id)}
                        style={{ flex: 1, background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                        ✅ Approve
                      </button>
                      <button onClick={() => rejectEvent(e.id)}
                        style={{ flex: 1, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '20px' }}>📋 Event Approval Requests</h2>
            {events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                <p style={{ fontSize: '16px', fontWeight: '600' }}>All events reviewed! No pending approvals.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {events.map(e => (
                  <div key={e.id} style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ background: '#fffbeb', color: '#d97706', borderRadius: '6px', fontSize: '12px', padding: '3px 10px', fontWeight: '600' }}>{e.category}</span>
                        <span style={{ background: '#fef2f2', color: '#dc2626', borderRadius: '6px', fontSize: '11px', padding: '2px 8px', fontWeight: '600' }}>Pending Review</span>
                      </div>
                      <h3 style={{ color: '#1a3a6b', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>{e.title}</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                        <p style={{ color: '#64748b', fontSize: '13px' }}>👤 {e.coordinator}</p>
                        <p style={{ color: '#64748b', fontSize: '13px' }}>🏫 {e.dept}</p>
                        <p style={{ color: '#64748b', fontSize: '13px' }}>📅 {e.date}</p>
                        <p style={{ color: '#64748b', fontSize: '13px' }}>💺 {e.seats} seats</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '120px' }}>
                      <button onClick={() => approveEvent(e.id)}
                        style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                        ✅ Approve
                      </button>
                      <button onClick={() => rejectEvent(e.id)}
                        style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700' }}>👥 User Management</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['All', 'Student', 'Coordinator'].map(f => (
                  <button key={f} onClick={() => setUserFilter(f)}
                    style={{
                      padding: '6px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                      background: userFilter === f ? '#1a3a6b' : '#f0f4ff',
                      color: userFilter === f ? '#fff' : '#64748b',
                      border: `1px solid ${userFilter === f ? '#1a3a6b' : '#dbeafe'}`,
                      fontWeight: userFilter === f ? '600' : '400'
                    }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8faff', borderBottom: '2px solid #dbeafe' }}>
                    {['User', 'Role', 'Branch', 'Year', 'Status', 'Action'].map(h => (
                      <th key={h} style={{ color: '#1a3a6b', fontSize: '12px', fontWeight: '700', padding: '12px', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #dbeafe' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ background: '#dbeafe', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a3a6b', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
                            {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700' }}>{u.name}</p>
                            <p style={{ color: '#64748b', fontSize: '11px' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: u.role === 'Coordinator' ? '#f0fdf4' : '#eff6ff', color: u.role === 'Coordinator' ? '#15803d' : '#1d4ed8', borderRadius: '6px', fontSize: '11px', padding: '3px 8px', fontWeight: '600' }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>{u.branch}</td>
                      <td style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>{u.year}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          background: u.status === 'Active' ? '#dcfce7' : u.status === 'Pending' ? '#fef9c3' : '#fef2f2',
                          color: u.status === 'Active' ? '#16a34a' : u.status === 'Pending' ? '#a16207' : '#dc2626',
                          borderRadius: '6px', fontSize: '11px', padding: '3px 8px', fontWeight: '600'
                        }}>
                          {u.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button onClick={() => toggleUserStatus(u.id)}
                          style={{
                            background: u.status === 'Active' ? '#fef2f2' : '#f0fdf4',
                            color: u.status === 'Active' ? '#dc2626' : '#16a34a',
                            border: `1px solid ${u.status === 'Active' ? '#fecaca' : '#bbf7d0'}`,
                            borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: '600'
                          }}>
                          {u.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '20px' }}>📊 Events by Category</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'Hackathon', count: 45, total: 200, color: '#1d4ed8' },
                  { label: 'Cultural', count: 60, total: 200, color: '#db2777' },
                  { label: 'Seminar', count: 38, total: 200, color: '#059669' },
                  { label: 'Sports', count: 30, total: 200, color: '#d97706' },
                  { label: 'Workshop', count: 27, total: 200, color: '#7c3aed' },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '600' }}>{item.label}</span>
                      <span style={{ color: '#64748b', fontSize: '12px' }}>{item.count} events</span>
                    </div>
                    <div style={{ background: '#f0f4ff', borderRadius: '4px', height: '8px' }}>
                      <div style={{ width: `${(item.count / item.total) * 100}%`, background: item.color, borderRadius: '4px', height: '8px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '20px' }}>📈 Platform Statistics</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Active Students', value: '4,890', change: '+12%' },
                  { label: 'Active Coordinators', value: '78', change: '+5%' },
                  { label: 'Events This Month', value: '24', change: '+8%' },
                  { label: 'Certificates This Month', value: '340', change: '+22%' },
                  { label: 'Avg. Event Attendance', value: '87%', change: '+3%' },
                ].map(s => (
                  <div key={s.label} style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '10px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>{s.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#1a3a6b', fontSize: '14px', fontWeight: '700' }}>{s.value}</span>
                      <span style={{ color: '#16a34a', fontSize: '11px', background: '#dcfce7', borderRadius: '4px', padding: '2px 6px', fontWeight: '600' }}>{s.change}</span>
                    </div>
                  </div>
                ))}
              </div>
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