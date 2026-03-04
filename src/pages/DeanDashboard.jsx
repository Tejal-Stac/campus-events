import { useState } from 'react'
import { Link } from 'react-router-dom'

const pendingEvents = [
  {
    id: 1,
    title: 'National Hackathon 2025',
    faculty: 'Dr. Rajesh Sharma',
    dept: 'Computer Engineering',
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
    seats: 120,
    fees: 'Free',
    contact: '9876543210',
    category: 'Hackathon',
    keyFeatures: ['24 Hour Coding', 'Cash Prizes', 'Industry Mentors'],
    status: 'Pending'
  },
  {
    id: 2,
    title: 'Finance Summit 2025',
    faculty: 'Prof. Sunita Kulkarni',
    dept: 'MBA',
    organisingClub: 'MBA Department',
    saVertical: 'Entrepreneurship',
    date: 'May 10, 2025',
    day: 'Saturday',
    timeFrom: '10:00 AM',
    timeTo: '2:00 PM',
    venue: 'Seminar Hall B',
    onlineLink: 'meet.google.com/fin-2025',
    targetAudience: 'MBA, CSE - All Years',
    expectedCount: 200,
    seats: 200,
    fees: 'Free',
    contact: '9876543211',
    category: 'Seminar',
    keyFeatures: ['Industry Speakers', 'Networking', 'Certificate'],
    status: 'Pending'
  },
  {
    id: 3,
    title: 'Robotics Competition',
    faculty: 'Prof. Anil Joshi',
    dept: 'Mechanical',
    organisingClub: 'Robotics Club',
    saVertical: 'Technical',
    date: 'May 3, 2025',
    day: 'Saturday',
    timeFrom: '9:00 AM',
    timeTo: '5:00 PM',
    venue: 'Workshop Area',
    onlineLink: '',
    targetAudience: 'MECH, ENTC - 2nd, 3rd Year',
    expectedCount: 80,
    seats: 60,
    fees: '₹200',
    contact: '9876543212',
    category: 'Hackathon',
    keyFeatures: ['Bot Building', 'Competition', 'Prizes'],
    status: 'Pending'
  },
]

const allUsers = [
  { id: 1, firstName: 'Tejal', lastName: 'Jadhav', email: 'tejal.jadhav23@vit.edu', role: 'Student', dept: 'Computer Engineering', division: 'A', year: '3rd', gr: 'VIT2023CSE045', campus: 'Kondhwa', status: 'Active', assignedRole: null },
  { id: 2, firstName: 'Rahul', lastName: 'Sharma', email: 'rahul.sharma23@vit.edu', role: 'Student', dept: 'Computer Engineering', division: 'B', year: '3rd', gr: 'VIT2023CSE032', campus: 'Kondhwa', status: 'Active', assignedRole: 'Volunteer' },
  { id: 3, firstName: 'Priya', lastName: 'Mehta', email: 'priya.mehta23@vit.edu', role: 'Student', dept: 'IT', division: 'A', year: '2nd', gr: 'VIT2023IT021', campus: 'Bibwewadi', status: 'Active', assignedRole: null },
  { id: 4, firstName: 'Aman', lastName: 'Verma', email: 'aman.verma23@vit.edu', role: 'Student', dept: 'Mechanical', division: 'C', year: '3rd', gr: 'VIT2023MECH014', campus: 'Kondhwa', status: 'Active', assignedRole: 'Coordinator' },
  { id: 5, firstName: 'Sneha', lastName: 'Patil', email: 'sneha.patil23@vit.edu', role: 'Student', dept: 'ENTC', division: 'A', year: '2nd', gr: 'VIT2023ENTC009', campus: 'Bibwewadi', status: 'Active', assignedRole: null },
  { id: 6, firstName: 'Rajesh', lastName: 'Sharma', email: 'rajesh.sharma@vit.edu', role: 'Faculty', dept: 'Computer Engineering', designation: 'Asst. Professor', campus: 'Kondhwa', status: 'Active', assignedRole: null },
  { id: 7, firstName: 'Sunita', lastName: 'Kulkarni', email: 'sunita.kulkarni@vit.edu', role: 'Faculty', dept: 'MBA', designation: 'Professor', campus: 'Bibwewadi', status: 'Active', assignedRole: null },
  { id: 8, firstName: 'Anil', lastName: 'Joshi', email: 'anil.joshi@vit.edu', role: 'Faculty', dept: 'Mechanical', designation: 'Asst. Professor', campus: 'Kondhwa', status: 'Active', assignedRole: null },
]

const allEvents = [
  { id: 1, title: 'National Hackathon 2025', date: 'March 15, 2025', day: 'Saturday', timeFrom: '9:00 AM', timeTo: '9:00 PM', venue: 'Main Auditorium', organisingClub: 'CSE Department', saVertical: 'Technical', targetAudience: 'All Branches - 2nd, 3rd Year', expectedCount: 150, fees: 'Free', contact: '9876543210', category: 'Hackathon', registered: 89, seats: 120, status: 'Active', keyFeatures: ['24 Hour Coding', 'Cash Prizes', 'Industry Mentors'] },
  { id: 2, title: 'Tech Talk: AI & Future', date: 'April 2, 2025', day: 'Wednesday', timeFrom: '11:00 AM', timeTo: '1:00 PM', venue: 'Seminar Hall A', organisingClub: 'CSE Department', saVertical: 'Technical', targetAudience: 'CSE, IT - All Years', expectedCount: 100, fees: 'Free', contact: '9876543211', category: 'Seminar', registered: 67, seats: 80, status: 'Active', keyFeatures: ['Industry Experts', 'Q&A Session', 'Certificate'] },
  { id: 3, title: 'CodeSprint 2024', date: 'November 10, 2024', day: 'Sunday', timeFrom: '10:00 AM', timeTo: '4:00 PM', venue: 'Lab Block 3', organisingClub: 'CSE Department', saVertical: 'Technical', targetAudience: 'All Branches - 3rd, 4th Year', expectedCount: 120, fees: '₹100', contact: '9876543212', category: 'Hackathon', registered: 120, seats: 120, status: 'Completed', keyFeatures: ['Competitive Coding', 'Prizes', 'Certificate'] },
]

const duties = ['Registration Desk', 'Stage Management', 'Food & Logistics', 'Judging Coordination', 'Photography', 'Security', 'Guest Handling']

export default function DeanDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState(allUsers)
  const [events, setEvents] = useState(pendingEvents)
  const [userFilter, setUserFilter] = useState('All')
  const [campusFilter, setCampusFilter] = useState('All')
  const [assignModal, setAssignModal] = useState(null)
  const [assignRole, setAssignRole] = useState('Coordinator')
  const [assignDuty, setAssignDuty] = useState(duties[0])
  const [assignEvent, setAssignEvent] = useState(allEvents[0].title)

  const approveEvent = (id) => setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'Approved' } : e))
  const rejectEvent = (id) => setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'Rejected' } : e))

  const handleAssign = () => {
    setUsers(prev => prev.map(u => u.id === assignModal.id ? { ...u, assignedRole: assignRole } : u))
    setAssignModal(null)
    alert(`${assignModal.firstName} ${assignModal.lastName} assigned as ${assignRole} for ${assignEvent}!`)
  }

  const removeRole = (id) => setUsers(prev => prev.map(u => u.id === id ? { ...u, assignedRole: null } : u))

  const filteredUsers = users.filter(u => {
    const matchRole = userFilter === 'All' || u.role === userFilter
    const matchCampus = campusFilter === 'All' || u.campus === campusFilter
    return matchRole && matchCampus
  })

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'approvals', label: `📋 Approvals ${events.filter(e => e.status === 'Pending').length > 0 ? `(${events.filter(e => e.status === 'Pending').length})` : ''}` },
    { id: 'users', label: '👥 Manage Users' },
    { id: 'assign', label: '🎯 Assign Roles' },
    { id: 'reports', label: '📈 Reports' },
  ]

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* Assign Role Modal */}
      {assignModal && (
        <div onClick={() => setAssignModal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(26,58,107,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '20px', padding: '32px', maxWidth: '460px', width: '100%', boxShadow: '0 24px 64px rgba(26,58,107,0.2)' }}>
            <h2 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '18px', marginBottom: '4px' }}>🎯 Assign Role</h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Assigning role to: <strong style={{ color: '#1a3a6b' }}>{assignModal.firstName} {assignModal.lastName}</strong></p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Select Role *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {['Coordinator', 'Volunteer'].map(r => (
                    <button key={r} onClick={() => setAssignRole(r)}
                      style={{
                        padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                        background: assignRole === r ? '#1a3a6b' : '#f0f4ff',
                        color: assignRole === r ? '#fff' : '#64748b',
                        border: `2px solid ${assignRole === r ? '#1a3a6b' : '#dbeafe'}`
                      }}>
                      {r === 'Coordinator' ? '🎯 Coordinator' : '🙋 Volunteer'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Assign to Event *</label>
                <select style={{ background: '#f8faff', border: '1px solid #cbd5e1', color: '#1a3a6b', borderRadius: '10px', width: '100%', padding: '11px 14px', fontSize: '13px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                  value={assignEvent} onChange={e => setAssignEvent(e.target.value)}>
                  {allEvents.map(e => <option key={e.id}>{e.title}</option>)}
                </select>
              </div>

              {assignRole === 'Volunteer' && (
                <div>
                  <label style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Assign Duty *</label>
                  <select style={{ background: '#f8faff', border: '1px solid #cbd5e1', color: '#1a3a6b', borderRadius: '10px', width: '100%', padding: '11px 14px', fontSize: '13px', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                    value={assignDuty} onChange={e => setAssignDuty(e.target.value)}>
                    {duties.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              )}

              <div style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '10px', padding: '12px' }}>
                <p style={{ color: '#1a3a6b', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>📋 Assignment Summary</p>
                <p style={{ color: '#64748b', fontSize: '12px' }}>👤 {assignModal.firstName} {assignModal.lastName} ({assignModal.role})</p>
                <p style={{ color: '#64748b', fontSize: '12px' }}>🎯 Role: {assignRole}</p>
                <p style={{ color: '#64748b', fontSize: '12px' }}>📅 Event: {assignEvent}</p>
                {assignRole === 'Volunteer' && <p style={{ color: '#64748b', fontSize: '12px' }}>🔧 Duty: {assignDuty}</p>}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setAssignModal(null)}
                  style={{ flex: 1, background: '#f0f4ff', color: '#1a3a6b', border: '1px solid #dbeafe', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleAssign}
                  style={{ flex: 2, background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                  ✅ Confirm Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          <div style={{ background: '#2563eb', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '13px' }}>DN</div>
        </div>
      </div>

      {/* Dean Info Bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #dbeafe', padding: '10px 24px', marginTop: '56px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#1a3a6b', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '16px' }}>DN</div>
          <div>
            <p style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '15px' }}>Dr. A. Mehta</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#fef2f2', color: '#dc2626', borderRadius: '20px', fontSize: '11px', padding: '2px 10px', fontWeight: '600' }}>👑 Dean</span>
              <span style={{ color: '#64748b', fontSize: '12px' }}>Full System Access</span>
            </div>
          </div>
        </div>
        <div style={{ color: '#64748b', fontSize: '13px' }}>VIT Pune · <strong style={{ color: '#1a3a6b' }}>Both Campuses</strong></div>
        <div style={{ color: '#64748b', fontSize: '13px' }}>Email: <strong style={{ color: '#1a3a6b' }}>dean@vit.edu</strong></div>
      </div>

      {/* Breadcrumb */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '8px 24px' }}>
        <p style={{ color: '#64748b', fontSize: '13px' }}>🏠 Home / <span style={{ color: '#1a3a6b', fontWeight: '600' }}>Dean Dashboard</span></p>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '24px' }}>
          {[
            { label: 'Total Students', value: users.filter(u => u.role === 'Student').length, icon: '🎓', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
            { label: 'Total Faculty', value: users.filter(u => u.role === 'Faculty').length, icon: '👨‍🏫', color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
            { label: 'Coordinators', value: users.filter(u => u.assignedRole === 'Coordinator').length, icon: '🎯', color: '#7c3aed', bg: '#fdf4ff', border: '#e9d5ff' },
            { label: 'Volunteers', value: users.filter(u => u.assignedRole === 'Volunteer').length, icon: '🙋', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
            { label: 'Pending Approvals', value: events.filter(e => e.status === 'Pending').length, icon: '⏳', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '16px', textAlign: 'center', padding: '18px' }}>
              <div style={{ fontSize: '22px', marginBottom: '4px' }}>{s.icon}</div>
              <div style={{ color: s.color, fontSize: '24px', fontWeight: '800' }}>{s.value}</div>
              <div style={{ color: '#64748b', fontSize: '11px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '4px', display: 'inline-flex', gap: '4px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', border: 'none', cursor: 'pointer',
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
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>⏳ Pending Event Approvals</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {events.filter(e => e.status === 'Pending').length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                    <p>All caught up! No pending approvals.</p>
                  </div>
                ) : events.filter(e => e.status === 'Pending').map(e => (
                  <div key={e.id} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div>
                        <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700' }}>{e.title}</p>
                        <p style={{ color: '#64748b', fontSize: '11px' }}>{e.faculty} · {e.organisingClub}</p>
                        <p style={{ color: '#64748b', fontSize: '11px' }}>📅 {e.day}, {e.date} · ⏰ {e.timeFrom} - {e.timeTo}</p>
                        <p style={{ color: '#64748b', fontSize: '11px' }}>📍 {e.venue} · 👥 {e.targetAudience}</p>
                      </div>
                      <span style={{ background: '#fef9c3', color: '#a16207', borderRadius: '6px', fontSize: '11px', padding: '2px 8px', fontWeight: '600', height: 'fit-content' }}>{e.category}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
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

            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>📊 Platform Overview</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Total Registered Users', value: users.length },
                  { label: 'Kondhwa Campus Users', value: users.filter(u => u.campus === 'Kondhwa').length },
                  { label: 'Bibwewadi Campus Users', value: users.filter(u => u.campus === 'Bibwewadi').length },
                  { label: 'Active Events', value: allEvents.filter(e => e.status === 'Active').length },
                  { label: 'Completed Events', value: allEvents.filter(e => e.status === 'Completed').length },
                ].map((s, i) => (
                  <div key={s.label} style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '10px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>{s.label}</span>
                    <span style={{ color: '#1a3a6b', fontSize: '18px', fontWeight: '800' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '18px' }}>📋 Event Approval Requests</h2>
            {events.map(e => (
              <div key={e.id} style={{ background: '#fff', border: `1px solid ${e.status === 'Approved' ? '#bbf7d0' : e.status === 'Rejected' ? '#fecaca' : '#dbeafe'}`, borderRadius: '16px', padding: '24px' }}>

                {/* Header */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: '6px', fontSize: '12px', padding: '3px 10px', fontWeight: '600' }}>{e.category}</span>
                      <span style={{
                        background: e.status === 'Approved' ? '#dcfce7' : e.status === 'Rejected' ? '#fef2f2' : '#fef9c3',
                        color: e.status === 'Approved' ? '#16a34a' : e.status === 'Rejected' ? '#dc2626' : '#a16207',
                        borderRadius: '6px', fontSize: '11px', padding: '3px 8px', fontWeight: '600'
                      }}>
                        {e.status === 'Approved' ? '✅ Approved' : e.status === 'Rejected' ? '❌ Rejected' : '⏳ Pending'}
                      </span>
                    </div>
                    <h3 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '18px' }}>{e.title}</h3>
                  </div>
                  {e.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => approveEvent(e.id)}
                        style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                        ✅ Approve
                      </button>
                      <button onClick={() => rejectEvent(e.id)}
                        style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </div>

                {/* All Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                  {[
                    { label: 'Submitted By', value: e.faculty },
                    { label: 'Organising Club/Dept', value: e.organisingClub },
                    { label: 'SA Vertical', value: e.saVertical },
                    { label: 'Date & Day', value: `${e.day}, ${e.date}` },
                    { label: 'Time', value: `${e.timeFrom} to ${e.timeTo}` },
                    { label: 'Venue', value: e.venue },
                    { label: 'Target Audience', value: e.targetAudience },
                    { label: 'Expected Count', value: e.expectedCount },
                    { label: 'Total Seats', value: e.seats },
                    { label: 'Fees', value: e.fees },
                    { label: 'Contact No', value: e.contact },
                    e.onlineLink ? { label: 'Online Link', value: e.onlineLink } : null,
                  ].filter(Boolean).map(item => (
                    <div key={item.label} style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '10px', padding: '10px 14px' }}>
                      <p style={{ color: '#64748b', fontSize: '11px', marginBottom: '2px' }}>{item.label}</p>
                      <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700' }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Key Features */}
                <div>
                  <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Key Features:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {e.keyFeatures.map(f => (
                      <span key={f} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '20px', fontSize: '11px', padding: '3px 10px' }}>{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Manage Users Tab */}
        {activeTab === 'users' && (
          <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700' }}>👥 All Registered Users</h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['All', 'Student', 'Faculty'].map(f => (
                  <button key={f} onClick={() => setUserFilter(f)}
                    style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', background: userFilter === f ? '#1a3a6b' : '#f0f4ff', color: userFilter === f ? '#fff' : '#64748b', border: `1px solid ${userFilter === f ? '#1a3a6b' : '#dbeafe'}`, fontWeight: userFilter === f ? '600' : '400' }}>
                    {f}
                  </button>
                ))}
                {['All', 'Kondhwa', 'Bibwewadi'].map(c => (
                  <button key={c} onClick={() => setCampusFilter(c)}
                    style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', background: campusFilter === c ? '#2563eb' : '#f0f4ff', color: campusFilter === c ? '#fff' : '#64748b', border: `1px solid ${campusFilter === c ? '#2563eb' : '#dbeafe'}`, fontWeight: campusFilter === c ? '600' : '400' }}>
                    {c === 'All' ? '🏫 All Campuses' : c}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8faff', borderBottom: '2px solid #dbeafe' }}>
                    {['User', 'Role', 'Department', 'Campus', 'GR / Designation', 'Assigned Role', 'Action'].map(h => (
                      <th key={h} style={{ color: '#1a3a6b', fontSize: '12px', fontWeight: '700', padding: '12px', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #dbeafe' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ background: '#dbeafe', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a3a6b', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
                            {u.firstName[0]}{u.lastName[0]}
                          </div>
                          <div>
                            <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700' }}>{u.firstName} {u.lastName}</p>
                            <p style={{ color: '#64748b', fontSize: '11px' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: u.role === 'Faculty' ? '#f0fdf4' : '#eff6ff', color: u.role === 'Faculty' ? '#15803d' : '#1d4ed8', borderRadius: '6px', fontSize: '11px', padding: '3px 8px', fontWeight: '600' }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>{u.dept}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: u.campus === 'Kondhwa' ? '#eff6ff' : '#fdf4ff', color: u.campus === 'Kondhwa' ? '#1d4ed8' : '#7c3aed', borderRadius: '6px', fontSize: '11px', padding: '3px 8px', fontWeight: '600' }}>{u.campus}</span>
                      </td>
                      <td style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>{u.gr || u.designation || '-'}</td>
                      <td style={{ padding: '12px' }}>
                        {u.assignedRole ? (
                          <span style={{ background: u.assignedRole === 'Coordinator' ? '#fdf4ff' : '#fffbeb', color: u.assignedRole === 'Coordinator' ? '#7c3aed' : '#d97706', borderRadius: '6px', fontSize: '11px', padding: '3px 8px', fontWeight: '600' }}>
                            {u.assignedRole === 'Coordinator' ? '🎯' : '🙋'} {u.assignedRole}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => setAssignModal(u)}
                            style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                            🎯 Assign
                          </button>
                          {u.assignedRole && (
                            <button onClick={() => removeRole(u.id)}
                              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                              Remove
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Assign Roles Tab */}
        {activeTab === 'assign' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>🎯 Current Coordinators</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {users.filter(u => u.assignedRole === 'Coordinator').length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No coordinators assigned yet.</p>
                ) : users.filter(u => u.assignedRole === 'Coordinator').map(u => (
                  <div key={u.id} style={{ background: '#fdf4ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ background: '#7c3aed', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: '700' }}>
                        {u.firstName[0]}{u.lastName[0]}
                      </div>
                      <div>
                        <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700' }}>{u.firstName} {u.lastName}</p>
                        <p style={{ color: '#64748b', fontSize: '11px' }}>{u.dept} · {u.campus}</p>
                      </div>
                    </div>
                    <button onClick={() => removeRole(u.id)}
                      style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>🙋 Current Volunteers</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {users.filter(u => u.assignedRole === 'Volunteer').length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No volunteers assigned yet.</p>
                ) : users.filter(u => u.assignedRole === 'Volunteer').map(u => (
                  <div key={u.id} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ background: '#d97706', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: '700' }}>
                        {u.firstName[0]}{u.lastName[0]}
                      </div>
                      <div>
                        <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700' }}>{u.firstName} {u.lastName}</p>
                        <p style={{ color: '#64748b', fontSize: '11px' }}>{u.dept} · {u.campus}</p>
                      </div>
                    </div>
                    <button onClick={() => removeRole(u.id)}
                      style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '18px' }}>📈 Event Reports</h2>
            {allEvents.map(e => {
              const pct = Math.round((e.registered / e.seats) * 100)
              return (
                <div key={e.id} style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>{e.title}</h3>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: '6px', fontSize: '11px', padding: '3px 8px', fontWeight: '600' }}>{e.category}</span>
                        <span style={{ background: e.status === 'Active' ? '#dcfce7' : '#f1f5f9', color: e.status === 'Active' ? '#16a34a' : '#64748b', borderRadius: '6px', fontSize: '11px', padding: '3px 8px', fontWeight: '600' }}>{e.status}</span>
                      </div>
                    </div>
                    <button style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                      ⬇️ Download Report
                    </button>
                  </div>

                  {/* All Report Fields */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
                    {[
                      { label: 'Organising Club/Dept', value: e.organisingClub },
                      { label: 'SA Vertical', value: e.saVertical },
                      { label: 'Date & Day', value: `${e.day}, ${e.date}` },
                      { label: 'Time', value: `${e.timeFrom} to ${e.timeTo}` },
                      { label: 'Venue', value: e.venue },
                      { label: 'Target Audience', value: e.targetAudience },
                      { label: 'Expected Count', value: e.expectedCount },
                      { label: 'Registered', value: e.registered },
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
                  <div style={{ marginBottom: '14px' }}>
                    <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Key Features:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {e.keyFeatures.map(f => (
                        <span key={f} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '20px', fontSize: '12px', padding: '4px 12px' }}>{f}</span>
                      ))}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b', fontSize: '12px' }}>Registration: {pct}% filled</span>
                    <span style={{ color: pct > 80 ? '#dc2626' : '#16a34a', fontSize: '12px', fontWeight: '600' }}>{e.registered}/{e.seats}</span>
                  </div>
                  <div style={{ background: '#dbeafe', borderRadius: '4px', height: '8px' }}>
                    <div style={{ width: `${pct}%`, background: pct > 80 ? '#dc2626' : '#1a3a6b', borderRadius: '4px', height: '8px' }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>

      <footer style={{ background: '#1a3a6b', color: '#93c5fd', textAlign: 'center', padding: '20px', fontSize: '13px', marginTop: '40px' }}>
        © 2025 CampusEvents · Vishwakarma Institute of Technology, Pune
      </footer>
    </div>
  )
}