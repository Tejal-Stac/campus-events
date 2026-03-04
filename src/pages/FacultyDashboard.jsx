import { useState } from 'react'
import { Link } from 'react-router-dom'

const facultyInfo = {
  name: 'Dr. Rajesh Sharma',
  designation: 'Assistant Professor',
  department: 'Computer Engineering',
  campus: 'Kondhwa',
  email: 'rajesh.sharma@vit.edu',
  avatar: 'RS',
}

const myEvents = [
  {
    id: 1,
    title: 'National Hackathon 2025',
    organisingClub: 'CSE Department',
    saVertical: 'Technical',
    date: 'March 15, 2025',
    day: 'Saturday',
    timeFrom: '9:00 AM',
    timeTo: '9:00 PM',
    venue: 'Main Auditorium',
    onlineLink: '',
    targetAudience: 'All Branches - 2nd, 3rd Year',
    expectedCount: 150,
    fees: 'Free',
    contact: '9876543210',
    category: 'Hackathon',
    registered: 89,
    seats: 120,
    status: 'Active',
    keyFeatures: ['24 Hour Coding', 'Cash Prizes', 'Industry Mentors'],
  },
  {
    id: 2,
    title: 'Tech Talk: AI & Future',
    organisingClub: 'CSE Department',
    saVertical: 'Technical',
    date: 'April 2, 2025',
    day: 'Wednesday',
    timeFrom: '11:00 AM',
    timeTo: '1:00 PM',
    venue: 'Seminar Hall A',
    onlineLink: 'meet.google.com/abc-xyz',
    targetAudience: 'CSE, IT - All Years',
    expectedCount: 100,
    fees: 'Free',
    contact: '9876543211',
    category: 'Seminar',
    registered: 67,
    seats: 80,
    status: 'Active',
    keyFeatures: ['Industry Experts', 'Q&A Session', 'Certificate'],
  },
  {
    id: 3,
    title: 'CodeSprint 2024',
    organisingClub: 'CSE Department',
    saVertical: 'Technical',
    date: 'November 10, 2024',
    day: 'Sunday',
    timeFrom: '10:00 AM',
    timeTo: '4:00 PM',
    venue: 'Lab Block 3',
    onlineLink: '',
    targetAudience: 'All Branches - 3rd, 4th Year',
    expectedCount: 120,
    fees: '₹100',
    contact: '9876543212',
    category: 'Hackathon',
    registered: 120,
    seats: 120,
    status: 'Completed',
    keyFeatures: ['Competitive Coding', 'Prizes', 'Certificate'],
  },
]

const saVerticals = [
  'Technical', 'Cultural', 'Sports', 'Social', 'Entrepreneurship',
  'Literary', 'NSS', 'NCC', 'Professional Body', 'Other'
]

const pendingApprovals = [
  { id: 1, title: 'ML Workshop', submittedOn: 'Feb 20, 2025', status: 'Pending' },
  { id: 2, title: 'Web Dev Bootcamp', submittedOn: 'Feb 22, 2025', status: 'Approved' },
]

export default function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
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

  const inputStyle = {
    background: '#f8faff', border: '1px solid #cbd5e1', color: '#1a3a6b',
    borderRadius: '10px', width: '100%', padding: '11px 14px',
    fontSize: '13px', outline: 'none', boxSizing: 'border-box'
  }
  const labelStyle = {
    color: '#1a3a6b', fontSize: '13px', fontWeight: '600',
    display: 'block', marginBottom: '6px'
  }

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'events', label: '📅 My Events' },
    { id: 'create', label: '➕ Create Event' },
    { id: 'reports', label: '📋 Reports' },
  ]

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
          <Link to="/login" style={{ color: '#93c5fd', fontSize: '12px', textDecoration: 'none' }}>Logout</Link>
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
            { label: 'Events Created', value: '8', icon: '📅', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
            { label: 'Total Registrations', value: '1,240', icon: '👥', color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
            { label: 'Pending Approvals', value: '2', icon: '⏳', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ color: '#1a3a6b', fontWeight: '700' }}>📅 My Events</h2>
                <button onClick={() => setActiveTab('create')}
                  style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                  + New Event
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {myEvents.map(e => {
                  const pct = Math.round((e.registered / e.seats) * 100)
                  return (
                    <div key={e.id} style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div>
                          <p style={{ color: '#1a3a6b', fontSize: '14px', fontWeight: '700' }}>{e.title}</p>
                          <p style={{ color: '#64748b', fontSize: '11px' }}>📅 {e.day}, {e.date} · ⏰ {e.timeFrom} - {e.timeTo}</p>
                          <p style={{ color: '#64748b', fontSize: '11px' }}>📍 {e.venue} · 👥 {e.targetAudience}</p>
                        </div>
                        <span style={{ background: e.status === 'Active' ? '#dcfce7' : '#f1f5f9', color: e.status === 'Active' ? '#16a34a' : '#64748b', borderRadius: '6px', fontSize: '11px', padding: '3px 8px', fontWeight: '600', height: 'fit-content' }}>{e.status}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#64748b', fontSize: '11px' }}>{e.registered}/{e.seats} registered</span>
                        <span style={{ color: pct > 80 ? '#dc2626' : '#16a34a', fontSize: '11px', fontWeight: '600' }}>{pct}%</span>
                      </div>
                      <div style={{ background: '#dbeafe', borderRadius: '4px', height: '5px' }}>
                        <div style={{ width: `${pct}%`, background: pct > 80 ? '#dc2626' : '#1a3a6b', borderRadius: '4px', height: '5px' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
                <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>⏳ Approval Status</h2>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {myEvents.map(e => {
              const pct = Math.round((e.registered / e.seats) * 100)
              return (
                <div key={e.id} style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: '6px', fontSize: '12px', padding: '3px 10px', fontWeight: '600' }}>{e.category}</span>
                    <span style={{ background: e.status === 'Active' ? '#dcfce7' : '#f1f5f9', color: e.status === 'Active' ? '#16a34a' : '#64748b', borderRadius: '6px', fontSize: '11px', padding: '3px 8px', fontWeight: '600' }}>{e.status}</span>
                  </div>
                  <h3 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '16px', marginBottom: '10px' }}>{e.title}</h3>

                  {/* All Event Details from sir's format */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' }}>
                    {[
                      { icon: '🏢', label: 'Organising Club/Dept', value: e.organisingClub },
                      { icon: '📌', label: 'SA Vertical', value: e.saVertical },
                      { icon: '📅', label: 'Date & Day', value: `${e.day}, ${e.date}` },
                      { icon: '⏰', label: 'Time', value: `${e.timeFrom} to ${e.timeTo}` },
                      { icon: '📍', label: 'Venue', value: e.venue },
                      e.onlineLink ? { icon: '🔗', label: 'Online Link', value: e.onlineLink } : null,
                      { icon: '🎯', label: 'Target Audience', value: e.targetAudience },
                      { icon: '👥', label: 'Expected Count', value: e.expectedCount },
                      { icon: '💰', label: 'Fees', value: e.fees },
                      { icon: '📞', label: 'Contact No', value: e.contact },
                    ].filter(Boolean).map(item => (
                      <div key={item.label} style={{ display: 'flex', gap: '6px' }}>
                        <span style={{ fontSize: '11px', flexShrink: 0 }}>{item.icon}</span>
                        <span style={{ color: '#64748b', fontSize: '11px', flexShrink: 0 }}>{item.label}:</span>
                        <span style={{ color: '#1a3a6b', fontSize: '11px', fontWeight: '600' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Key Features */}
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ color: '#1a3a6b', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Key Features:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {e.keyFeatures.map(f => (
                        <span key={f} style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '20px', fontSize: '11px', padding: '2px 8px' }}>{f}</span>
                      ))}
                    </div>
                  </div>

                  {/* Progress */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#64748b', fontSize: '11px' }}>{e.registered}/{e.seats} registered</span>
                      <span style={{ color: pct > 80 ? '#dc2626' : '#16a34a', fontSize: '11px', fontWeight: '600' }}>{pct}%</span>
                    </div>
                    <div style={{ background: '#dbeafe', borderRadius: '4px', height: '6px' }}>
                      <div style={{ width: `${pct}%`, background: pct > 80 ? '#dc2626' : '#1a3a6b', borderRadius: '4px', height: '6px' }} />
                    </div>
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

        {/* Create Event Tab */}
        {activeTab === 'create' && (
          <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '28px', maxWidth: '700px' }}>
            <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '4px' }}>➕ Create New Event</h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>Fill in all details. It will be sent to Dean for approval.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Event Name */}
              <div>
                <label style={labelStyle}>Event Name *</label>
                <input style={inputStyle} placeholder="e.g. National Hackathon 2025"
                  value={newEvent.title} onChange={e => updateEvent('title', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              </div>

              {/* Organising Club/Dept */}
              <div>
                <label style={labelStyle}>Organising Club / Dept Name *</label>
                <input style={inputStyle} placeholder="e.g. CSE Department / Tech Club"
                  value={newEvent.organisingClub} onChange={e => updateEvent('organisingClub', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              </div>

              {/* SA Vertical */}
              <div>
                <label style={labelStyle}>SA Vertical Name *</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }}
                  value={newEvent.saVertical} onChange={e => updateEvent('saVertical', e.target.value)}>
                  <option value="">Select SA Vertical</option>
                  {saVerticals.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>

              {/* Date + Day */}
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

              {/* Time From - To */}
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

              {/* Venue */}
              <div>
                <label style={labelStyle}>Venue *</label>
                <input style={inputStyle} placeholder="e.g. Main Auditorium, Lab Block 3"
                  value={newEvent.venue} onChange={e => updateEvent('venue', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              </div>

              {/* Online Link */}
              <div>
                <label style={labelStyle}>If Online Link <span style={{ color: '#94a3b8', fontWeight: '400' }}>(optional)</span></label>
                <input style={inputStyle} placeholder="e.g. meet.google.com/abc-xyz (leave blank if offline)"
                  value={newEvent.onlineLink} onChange={e => updateEvent('onlineLink', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              </div>

              {/* Target Audience */}
              <div>
                <label style={labelStyle}>Target Audience *</label>
                <input style={inputStyle} placeholder="e.g. All Branches - 2nd & 3rd Year / CSE Only"
                  value={newEvent.targetAudience} onChange={e => updateEvent('targetAudience', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              </div>

              {/* Expected Count + Seats */}
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

              {/* Fees */}
              <div>
                <label style={labelStyle}>Fees if any *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {['Free', 'Paid'].map(f => (
                    <button key={f} onClick={() => updateEvent('fees', f)}
                      style={{
                        padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                        background: newEvent.fees === f || (f === 'Free' && newEvent.fees === 'Free') ? '#1a3a6b' : '#f0f4ff',
                        color: newEvent.fees === f ? '#fff' : '#64748b',
                        border: `2px solid ${newEvent.fees === f ? '#1a3a6b' : '#dbeafe'}`
                      }}>
                      {f === 'Free' ? '🆓 Free' : '💰 Paid'}
                    </button>
                  ))}
                </div>
                {newEvent.fees === 'Paid' && (
                  <input style={{ ...inputStyle, marginTop: '8px' }} placeholder="Enter amount e.g. ₹100"
                    onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                    onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
                )}
              </div>

              {/* Contact */}
              <div>
                <label style={labelStyle}>Contact No *</label>
                <input style={inputStyle} placeholder="e.g. 9876543210"
                  value={newEvent.contact} onChange={e => updateEvent('contact', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              </div>

              {/* Key Features */}
              <div>
                <label style={labelStyle}>Key Features *</label>
                <input style={inputStyle} placeholder="e.g. Cash Prizes, Certificate, Industry Mentors (comma separated)"
                  value={newEvent.keyFeatures} onChange={e => updateEvent('keyFeatures', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Event Description *</label>
                <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                  placeholder="Describe your event in detail..."
                  value={newEvent.desc} onChange={e => updateEvent('desc', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              </div>

              {/* Banner Upload */}
              <div style={{ background: '#f8faff', border: '2px dashed #bfdbfe', borderRadius: '10px', padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
                <p style={{ color: '#64748b', fontSize: '13px' }}>🖼️ Click to upload event banner / poster</p>
                <p style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>PNG, JPG up to 5MB</p>
              </div>

              {/* Approval Notice */}
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px' }}>
                <p style={{ color: '#a16207', fontSize: '12px' }}>⚠️ This event will be submitted to the <strong>Dean for approval</strong> before going live.</p>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ flex: 1, background: '#f0f4ff', color: '#1a3a6b', border: '1px solid #dbeafe', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  💾 Save as Draft
                </button>
                <button onClick={() => alert(`Event "${newEvent.title}" submitted to Dean for approval!`)}
                  style={{ flex: 2, background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                  📤 Submit for Approval
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '18px' }}>📋 Event Reports</h2>
            {myEvents.filter(e => e.status === 'Completed').map(e => (
              <div key={e.id} style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '18px', marginBottom: '4px' }}>{e.title}</h3>
                    <span style={{ background: '#dcfce7', color: '#16a34a', borderRadius: '6px', fontSize: '11px', padding: '3px 10px', fontWeight: '600' }}>✅ Completed</span>
                  </div>
                  <button style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                    ⬇️ Download Report
                  </button>
                </div>

                {/* Report Details - matching sir's format */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
                  {[
                    { label: 'Event Name', value: e.title },
                    { label: 'Organising Club/Dept', value: e.organisingClub },
                    { label: 'SA Vertical', value: e.saVertical },
                    { label: 'Date & Day', value: `${e.day}, ${e.date}` },
                    { label: 'Time', value: `${e.timeFrom} to ${e.timeTo}` },
                    { label: 'Venue', value: e.venue },
                    { label: 'Target Audience', value: e.targetAudience },
                    { label: 'Expected Count', value: e.expectedCount },
                    { label: 'Actual Registered', value: e.registered },
                    { label: 'Fees', value: e.fees },
                    { label: 'Contact No', value: e.contact },
                  ].map(item => (
                    <div key={item.label} style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '8px', padding: '10px 14px' }}>
                      <p style={{ color: '#64748b', fontSize: '11px' }}>{item.label}</p>
                      <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700' }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Key Features */}
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Key Features:</p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {e.keyFeatures.map(f => (
                      <span key={f} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '20px', fontSize: '12px', padding: '4px 12px' }}>{f}</span>
                    ))}
                  </div>
                </div>

                {/* Registered Students */}
                <div>
                  <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>👥 Registered Students ({e.registered})</p>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8faff', borderBottom: '2px solid #dbeafe' }}>
                          {['#', 'Name', 'GR Number', 'Department', 'Division', 'Campus'].map(h => (
                            <th key={h} style={{ color: '#1a3a6b', fontSize: '12px', fontWeight: '700', padding: '10px 12px', textAlign: 'left' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'Tejal Jadhav', gr: 'VIT2023CSE045', dept: 'Computer Engineering', div: 'A', campus: 'Kondhwa' },
                          { name: 'Rahul Sharma', gr: 'VIT2023CSE032', dept: 'Computer Engineering', div: 'B', campus: 'Bibwewadi' },
                          { name: 'Priya Mehta', gr: 'VIT2023IT021', dept: 'IT', div: 'A', campus: 'Kondhwa' },
                        ].map((s, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #dbeafe' }}>
                            <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '13px' }}>{i + 1}</td>
                            <td style={{ padding: '10px 12px', color: '#1a3a6b', fontSize: '13px', fontWeight: '600' }}>{s.name}</td>
                            <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '13px' }}>{s.gr}</td>
                            <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '13px' }}>{s.dept}</td>
                            <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '13px' }}>{s.div}</td>
                            <td style={{ padding: '10px 12px', color: '#64748b', fontSize: '13px' }}>{s.campus}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <footer style={{ background: '#1a3a6b', color: '#93c5fd', textAlign: 'center', padding: '20px', fontSize: '13px', marginTop: '40px' }}>
        © 2025 CampusEvents · Vishwakarma Institute of Technology, Pune
      </footer>
    </div>
  )
}