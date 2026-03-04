import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const upcomingEvents = [
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
    seats: 120,
    registered: 89,
    fees: 'Free',
    contact: '9876543210',
    category: 'Hackathon',
    saVertical: 'Technical',
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
    seats: 80,
    registered: 67,
    fees: 'Free',
    contact: '9876543211',
    category: 'Seminar',
    keyFeatures: ['Industry Experts', 'Q&A Session', 'Certificate'],
  },
  {
    id: 3,
    title: 'Cultural Fest 2025',
    organisingClub: 'Cultural Club',
    saVertical: 'Cultural',
    date: 'April 20, 2025',
    day: 'Sunday',
    timeFrom: '10:00 AM',
    timeTo: '8:00 PM',
    venue: 'Open Air Theatre',
    onlineLink: '',
    targetAudience: 'All Branches - All Years',
    expectedCount: 500,
    seats: 400,
    registered: 310,
    fees: '₹50',
    contact: '9876543213',
    category: 'Cultural',
    keyFeatures: ['Dance', 'Music', 'Drama', 'Food Stalls'],
  },
  {
    id: 4,
    title: 'ML Workshop',
    organisingClub: 'AI/ML Club',
    saVertical: 'Technical',
    date: 'May 5, 2025',
    day: 'Monday',
    timeFrom: '2:00 PM',
    timeTo: '5:00 PM',
    venue: 'Lab Block 2',
    onlineLink: 'meet.google.com/ml-ws',
    targetAudience: 'CSE, IT - 2nd, 3rd Year',
    expectedCount: 60,
    seats: 50,
    registered: 48,
    fees: 'Free',
    contact: '9876543214',
    category: 'Workshop',
    keyFeatures: ['Hands-on', 'Certificate', 'Project'],
  },
  {
    id: 5,
    title: 'Sports Day 2025',
    organisingClub: 'Sports Committee',
    saVertical: 'Sports',
    date: 'May 12, 2025',
    day: 'Monday',
    timeFrom: '8:00 AM',
    timeTo: '6:00 PM',
    venue: 'Sports Ground',
    onlineLink: '',
    targetAudience: 'All Branches - All Years',
    expectedCount: 300,
    seats: 300,
    registered: 180,
    fees: 'Free',
    contact: '9876543215',
    category: 'Sports',
    keyFeatures: ['Cricket', 'Football', 'Athletics', 'Prizes'],
  },
  {
    id: 6,
    title: 'Robotics Competition',
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
    registered: 42,
    fees: '₹200',
    contact: '9876543216',
    category: 'Hackathon',
    keyFeatures: ['Bot Building', 'Competition', 'Prizes'],
  },
]

const stats = [
  { label: 'Total Events', value: '200+', icon: '📅' },
  { label: 'Registered Students', value: '5,200+', icon: '🎓' },
  { label: 'Faculty Members', value: '120+', icon: '👨‍🏫' },
  { label: 'Certificates Issued', value: '3,000+', icon: '📜' },
]

const features = [
  { icon: '🎯', title: 'Role Based Access', desc: 'Separate dashboards for Student, Faculty, Coordinator, Volunteer and Dean' },
  { icon: '📋', title: 'Event Management', desc: 'Faculty create events, Dean approves, students register — all in one place' },
  { icon: '👑', title: 'Dean Control', desc: 'Dean assigns Coordinators and Volunteers from registered users' },
  { icon: '📜', title: 'Certificates', desc: 'Auto-generate and download participation certificates for every event' },
  { icon: '📊', title: 'Reports', desc: 'Complete event reports with registered student list for every event' },
  { icon: '🤝', title: 'Team Building', desc: 'Find teammates for hackathons based on skills and interests' },
]

export default function Home() {
  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />

      {/* Hero Section */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a6b 0%, #2563eb 100%)', paddingTop: '56px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '20px', display: 'inline-block', padding: '6px 18px', marginBottom: '20px' }}>
            <span style={{ color: '#bfdbfe', fontSize: '13px', fontWeight: '600' }}>🏫 Vishwakarma Institute of Technology, Pune</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: '42px', fontWeight: '800', marginBottom: '16px', lineHeight: 1.2 }}>
            Centralized Campus<br />
            <span style={{ color: '#93c5fd' }}>Event Planning System</span>
          </h1>
          <p style={{ color: '#bfdbfe', fontSize: '16px', marginBottom: '32px', maxWidth: '560px', margin: '0 auto 32px' }}>
            One platform for Students, Faculty, Coordinators, Volunteers and Dean to manage all campus events seamlessly.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ background: '#fff', color: '#1a3a6b', borderRadius: '12px', padding: '13px 28px', fontWeight: '700', fontSize: '15px', textDecoration: 'none' }}>
              🎓 Register Now
            </Link>
            <Link to="/events" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: '12px', padding: '13px 28px', fontWeight: '700', fontSize: '15px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}>
              📅 Browse Events
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', paddingBottom: '32px' }}>
            {stats.map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ fontSize: '28px', marginBottom: '6px' }}>{s.icon}</div>
                <div style={{ color: '#fff', fontSize: '24px', fontWeight: '800' }}>{s.value}</div>
                <div style={{ color: '#bfdbfe', fontSize: '12px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Upcoming Events Section */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ color: '#1a3a6b', fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>📅 Upcoming Events</h2>
              <p style={{ color: '#64748b', fontSize: '13px' }}>Register before seats fill up!</p>
            </div>
            <Link to="/events" style={{ background: '#1a3a6b', color: '#fff', borderRadius: '10px', padding: '8px 18px', fontWeight: '600', fontSize: '13px', textDecoration: 'none' }}>
              View All →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {upcomingEvents.map(event => {
              const pct = Math.round((event.registered / event.seats) * 100)
              return (
                <div key={event.id}
                  style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', overflow: 'hidden', transition: 'all 0.2s', cursor: 'pointer' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#1a3a6b'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,58,107,0.10)' }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#dbeafe'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>

                  {/* Banner */}
                  <div style={{ background: 'linear-gradient(135deg, #1a3a6b, #2563eb)', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px', fontSize: '11px', padding: '3px 10px', fontWeight: '600' }}>{event.category}</span>
                    <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: '6px', fontSize: '11px', padding: '3px 10px', fontWeight: '600' }}>📌 {event.saVertical}</span>
                  </div>

                  <div style={{ padding: '16px' }}>
                    <h3 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '15px', marginBottom: '12px' }}>{event.title}</h3>

                    {/* Event Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' }}>
                      {[
                        { icon: '🏢', label: 'Organised by', value: event.organisingClub },
                        { icon: '📅', label: 'Date & Day', value: `${event.day}, ${event.date}` },
                        { icon: '⏰', label: 'Time', value: `${event.timeFrom} to ${event.timeTo}` },
                        { icon: '📍', label: 'Venue', value: event.venue },
                        event.onlineLink ? { icon: '🔗', label: 'Online Link', value: event.onlineLink, isLink: true } : null,
                        { icon: '🎯', label: 'Audience', value: event.targetAudience },
                        { icon: '💰', label: 'Fees', value: event.fees, isFees: true },
                        { icon: '📞', label: 'Contact', value: event.contact },
                      ].filter(Boolean).map(item => (
                        <div key={item.label} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '11px', flexShrink: 0, marginTop: '1px' }}>{item.icon}</span>
                          <span style={{ color: '#64748b', fontSize: '11px', flexShrink: 0 }}>{item.label}:</span>
                          <span style={{
                            fontSize: '11px', fontWeight: '600',
                            color: item.isFees ? (item.value === 'Free' ? '#16a34a' : '#dc2626') : item.isLink ? '#2563eb' : '#1a3a6b'
                          }}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Key Features */}
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ color: '#1a3a6b', fontSize: '11px', fontWeight: '700', marginBottom: '5px' }}>Key Features:</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {event.keyFeatures.map(f => (
                          <span key={f} style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '20px', fontSize: '10px', padding: '2px 8px' }}>{f}</span>
                        ))}
                      </div>
                    </div>

                    {/* Progress */}
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: '#64748b', fontSize: '11px' }}>{event.registered}/{event.seats} registered</span>
                        <span style={{ color: pct > 80 ? '#dc2626' : '#16a34a', fontSize: '11px', fontWeight: '600' }}>{pct}%</span>
                      </div>
                      <div style={{ background: '#dbeafe', borderRadius: '4px', height: '6px' }}>
                        <div style={{ width: `${pct}%`, background: pct > 80 ? '#dc2626' : '#1a3a6b', borderRadius: '4px', height: '6px' }} />
                      </div>
                    </div>

                    {/* Register Button */}
                    <Link to="/register"
                      style={{ display: 'block', width: '100%', background: pct >= 100 ? '#94a3b8' : '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: '700', cursor: pct >= 100 ? 'not-allowed' : 'pointer', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
                      {pct >= 100 ? '❌ Fully Booked' : '✅ Register Now'}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Features Section */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ color: '#1a3a6b', fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>⚡ Platform Features</h2>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Everything you need to manage campus events</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {features.map(f => (
              <div key={f.title}
                style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px', transition: 'all 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = '#1a3a6b'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,58,107,0.08)' }}
                onMouseOut={e => { e.currentTarget.style.borderColor = '#dbeafe'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{f.icon}</div>
                <h3 style={{ color: '#1a3a6b', fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>{f.title}</h3>
                <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Role Cards Section */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ color: '#1a3a6b', fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>👥 Who Can Use This System?</h2>
            <p style={{ color: '#64748b', fontSize: '14px' }}>5 different roles — each with their own dashboard</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { icon: '🎓', role: 'Student', desc: 'Browse events, register, get certificates, build teams', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
              { icon: '👨‍🏫', role: 'Faculty', desc: 'Create and manage events, view reports and registrations', color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
              { icon: '🎯', role: 'Coordinator', desc: 'Manage assigned events, handle volunteers and duties', color: '#7c3aed', bg: '#fdf4ff', border: '#e9d5ff' },
              { icon: '🙋', role: 'Volunteer', desc: 'View assigned duties, check-in and support events', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
              { icon: '👑', role: 'Dean', desc: 'Approve events, assign roles, view all reports', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
            ].map(r => (
              <div key={r.role} style={{ background: r.bg, border: `1px solid ${r.border}`, borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>{r.icon}</div>
                <h3 style={{ color: r.color, fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>{r.role}</h3>
                <p style={{ color: '#64748b', fontSize: '12px', lineHeight: 1.5 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div style={{ background: 'linear-gradient(135deg, #1a3a6b, #2563eb)', borderRadius: '20px', padding: '48px 32px', textAlign: 'center' }}>
          <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>Ready to Get Started? 🚀</h2>
          <p style={{ color: '#bfdbfe', fontSize: '15px', marginBottom: '28px' }}>Join VIT Pune's centralized event management platform today</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ background: '#fff', color: '#1a3a6b', borderRadius: '12px', padding: '13px 28px', fontWeight: '700', fontSize: '15px', textDecoration: 'none' }}>
              🎓 Register as Student
            </Link>
            <Link to="/login" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: '12px', padding: '13px 28px', fontWeight: '700', fontSize: '15px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}>
              🔐 Login
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#1a3a6b', color: '#93c5fd', textAlign: 'center', padding: '24px', fontSize: '13px' }}>
        <p style={{ marginBottom: '6px', fontWeight: '600', color: '#fff' }}>CampusEvents — VIT Pune</p>
        <p>© 2025 Vishwakarma Institute of Technology, Pune · Kondhwa & Bibwewadi Campus</p>
      </footer>
    </div>
  )
}