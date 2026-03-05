import { useState, useEffect } from 'react';
import eventService from '../api/eventService';
import Navbar from '../components/Navbar';

/**
 * EXAMPLE: Students Event List Page
 * Replaces Firebase onSnapshot listener with PostgreSQL API + polling
 * 
 * Firebase (OLD):
 *   const unsubscribe = onSnapshot(collection(db, 'events'), (snapshot) => {
 *     const eventsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
 *     setEvents(eventsList);
 *   });
 * 
 * PostgreSQL (NEW):
 *   useEffect hook with API call (can add polling/WebSocket for real-time)
 */

export default function EventsListExample() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Fetch events on component mount (replaces onSnapshot)
  useEffect(() => {
    fetchEvents();
    
    // Optional: Poll for updates every 30 seconds (replaces real-time listener)
    const interval = setInterval(fetchEvents, 30000);
    
    return () => clearInterval(interval); // Cleanup
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEvents();
      setEvents(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch events. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      await eventService.registerForEvent(eventId);
      alert('Registration successful! 100 points added to your profile.');
      fetchEvents(); // Refresh events to show updated registration count
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  const filtered = events.filter(e => 
    e.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8">Loading events...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh' }}>
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Campus Events</h1>
        
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border rounded-lg mb-6"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered?.map(event => (
            <div key={event.id} className="bg-white border rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
              <p className="text-gray-600 mb-2">{event.description}</p>
              <p className="text-sm text-gray-500">
                📅 {new Date(event.date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">📍 {event.location}</p>
              <p className="text-sm text-gray-500">
                👥 {event.registered_count || 0} / {event.max_participants} registered
              </p>
              
              <button
                onClick={() => handleRegister(event.id)}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Register Now
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-gray-500 mt-8">No events found</p>
        )}
      </div>
    </div>
  );
}
