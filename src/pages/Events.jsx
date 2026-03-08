import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import eventService from '../api/eventService'

const categories = ['All', 'Hackathon', 'Cultural', 'Seminar', 'Sports', 'Workshop', 'Networking']
const branches = ['All', 'CSE', 'IT', 'MECH', 'ENTC', 'MBA', 'MCA']
const years = ['All', '1st', '2nd', '3rd', '4th']

export default function Events() {
  const { user, updateUserPoints } = useAuth()
  const [events, setEvents] = useState([])
  const [userRegistrations, setUserRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [branch, setBranch] = useState('All')
  const [year, setYear] = useState('All')

  // Category-based placeholder images
  const getCategoryImage = (category) => {
    const placeholders = {
      'Hackathon': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop',
      'Cultural': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop',
      'Seminar': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop',
      'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=400&fit=crop',
      'Workshop': 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&h=400&fit=crop',
      'Networking': 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop',
    }
    return placeholders[category] || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop'
  }

  // Fetch events and user registrations on mount
  useEffect(() => {
    fetchData()
    
    // Optional: Poll for updates every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Fetch all events
      const eventsData = await eventService.getAllEvents()
      
      // CRITICAL FIX: Only show approved events to students
      const approvedEvents = eventsData.filter(event => 
        event.status === 'approved' || event.status === 'Active'
      )
      
      console.log(`📊 Fetched ${eventsData.length} total events, ${approvedEvents.length} approved`)
      setEvents(approvedEvents)
      
      // Fetch user's registrations if logged in
      if (user) {
        try {
          const { userService } = await import('../api/userService')
          const registrationsData = await userService.getMyRegistrations()
          // Extract event IDs from registrations
          const eventIds = registrationsData.map(reg => reg.event_id || reg.id)
          setUserRegistrations(eventIds)
        } catch (err) {
          console.log('Could not fetch registrations:', err)
          setUserRegistrations([])
        }
      }
      
      setError('')
    } catch (err) {
      setError('Failed to load events. Please try again.')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchEvents = fetchData

  const handleRegister = async (eventId, eventTitle) => {
    try {
      await eventService.registerForEvent(eventId)
      alert(`✅ Successfully registered for ${eventTitle}!\n\n🎉 100 points added to your profile!`)
      
      // Update user points and registrations in global state
      await updateUserPoints()
      
      // Refresh events and registrations to update UI
      fetchData()
      
      // Refresh events to show updated registration count
      fetchEvents()
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed'
      alert(`❌ ${errorMsg}`)
    }
  }

  const filtered = events?.filter(e => {
    const matchSearch = e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.organizing_club?.toLowerCase().includes(search.toLowerCase()) ||
      e.organisingClub?.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'All' || e.category === category
    const matchBranch = branch === 'All' || e.branch === 'All' || e.branch === branch
    const matchYear = year === 'All' || e.year === 'All' || e.year === year
    return matchSearch && matchCategory && matchBranch && matchYear
  }) || []

  // Loading state
  if (loading) {
    return (
      <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', paddingTop: '56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #dbeafe', borderTop: '4px solid #1a3a6b', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#64748b', fontSize: '14px' }}>Loading events...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', paddingTop: '56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column', gap: '16px', padding: '24px' }}>
          <div style={{ fontSize: '48px' }}>⚠️</div>
          <p style={{ color: '#dc2626', fontSize: '16px', fontWeight: '600' }}>{error}</p>
          <button onClick={fetchEvents} style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
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
            {branches?.map(b => <option key={b}>{b === 'All' ? 'All Branches' : b}</option>)}
          </select>

          {/* Year */}
          <select value={year} onChange={e => setYear(e.target.value)}
            style={{ flex: 1, minWidth: '120px', background: '#f8faff', border: '1px solid #cbd5e1', color: '#1a3a6b', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
            {years?.map(y => <option key={y}>{y === 'All' ? 'All Years' : `${y} Year`}</option>)}
          </select>
        </div>

        {/* Category Pills */}
        <div style={{ maxWidth: '1280px', margin: '12px auto 0', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {categories?.map(cat => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered?.map(event => {
              // Handle both database schema (max_participants, registered_count) and old hardcoded data (seats, registered)
              const maxParticipants = event.max_participants || event.capacity || event.seats || 100
              const registeredCount = event.registered_count || event.registered || 0
              const pct = Math.round((registeredCount / maxParticipants) * 100)
              
              // Format date if it's from database (ISO format)
              const eventDate = event.date ? new Date(event.date).toLocaleDateString('en-US', { 
                year: 'numeric', month: 'short', day: 'numeric' 
              }) : 'TBA'
              
              // Check if user is already registered using userRegistrations array
              const isRegistered = userRegistrations.includes(event.id)
              
              // Get event image
              const eventImage = event.image_url || getCategoryImage(event.category)
              
              return (
                <div key={event.id}
                  className="group bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                  style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>

                  {/* Hero Image Section */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={eventImage} 
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => { e.target.src = getCategoryImage(event.category) }}
                    />
                    
                    {/* Glassmorphism Overlay Badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                      <div className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white backdrop-blur-md bg-white/20 border border-white/30 shadow-lg">
                        {event.saVertical || event.sa_vertical || 'General'}
                      </div>
                      <div className="px-3 py-1.5 rounded-lg text-xs font-bold text-white backdrop-blur-md bg-gradient-to-r from-indigo-500/80 to-purple-500/80 border border-white/30 shadow-lg">
                        {event.category}
                      </div>
                    </div>
                    
                    {/* Gradient Overlay at Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>

                  <div className="p-5">
                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                      {event.title}
                    </h3>

                    {/* Description */}
                    {event.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    )}

                    {/* Organized By */}
                    <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-xs font-semibold text-indigo-900">
                        {event.organizing_club || event.organisingClub}
                      </span>
                    </div>

                    {/* 2-Column Grid for Details */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {/* Date */}
                      <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                        <svg className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-medium">Date</p>
                          <p className="text-xs font-bold text-gray-900 truncate">{eventDate}</p>
                        </div>
                      </div>
                      
                      {/* Time */}
                      {event.timeFrom && (
                        <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                          <svg className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Time</p>
                            <p className="text-xs font-bold text-gray-900 truncate">{event.timeFrom}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Venue */}
                      <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                        <svg className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-medium">Venue</p>
                          <p className="text-xs font-bold text-gray-900 truncate">{event.location || event.venue}</p>
                        </div>
                      </div>
                      
                      {/* Fees */}
                      <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                        <svg className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-medium">Fees</p>
                          <p className={`text-xs font-bold truncate ${event.fees === 'Free' || event.fees === '0' ? 'text-green-600' : 'text-red-600'}`}>
                            {event.fees || 'Free'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Audience */}
                      {event.target_audience && (
                        <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg col-span-2">
                          <svg className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Audience</p>
                            <p className="text-xs font-bold text-gray-900">{event.target_audience || event.targetAudience}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Contact */}
                      {event.contact && (
                        <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg col-span-2">
                          <svg className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Contact</p>
                            <p className="text-xs font-bold text-gray-900">{event.contact}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Key Features with Pastel Backgrounds */}
                    {(event.keyFeatures || event.key_features) && (
                      <div className="mb-4">
                        <p className="text-xs font-bold text-gray-700 mb-2">✨ Key Features</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(event.keyFeatures || event.key_features)?.map((f, idx) => {
                            const colors = [
                              'bg-pink-50 text-pink-700 border-pink-200',
                              'bg-purple-50 text-purple-700 border-purple-200',
                              'bg-blue-50 text-blue-700 border-blue-200',
                              'bg-green-50 text-green-700 border-green-200',
                              'bg-yellow-50 text-yellow-700 border-yellow-200',
                            ]
                            return (
                              <span key={`${f}-${idx}`} className={`${colors[idx % colors.length]} border rounded-full text-xs px-3 py-1 font-medium`}>
                                {f}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Thinner Gradient Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-gray-600 font-medium">
                          {registeredCount}/{maxParticipants} registered
                        </span>
                        <span className={`text-xs font-bold ${pct > 80 ? 'text-red-600' : 'text-indigo-600'}`}>
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${pct > 80 ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Register Button with Gradient & Scale Effect */}
                    <button
                      className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                        pct >= 100 
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                          : isRegistered
                          ? 'bg-green-600 text-white cursor-default border-2 border-green-700'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-105 hover:shadow-lg active:scale-95'
                      }`}
                      onClick={() => !pct >= 100 && !isRegistered && handleRegister(event.id, event.title)}
                      disabled={pct >= 100 || isRegistered}>
                      {pct >= 100 ? (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Fully Booked
                        </>
                      ) : isRegistered ? (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Already Registered
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          Register Now
                        </>
                      )}
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