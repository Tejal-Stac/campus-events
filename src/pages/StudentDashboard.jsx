import { Link } from 'react-router-dom'

const student = {
  name: 'Tejal Jadhav',
  branch: 'BTech-Computer Engineering',
  year: '3rd Year',
  avatar: 'TJ',
  rollNo: 'VIT2023CSE045',
  eventsAttended: 12,
  certificates: 8,
  skillsGained: 15,
  points: 1240,
}

const upcomingEvents = [
  { id: 1, title: 'National Hackathon 2025', date: 'Mar 15, 2025', category: 'Hackathon', status: 'Registered' },
  { id: 2, title: 'Tech Talk: AI & Future', date: 'Apr 2, 2025', category: 'Seminar', status: 'Registered' },
  { id: 3, title: 'Photography Workshop', date: 'Apr 18, 2025', category: 'Workshop', status: 'Waitlisted' },
]

const pastEvents = [
  { id: 1, title: 'CodeSprint 2024', date: 'Nov 10, 2024', role: 'Participant', skills: ['Problem Solving', 'C++'], cert: true },
  { id: 2, title: 'Cultural Fest 2024', date: 'Oct 5, 2024', role: 'Volunteer', skills: ['Leadership', 'Coordination'], cert: true },
  { id: 3, title: 'ML Workshop', date: 'Sep 20, 2024', role: 'Participant', skills: ['Python', 'Machine Learning'], cert: true },
]

const aiSuggestions = [
  { title: 'Robotics Competition', match: '94%', reason: 'Based on your tech event history' },
  { title: 'Industry Connect – CSE', match: '88%', reason: 'Matches your branch & year' },
  { title: 'Finance & Startup Summit', match: '76%', reason: 'Similar seminars attended' },
]

const skills = ['Python', 'Machine Learning', 'C++', 'Problem Solving', 'Leadership', 'Coordination', 'Teamwork', 'Public Speaking']

export default function StudentDashboard() {
  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* Top Navbar - VIT Style */}
      <div style={{ background: '#1a3a6b', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px', position: 'fixed', top: 0, width: '100%', zIndex: 100, boxSizing: 'border-box' }}>
        <div className="flex items-center gap-3">
          <div style={{ background: '#fff', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#1a3a6b', fontSize: '13px' }}>CE</div>
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>CampusEvents</span>
          <span style={{ color: '#93c5fd', fontSize: '13px' }}>· Vishwakarma Institute of Technology, Pune</span>
        </div>
        <div className="flex items-center gap-3">
          <span style={{ color: '#93c5fd', fontSize: '13px' }}>🔔</span>
          <div style={{ background: '#2563eb', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '13px' }}>TJ</div>
        </div>
      </div>

      {/* Student Info Bar - VIT Style */}
      <div style={{ background: '#fff', borderBottom: '1px solid #dbeafe', padding: '10px 24px', marginTop: '56px', display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
        <div className="flex items-center gap-3">
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#1a3a6b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '16px' }}>TJ</div>
          <div>
            <p style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '15px' }}>{student.name}</p>
            <div className="flex items-center gap-2">
              <span style={{ background: '#dcfce7', color: '#16a34a', borderRadius: '20px', fontSize: '11px', padding: '2px 10px', fontWeight: '600' }}>● Active</span>
            </div>
          </div>
        </div>
        <div style={{ color: '#64748b', fontSize: '13px' }}>Registration No: <strong style={{ color: '#1a3a6b' }}>{student.rollNo}</strong></div>
        <div style={{ color: '#64748b', fontSize: '13px' }}>Programme: <strong style={{ color: '#1a3a6b' }}>{student.branch}</strong></div>
        <div style={{ color: '#64748b', fontSize: '13px' }}>Year: <strong style={{ color: '#1a3a6b' }}>{student.year}</strong></div>
      </div>

      {/* Breadcrumb */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '8px 24px' }}>
        <p style={{ color: '#64748b', fontSize: '13px' }}>🏠 Home / <span style={{ color: '#1a3a6b', fontWeight: '600' }}>Dashboard</span></p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Events Attended', value: student.eventsAttended, icon: '🎯', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
            { label: 'Certificates', value: student.certificates, icon: '📜', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
            { label: 'Skills Gained', value: student.skillsGained, icon: '💡', bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
            { label: 'Points Earned', value: student.points, icon: '⭐', bg: '#fdf4ff', color: '#7e22ce', border: '#e9d5ff' },
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
              <div className="flex flex-col gap-3">
                {upcomingEvents.map(e => (
                  <div key={e.id} style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '10px', padding: '14px' }} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div style={{ background: '#dbeafe', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🎫</div>
                      <div>
                        <p style={{ color: '#1a3a6b', fontSize: '14px', fontWeight: '600' }}>{e.title}</p>
                        <p style={{ color: '#64748b', fontSize: '12px' }}>{e.date} · {e.category}</p>
                      </div>
                    </div>
                    <span style={{ background: e.status === 'Registered' ? '#dcfce7' : '#fef9c3', color: e.status === 'Registered' ? '#16a34a' : '#a16207', borderRadius: '6px', fontSize: '11px', padding: '3px 10px', fontWeight: '600' }}>
                      {e.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Participation History */}
            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '16px', marginBottom: '16px' }}>🏆 Participation History</h2>
              <div className="flex flex-col gap-3">
                {pastEvents.map(e => (
                  <div key={e.id} style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '10px', padding: '14px' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p style={{ color: '#1a3a6b', fontSize: '14px', fontWeight: '600' }}>{e.title}</p>
                        <p style={{ color: '#64748b', fontSize: '12px' }}>{e.date} · Role: <span style={{ color: '#2563eb', fontWeight: '600' }}>{e.role}</span></p>
                      </div>
                      {e.cert && (
                        <button style={{ background: '#dcfce7', color: '#15803d', border: 'none', borderRadius: '8px', fontSize: '11px', padding: '5px 12px', cursor: 'pointer', fontWeight: '600' }}>
                          📜 Download
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {e.skills.map(s => (
                        <span key={s} style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: '6px', fontSize: '11px', padding: '2px 8px', border: '1px solid #bfdbfe' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
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