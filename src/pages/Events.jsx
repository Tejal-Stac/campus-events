import { useState } from 'react'
import Navbar from '../components/Navbar'

const events = [
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
    branch: 'All',
    year: '3rd',
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
    branch: 'CSE',
    year: 'All',
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
    branch: 'All',
    year: 'All',
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
    branch: 'CSE',
    year: '2nd',
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
    branch: 'All',
    year: 'All',
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
    branch: 'MECH',
    year: '3rd',
    keyFeatures: ['Bot Building', 'Competition', 'Prizes'],
  },
]

const categories = ['All', 'Hackathon', 'Cultural', 'Seminar', 'Sports', 'Workshop', 'Networking']
const branches = ['All', 'CSE', 'IT', 'MECH', 'ENTC', 'MBA', 'MCA']
const years = ['All', '1st', '2nd', '3rd', '4th']

export default function Events() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [branch, setBranch] = useState('All')
  const [year, setYear] = useState('All')

  const filtered = events.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.organisingClub.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'All' || e.category === category
    const matchBranch = branch === 'All' || e.branch === 'All' || e.branch === branch
    const matchYear = year === 'All' || e.year === 'All' || e.year === year
    return matchSearch && matchCategory && matchBranch && matchYear
  })

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a6b, #2563eb)', paddingTop: '56px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
          <h1 style={{ color: '#fff', fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>📅 Campus Events</h1>
          <p style={{ color: '#bfdbfe', fontSize: '15px' }}>Discover and register for events happening at VIT Pune</p>
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #dbeafe', padding: '16px 24px', position: 'sticky', top: '56px', zIndex: 50 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>

          {/* Search */}
          <input
            placeholder="🔍 Search events or clubs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 2, minWidth: '200px', background: '#f8faff', border: '1px solid #cbd5e1', color: '#1a3a6b', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
            onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }}
          />

          {/* Branch */}
          <select value={branch} onChange={e => setBranch(e.target.value)}
            style={{ flex: 1, minWidth: '130px', background: '#f8faff', border: '1px solid #cbd5e1', color: '#1a3a6b', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
            {branches.map(b => <option key={b}>{b === 'All' ? 'All Branches' : b}</option>)}
          </select>

          {/* Year */}
          <select value={year} onChange={e => setYear(e.target.value)}
            style={{ flex: 1, minWidth: '120px', background: '#f8faff', border: '1px solid #cbd5e1', color: '#1a3a6b', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
            {years.map(y => <option key={y}>{y === 'All' ? 'All Years' : `${y} Year`}</option>)}
          </select>
        </div>

        {/* Category Pills */}
        <div style={{ maxWidth: '1280px', margin: '12px auto 0', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              style={{
                padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: 'none',
                background: category === cat ? '#1a3a6b' : '#f0f4ff',
                color: category === cat ? '#fff' : '#64748b',
              }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
          Showing <strong style={{ color: '#1a3a6b' }}>{filtered.length}</strong> events
        </p>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
            <p style={{ fontSize: '16px', fontWeight: '600' }}>No events found matching your filters.</p>
            <button onClick={() => { setSearch(''); setCategory('All'); setBranch('All'); setYear('All') }}
              style={{ marginTop: '16px', background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filtered.map(event => {
              const pct = Math.round((event.registered / event.seats) * 100)
              return (
                <div key={event.id}
                  style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', overflow: 'hidden', transition: 'all 0.2s', cursor: 'pointer' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#1a3a6b'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,58,107,0.10)' }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#dbeafe'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>

                  {/* Category Banner */}
                  <div style={{ background: 'linear-gradient(135deg, #1a3a6b, #2563eb)', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px', fontSize: '11px', padding: '3px 10px', fontWeight: '600' }}>{event.category}</span>
                    <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: '6px', fontSize: '11px', padding: '3px 10px', fontWeight: '600' }}>📌 {event.saVertical}</span>
                  </div>

                  <div style={{ padding: '16px' }}>
                    {/* Title */}
                    <h3 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '15px', marginBottom: '12px' }}>{event.title}</h3>

                    {/* All Fields */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' }}>
                      {[
                        { icon: '🏢', label: 'Organised by', value: event.organisingClub },
                        { icon: '📅', label: 'Date & Day', value: `${event.day}, ${event.date}` },
                        { icon: '⏰', label: 'Time', value: `${event.timeFrom} to ${event.timeTo}` },
                        { icon: '📍', label: 'Venue', value: event.venue },
                        event.onlineLink ? { icon: '🔗', label: 'Online Link', value: event.onlineLink, isLink: true } : null,
                        { icon: '🎯', label: 'Audience', value: event.targetAudience },
                        { icon: '👥', label: 'Expected', value: `${event.expectedCount} students` },
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
                    <button
                      style={{ width: '100%', background: pct >= 100 ? '#94a3b8' : '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: '700', cursor: pct >= 100 ? 'not-allowed' : 'pointer' }}
                      onClick={() => pct < 100 && alert(`✅ Successfully registered for ${event.title}!`)}>
                      {pct >= 100 ? '❌ Fully Booked' : '✅ Register Now'}
                    </button>
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