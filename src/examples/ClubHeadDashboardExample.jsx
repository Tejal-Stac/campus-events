import { useState, useEffect } from 'react';
import eventService from '../api/eventService';
import Navbar from '../components/Navbar';

/**
 * EXAMPLE: Club Head Dashboard - Participant List
 * Replaces Firebase onSnapshot for participant tracking
 * 
 * Firebase (OLD):
 *   onSnapshot(collection(db, 'registrations'), (snapshot) => {
 *     const participants = snapshot.docs.map(doc => doc.data());
 *     setParticipants(participants);
 *   });
 * 
 * PostgreSQL (NEW):
 *   Fetch participants for specific events via API
 */

export default function ClubHeadDashboardExample() {
  const [myEvents, setMyEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getMyEvents();
      setMyEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async (eventId) => {
    try {
      const data = await eventService.getEventParticipants(eventId);
      setParticipants(data);
      setSelectedEvent(eventId);
    } catch (err) {
      console.error('Error fetching participants:', err);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh' }}>
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Club Head Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Events */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">My Events</h2>
            <div className="space-y-3">
              {myEvents?.map(event => (
                <div
                  key={event.id}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => fetchParticipants(event.id)}
                >
                  <h3 className="font-bold text-gray-800">{event.title}</h3>
                  <p className="text-sm text-gray-500">
                    {event.registered_count || 0} registrations
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Participant List */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Participants</h2>
            {selectedEvent ? (
              <div className="space-y-2">
                {participants?.map((p, idx) => (
                  <div key={idx} className="p-3 border rounded-lg">
                    <p className="font-semibold">{p.user_name}</p>
                    <p className="text-sm text-gray-500">{p.user_email}</p>
                    <p className="text-xs text-gray-400">
                      Registered: {new Date(p.registered_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {participants.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No participants yet</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Select an event to view participants
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
