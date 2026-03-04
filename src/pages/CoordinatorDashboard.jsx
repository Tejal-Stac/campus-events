import { useState } from 'react'
import Navbar from '../components/Navbar'

const myEvents = [
  { id: 1, title: 'National Hackathon 2025', date: 'Mar 15, 2025', category: 'Hackathon', registered: 89, seats: 120, status: 'Active', volunteers: 12 },
  { id: 2, title: 'Tech Talk: AI & Future', date: 'Apr 2, 2025', category: 'Seminar', registered: 67, seats: 80, status: 'Active', volunteers: 6 },
  { id: 3, title: 'CodeSprint 2024', date: 'Nov 10, 2024', category: 'Hackathon', registered: 120, seats: 120, status: 'Completed', volunteers: 10 },
]

const volunteers = [
  { id: 1, name: 'Rahul Sharma', branch: 'CSE', year: '3rd', duty: 'Registration Desk', event: 'National Hackathon 2025', status: 'Confirmed' },
  { id: 2, name: 'Priya Mehta', branch: 'IT', year: '2nd', duty: 'Stage Management', event: 'National Hackathon 2025', status: 'Confirmed' },
  { id: 3, name: 'Aman Verma', branch: 'CSE', year: '3rd', duty: 'Judging Coordination', event: 'National Hackathon 2025', status: 'Pending' },
  { id: 4, name: 'Sneha Patil', branch: 'ENTC', year: '2nd', duty: 'Food & Logistics', event: 'Tech Talk: AI & Future', status: 'Confirmed' },
]

const duties = ['Registration Desk', 'Stage Management', 'Food & Logistics', 'Judging Coordination', 'Photography', 'Security', 'Guest Handling']

export default function CoordinatorDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [newEvent, setNewEvent] = useState({ title: '', date: '', category: '', seats: '', venue: '', desc: '' })
  const updateEvent = (field, value) => setNewEvent(prev => ({ ...prev, [field]: value }))

  const inputStyle = {
    background: '#f8faff', border: '1px solid #cbd5e1', color: '#1a3a6b',
    borderRadius: '10px', width: '100%', padding: '11px 14px',
    fontSize: '13px', outline: 'none', boxSizing: 'border-box'
  }
  const labelStyle = { color: '#1a3a6b', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'events', label: '📅 My Events' },
    { id: 'volunteers', label: '👥 Volunteers' },
    { id: 'create', label: '➕ Create Event' },
  ]

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a6b, #2563eb)', paddingTop: '56px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: '#fff', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a3a6b', fontWeight: '800', fontSize: '18px' }}>RC</div>
              <div>
                <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '700' }}>Coordinator Dashboard 🎯</h1>
                <p style={{ color: '#bfdbfe', fontSize: '13px' }}>Rahul Coordinator · CSE Dept · VIT Pune</p>
              </div>
            </div>
            <button onClick={() => setActiveTab('create')}
              style={{ background: '#fff', color: '#1a3a6b', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
              + Create New Event
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Events Created', value: '8', icon: '📅', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
            { label: 'Total Registrations', value: '1,240', icon: '👥', color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
            { label: 'Volunteers Managed', value: '45', icon: '🙋', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
            { label: 'Certificates Issued', value: '980', icon: '📜', color: '#7c3aed', bg: '#fdf4ff', border: '#e9d5ff' },
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
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>📅 Recent Events</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {myEvents.map(e => {
                  const pct = Math.round((e.registered / e.seats) * 100)
                  return (
                    <div key={e.id} style={{ background: '#f8faff', borderRadius: '12px', border: '1px solid #dbeafe', padding: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div>
                          <p style={{ color: '#1a3a6b', fontSize: '14px', fontWeight: '700' }}>{e.title}</p>
                          <p style={{ color: '#64748b', fontSize: '12px' }}>{e.date}</p>
                        </div>
                        <span style={{ background: e.status === 'Active' ? '#dcfce7' : '#eff6ff', color: e.status === 'Active' ? '#16a34a' : '#1d4ed8', borderRadius: '6px', fontSize: '11px', padding: '3px 8px', fontWeight: '600', height: 'fit-content' }}>{e.status}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#64748b', fontSize: '11px' }}>{e.registered}/{e.seats} registered</span>
                        <span style={{ color: pct > 80 ? '#dc2626' : '#16a34a', fontSize: '11px', fontWeight: '600' }}>{pct}%</span>
                      </div>
                      <div style={{ background: '#dbeafe', borderRadius: '4px', height: '6px' }}>
                        <div style={{ width: `${pct}%`, background: pct > 80 ? '#dc2626' : '#1a3a6b', borderRadius: '4px', height: '6px' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>👥 Volunteer Summary</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {volunteers.map(v => (
                  <div key={v.id} style={{ background: '#f8faff', borderRadius: '12px', border: '1px solid #dbeafe', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ background: '#dbeafe', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a3a6b', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                        {v.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700' }}>{v.name}</p>
                        <p style={{ color: '#64748b', fontSize: '11px' }}>{v.duty}</p>
                      </div>
                    </div>
                    <span style={{ background: v.status === 'Confirmed' ? '#dcfce7' : '#fef9c3', color: v.status === 'Confirmed' ? '#16a34a' : '#a16207', borderRadius: '6px', fontSize: '11px', padding: '3px 8px', fontWeight: '600' }}>
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* My Events Tab */}
        {activeTab === 'events' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {myEvents.map(e => {
              const pct = Math.round((e.registered / e.seats) * 100)
              return (
                <div key={e.id} style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: '6px', fontSize: '12px', padding: '3px 10px', fontWeight: '600' }}>{e.category}</span>
                    <span style={{ background: e.status === 'Active' ? '#dcfce7' : '#f1f5f9', color: e.status === 'Active' ? '#16a34a' : '#64748b', borderRadius: '6px', fontSize: '11px', padding: '3px 8px', fontWeight: '600' }}>{e.status}</span>
                  </div>
                  <h3 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '4px' }}>{e.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '12px' }}>📅 {e.date} · 🙋 {e.volunteers} volunteers</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b', fontSize: '11px' }}>{e.registered}/{e.seats} registered</span>
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
            })}
          </div>
        )}

        {/* Volunteers Tab */}
        {activeTab === 'volunteers' && (
          <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700' }}>👥 Volunteer & Duty Management</h2>
              <button style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>+ Add Volunteer</button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              <span style={{ color: '#64748b', fontSize: '12px', alignSelf: 'center' }}>Duties:</span>
              {duties.map(d => (
                <span key={d} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '20px', fontSize: '11px', padding: '3px 10px', fontWeight: '500' }}>{d}</span>
              ))}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #dbeafe', background: '#f8faff' }}>
                    {['Volunteer', 'Branch', 'Year', 'Duty Assigned', 'Event', 'Status', 'Action'].map(h => (
                      <th key={h} style={{ color: '#1a3a6b', fontSize: '12px', fontWeight: '700', padding: '12px', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map(v => (
                    <tr key={v.id} style={{ borderBottom: '1px solid #dbeafe' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ background: '#dbeafe', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a3a6b', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
                            {v.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '600' }}>{v.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>{v.branch}</td>
                      <td style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>{v.year}</td>
                      <td style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>{v.duty}</td>
                      <td style={{ padding: '12px', color: '#64748b', fontSize: '12px' }}>{v.event}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: v.status === 'Confirmed' ? '#dcfce7' : '#fef9c3', color: v.status === 'Confirmed' ? '#16a34a' : '#a16207', borderRadius: '6px', fontSize: '11px', padding: '3px 8px', fontWeight: '600' }}>
                          {v.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Event Tab */}
        {activeTab === 'create' && (
          <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '28px', maxWidth: '640px' }}>
            <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '6px' }}>➕ Create New Event</h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>Fill in the details to publish your event on CampusEvents</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Event Title *</label>
                <input style={inputStyle} placeholder="e.g. National Hackathon 2025" value={newEvent.title} onChange={e => updateEvent('title', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Event Date *</label>
                  <input style={inputStyle} type="date" value={newEvent.date} onChange={e => updateEvent('date', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={newEvent.category} onChange={e => updateEvent('category', e.target.value)}>
                    <option value="">Select category</option>
                    {['Hackathon', 'Cultural', 'Seminar', 'Sports', 'Workshop', 'Networking'].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Total Seats *</label>
                  <input style={inputStyle} type="number" placeholder="e.g. 120" value={newEvent.seats} onChange={e => updateEvent('seats', e.target.value)}
                    onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                    onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
                </div>
                <div>
                  <label style={labelStyle}>Venue *</label>
                  <input style={inputStyle} placeholder="e.g. Main Auditorium" value={newEvent.venue} onChange={e => updateEvent('venue', e.target.value)}
                    onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                    onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Event Description *</label>
                <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} placeholder="Describe your event..." value={newEvent.desc} onChange={e => updateEvent('desc', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              </div>
              <div style={{ background: '#f8faff', border: '2px dashed #bfdbfe', borderRadius: '10px', padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
                <p style={{ color: '#64748b', fontSize: '13px' }}>🖼️ Click to upload event banner / poster</p>
                <p style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>PNG, JPG up to 5MB</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button style={{ flex: 1, background: '#f0f4ff', color: '#1a3a6b', border: '1px solid #dbeafe', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  Save as Draft
                </button>
                <button onClick={() => alert(`Event "${newEvent.title}" published!`)}
                  style={{ flex: 2, background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                  🚀 Publish Event
                </button>
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