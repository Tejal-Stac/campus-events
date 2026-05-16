import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import eventService from "../api/eventService";
import userService from "../api/userService";
import Navbar from "../components/Navbar";
import RegistrationModal from "../components/RegistrationModal";
import EventCard from "../components/EventCard";
import { groupEventsByStatus } from "../utils/eventHelpers";

const CATEGORIES = ["All", "Hackathon", "Seminar", "Workshop", "Cultural", "Sports", "Technical"];
const EVENT_TYPES = ["All", "National", "Intercollege", "Intracollege", "Department"];

export default function Events() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(null);
  const [alert, setAlert] = useState(null);
  const [modalEvent, setModalEvent] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { fetchData(); }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch APPROVED events (default status for student view)
      const eventsData = await eventService.getAllEvents();
      setEvents(eventsData || []);
      if (eventsData && eventsData.length > 0) {
        console.log(`✅ Loaded ${eventsData.length} events. First event sample:`, eventsData[0]);
      }

      // Only fetch registrations if logged in
      if (user) {
        try {
          const regsData = await userService.getMyRegistrations();
          setMyRegistrations((regsData || []).map(r => r.event_id || r.id));
        } catch {
          setMyRegistrations([]);
        }
      }
    } catch (err) {
      console.error(err);
      showAlert("Failed to load events", "error");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleRegisterClick = (event) => {
    setModalEvent(event);
  };

  const handleModalConfirm = async (formData) => {
    if (!modalEvent) return;
    try {
      setRegistering(modalEvent.id);
      await eventService.registerForEvent(modalEvent.id, formData);
      if (user) {
        // Logged-in: close modal and refresh
        setModalEvent(null);
        showAlert("✅ Registered successfully!");
        setMyRegistrations(prev => [...prev, modalEvent.id]);
        fetchData();
      }
      // Guest: don't close - RegistrationModal shows GuestTicket screen internally
    } catch (err) {
      showAlert(err.response?.data?.message || "Registration failed", "error");
    } finally {
      setRegistering(null);
    }
  };

  const isRegistered = (eventId) => myRegistrations.includes(eventId);

  const filteredEvents = events.filter(event => {
    const matchCat = selectedCategory === "All" || event.category === selectedCategory;
    const matchType = selectedType === "All" || event.event_type === selectedType;
    const matchSearch = !searchQuery ||
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchType && matchSearch;
  });

  const grouped = groupEventsByStatus(filteredEvents)

  const SECTIONS = [
    { key: 'live',     label: '🔴 Live Now',    accent: 'border-red-400   bg-red-50',    badge: 'bg-red-500   text-white' },
    { key: 'upcoming', label: '📅 Upcoming',     accent: 'border-violet-400 bg-violet-50', badge: 'bg-violet-500 text-white' },
    { key: 'past',     label: '🏁 Past Events',  accent: 'border-gray-300   bg-gray-50',   badge: 'bg-gray-400   text-white' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Alert */}
      {alert && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-medium transition-all ${
          alert.type === "error" ? "bg-red-500" : "bg-green-500"
        }`}>
          {alert.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-12 px-4 text-center">
        <h1 className="text-3xl font-bold mb-2">Campus Events</h1>
        <p className="text-blue-200 text-sm">
          {user ? `Welcome, ${user.firstName || user.name}!` : "Browse events — VIT students login, external students register as guest on open events"}
        </p>

        {/* Guest banner */}
        {!user && (
          <div className="mt-4 inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-5 py-3 text-sm">
            <span>🌐 Events marked <strong>Open to All</strong> accept external/non-VIT registrations</span>
            <button onClick={() => navigate("/login")} className="bg-white text-blue-700 font-semibold px-3 py-1 rounded-lg hover:bg-blue-50 text-xs">
              VIT Login →
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border rounded-lg px-4 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map(t => (
              <button key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  selectedType === t ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                }`}
              >{t}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  selectedCategory === c ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                }`}
              >{c}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <p className="text-center text-gray-400 py-16 text-lg">
            {events.length === 0
              ? "🎉 No upcoming events approved yet."
              : "📌 No events match your filters."}
          </p>
        ) : (
          <div className="space-y-10">
            {SECTIONS.map(({ key, label, accent, badge }) => {
              const sectionEvents = grouped[key] || []
              if (sectionEvents.length === 0) return null
              return (
                <section key={key}>
                  <div className={`flex items-center gap-3 mb-4 pb-2 border-b-2 ${accent}`}>
                    <h2 className="text-lg font-bold text-gray-800">{label}</h2>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${badge}`}>
                      {sectionEvents.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sectionEvents.map(event => (
                      <EventCard
                        key={event.id}
                        event={event}
                        role="student"
                        onAction={(action, eventId) => {
                          if (action === 'register') {
                            const ev = sectionEvents.find(e => e.id === eventId)
                            if (ev) handleRegisterClick(ev)
                          }
                        }}
                        isRegistered={isRegistered(event.id)}
                        userCollegeType={user?.college_type || 'guest'}
                        user={user}
                      />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {modalEvent && (
        <RegistrationModal
          event={modalEvent}
          user={user}
          onConfirm={handleModalConfirm}
          onClose={() => setModalEvent(null)}
        />
      )}
    </div>
  );
}