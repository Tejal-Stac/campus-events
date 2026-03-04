import { useState } from 'react'
import { Link } from 'react-router-dom'

const volunteerInfo = {
  name: 'Rahul Sharma',
  gr: 'VIT2023CSE032',
  department: 'Computer Engineering',
  division: 'B',
  year: '3rd Year',
  campus: 'Kondhwa',
  email: 'rahul.sharma23@vit.edu',
  avatar: 'RS',
  assignedBy: 'Dr. A. Mehta (Dean)',
}

const assignedDuties = [
  {
    id: 1,
    event: 'National Hackathon 2025',
    date: 'March 15, 2025',
    day: 'Saturday',
    time: '9:00 AM',
    venue: 'Main Auditorium',
    organizedBy: 'CSE Department',
    duty: 'Registration Desk',
    status: 'Upcoming',
    keyFeatures: ['24 Hour Coding', 'Cash Prizes', 'Industry Mentors'],
    reportingTime: '8:00 AM',
    coordinator: 'Prof. Rajesh Sharma',
    instructions: 'Please arrive 1 hour before event. Carry your ID card. Wear the volunteer T-shirt provided.',
  },
  {
    id: 2,
    event: 'Tech Talk: AI & Future',
    date: 'April 2, 2025',
    day: 'Wednesday',
    time: '11:00 AM',
    venue: 'Seminar Hall A',
    organizedBy: 'CSE Department',
    duty: 'Guest Handling',
    status: 'Upcoming',
    keyFeatures: ['Industry Experts', 'Q&A Session', 'Certificate'],
    reportingTime: '10:00 AM',
    coordinator: 'Prof. Rajesh Sharma',
    instructions: 'Welcome and escort guests to the venue. Maintain guest list.',
  },
  {
    id: 3,
    event: 'CodeSprint 2024',
    date: 'November 10, 2024',
    day: 'Sunday',
    time: '10:00 AM',
    venue: 'Lab Block 3',
    organizedBy: 'CSE Department',
    duty: 'Stage Management',
    status: 'Completed',
    keyFeatures: ['Competitive Coding', 'Prizes', 'Certificate'],
    reportingTime: '9:00 AM',
    coordinator: 'Prof. Rajesh Sharma',
    instructions: 'Manage stage setup and assist participants during prize distribution.',
  },
]

export default function VolunteerDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDuty, setSelectedDuty] = useState(null)

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'duties', label: '📋 My Duties' },
    { id: 'history', label: '🏆 History' },
  ]

  const dutyColors = {
    'Registration Desk': '#1d4ed8',
    'Guest Handling': '#7c3aed',
    'Stage Management': '#db2777',
    'Food & Logistics': '#d97706',
    'Photography': '#059669',
    'Security': '#dc2626',
    'Judging Coordination': '#0891b2',
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
          <Link to="/login" style={{ color: '#93c5fd', fontSize: '12px', textDecoration: 'none' }}>Logout</Link>
          <div style={{ background: '#2563eb', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '13px' }}>
            {volunteerInfo.avatar}
          </div>
        </div>
      </div>

      {/* Volunteer Info Bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #dbeafe', padding: '10px 24px', marginTop: '56px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#1a3a6b', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '16px' }}>
            {volunteerInfo.avatar}
          </div>
          <div>
            <p style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '15px' }}>{volunteerInfo.name}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#fef9c3', color: '#a16207', borderRadius: '20px', fontSize: '11px', padding: '2px 10px', fontWeight: '600' }}>🙋 Volunteer</span>
              <span style={{ color: '#64748b', fontSize: '12px' }}>Assigned by {volunteerInfo.assignedBy}</span>
            </div>
          </div>
        </div>
        <div style={{ color: '#64748b', fontSize: '13px' }}>GR No: <strong style={{ color: '#1a3a6b' }}>{volunteerInfo.gr}</strong></div>
        <div style={{ color: '#64748b', fontSize: '13px' }}>Dept: <strong style={{ color: '#1a3a6b' }}>{volunteerInfo.department}</strong></div>
        <div style={{ color: '#64748b', fontSize: '13px' }}>Campus: <strong style={{ color: '#1a3a6b' }}>{volunteerInfo.campus}</strong></div>
      </div>

      {/* Breadcrumb */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '8px 24px' }}>
        <p style={{ color: '#64748b', fontSize: '13px' }}>🏠 Home / <span style={{ color: '#1a3a6b', fontWeight: '600' }}>Volunteer Dashboard</span></p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Duties Assigned', value: assignedDuties.length, icon: '📋', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
            { label: 'Upcoming Events', value: assignedDuties.filter(d => d.status === 'Upcoming').length, icon: '📅', color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
            { label: 'Completed', value: assignedDuties.filter(d => d.status === 'Completed').length, icon: '✅', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
            { label: 'Certificates', value: '1', icon: '📜', color: '#7c3aed', bg: '#fdf4ff', border: '#e9d5ff' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '16px', textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>{s.icon}</div>
              <div style={{ color: s.color, fontSize: '26px', fontWeight: '800' }}>{s.value}</div>
              <div style={{ color: '#64748b', fontSize: '12px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '4px', display: 'inline-flex', gap: '4px', marginBottom: '20px' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', border: 'none', cursor: 'pointer',
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

            {/* Upcoming Duties */}
            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>📅 Upcoming Duties</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {assignedDuties.filter(d => d.status === 'Upcoming').map(d => (
                  <div key={d.id} style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '14px', cursor: 'pointer' }}
                    onClick={() => { setSelectedDuty(d); setActiveTab('duties') }}
                    onMouseOver={e => e.currentTarget.style.borderColor = '#1a3a6b'}
                    onMouseOut={e => e.currentTarget.style.borderColor = '#dbeafe'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <p style={{ color: '#1a3a6b', fontSize: '14px', fontWeight: '700' }}>{d.event}</p>
                      <span style={{ background: (dutyColors[d.duty] || '#1a3a6b') + '15', color: dutyColors[d.duty] || '#1a3a6b', borderRadius: '6px', fontSize: '11px', padding: '2px 8px', fontWeight: '600', flexShrink: 0 }}>{d.duty}</span>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '12px' }}>📅 {d.day}, {d.date} · ⏰ Report by {d.reportingTime}</p>
                    <p style={{ color: '#64748b', fontSize: '12px' }}>📍 {d.venue}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile + Instructions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* My Profile */}
              <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
                <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>👤 My Profile</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Name', value: volunteerInfo.name },
                    { label: 'GR Number', value: volunteerInfo.gr },
                    { label: 'Department', value: volunteerInfo.department },
                    { label: 'Division', value: volunteerInfo.division },
                    { label: 'Year', value: volunteerInfo.year },
                    { label: 'Campus', value: volunteerInfo.campus },
                    { label: 'Email', value: volunteerInfo.email },
                  ].map(item => (
                    <div key={item.label} style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '8px', padding: '9px 14px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b', fontSize: '12px' }}>{item.label}</span>
                      <span style={{ color: '#1a3a6b', fontSize: '12px', fontWeight: '600' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* General Instructions */}
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '16px', padding: '20px' }}>
                <h2 style={{ color: '#a16207', fontWeight: '700', marginBottom: '12px' }}>📌 General Instructions</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    'Always carry your college ID card',
                    'Arrive before the reporting time',
                    'Wear the volunteer T-shirt provided',
                    'Contact your coordinator if any issues arise',
                    'Maintain discipline and be respectful to everyone',
                  ].map((inst, i) => (
                    <p key={i} style={{ color: '#a16207', fontSize: '12px' }}>• {inst}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Duties Tab */}
        {activeTab === 'duties' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '18px' }}>📋 All Assigned Duties</h2>
            {assignedDuties.filter(d => d.status === 'Upcoming').map(d => (
              <div key={d.id} style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '18px', marginBottom: '6px' }}>{d.event}</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ background: '#fef9c3', color: '#a16207', borderRadius: '6px', fontSize: '11px', padding: '3px 10px', fontWeight: '600' }}>📅 Upcoming</span>
                      <span style={{ background: (dutyColors[d.duty] || '#1a3a6b') + '15', color: dutyColors[d.duty] || '#1a3a6b', borderRadius: '6px', fontSize: '11px', padding: '3px 10px', fontWeight: '600' }}>🎯 {d.duty}</span>
                    </div>
                  </div>
                </div>

                {/* Event Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  {[
                    { label: 'Organized By', value: d.organizedBy },
                    { label: 'Date & Day', value: `${d.day}, ${d.date}` },
                    { label: 'Event Time', value: d.time },
                    { label: 'Venue', value: d.venue },
                    { label: 'Reporting Time', value: d.reportingTime },
                    { label: 'Coordinator', value: d.coordinator },
                  ].map(item => (
                    <div key={item.label} style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '10px', padding: '12px' }}>
                      <p style={{ color: '#64748b', fontSize: '11px', marginBottom: '2px' }}>{item.label}</p>
                      <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700' }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Key Features */}
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Key Features:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {d.keyFeatures.map(f => (
                      <span key={f} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '20px', fontSize: '12px', padding: '4px 12px' }}>{f}</span>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px' }}>
                  <p style={{ color: '#a16207', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>📌 Special Instructions:</p>
                  <p style={{ color: '#a16207', fontSize: '12px' }}>{d.instructions}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '18px' }}>🏆 Volunteer History</h2>
            {assignedDuties.filter(d => d.status === 'Completed').map(d => (
              <div key={d.id} style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>{d.event}</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ background: '#dcfce7', color: '#16a34a', borderRadius: '6px', fontSize: '11px', padding: '3px 10px', fontWeight: '600' }}>✅ Completed</span>
                      <span style={{ background: (dutyColors[d.duty] || '#1a3a6b') + '15', color: dutyColors[d.duty] || '#1a3a6b', borderRadius: '6px', fontSize: '11px', padding: '3px 10px', fontWeight: '600' }}>{d.duty}</span>
                    </div>
                  </div>
                  <button style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                    📜 Download Certificate
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {[
                    { label: 'Date', value: `${d.day}, ${d.date}` },
                    { label: 'Venue', value: d.venue },
                    { label: 'Organized By', value: d.organizedBy },
                  ].map(item => (
                    <div key={item.label} style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '8px', padding: '10px 12px' }}>
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

      <footer style={{ background: '#1a3a6b', color: '#93c5fd', textAlign: 'center', padding: '20px', fontSize: '13px', marginTop: '40px' }}>
        © 2025 CampusEvents · Vishwakarma Institute of Technology, Pune
      </footer>
    </div>
  )
}