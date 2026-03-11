import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import eventService from '../api/eventService'
import api from '../api/axiosConfig'
import EventCard from '../components/EventCard'

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
      await api.post(`/events/register/${eventId}`)
      alert('🎉 Successfully Registered!')
      
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
      e.organising_club?.toLowerCase().includes(search.toLowerCase())
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
              // Check if user is already registered
              const isRegistered = userRegistrations.includes(event.id)
              
              return (
                <EventCard
                  key={event.id}
                  event={event}
                  role="student"
                  onAction={(action, eventId) => handleRegister(eventId)}
                  isRegistered={isRegistered}
                />
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
