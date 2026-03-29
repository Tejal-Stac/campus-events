import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import eventService from "../api/eventService";
import userService from "../api/userService";
import Navbar from "../components/Navbar";
import RegistrationModal from "../components/RegistrationModal";

const EVENT_TYPE_STYLES = {
  National:     "bg-red-100 text-red-700 border border-red-200",
  Intercollege: "bg-purple-100 text-purple-700 border border-purple-200",
  Intracollege: "bg-blue-100 text-blue-700 border border-blue-200",
  Department:   "bg-green-100 text-green-700 border border-green-200",
};
const EVENT_TYPE_ICONS = {
  National: "🏆", Intercollege: "🎓", Intracollege: "🏫", Department: "📚",
};
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

  const userIsVitian = !!(
    user?.is_vitian ||
    user?.college_type === "vitian" ||
    user?.email?.endsWith("@vit.edu")
  );

  useEffect(() => { fetchData(); }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const eventsData = await eventService.getAllEvents();
      setEvents(eventsData || []);

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
    // Logged-in VIT student → normal modal
    if (user && userIsVitian) {
      setModalEvent(event);
      return;
    }
    // Logged-in non-VIT user → external modal (if event allows)
    if (user && !userIsVitian) {
      if (!event.allow_external) {
        showAlert("This event is for VIT students only 🔒", "error");
        return;
      }
      setModalEvent(event);
      return;
    }
    // Guest (not logged in) → open modal for external form if allowed, else prompt login
    if (!event.allow_external) {
      showAlert("This event is for VIT students only. Please login with your VIT account 🔒", "error");
      return;
    }
    // Guest + allow_external → open modal as guest
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

  const getRegistrationButton = (event) => {
    // Already registered (only possible if logged in)
    if (user && isRegistered(event.id)) {
      return (
        <button disabled className="w-full py-2 px-4 rounded-lg font-semibold bg-green-100 text-green-700 cursor-not-allowed text-sm">
          ✅ Registered
        </button>
      );
    }

    // VIT-only event + guest → show login prompt
    if (!event.allow_external && !user) {
      return (
        <button
          onClick={() => navigate("/login")}
          className="w-full py-2 px-4 rounded-lg font-semibold bg-gray-100 text-gray-500 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          🔒 Login to Register
        </button>
      );
    }

    // VIT-only event + non-vitian logged in
    if (!event.allow_external && user && !userIsVitian) {
      return (
        <button disabled className="w-full py-2 px-4 rounded-lg font-semibold bg-gray-100 text-gray-400 cursor-not-allowed text-sm">
          🔒 VIT Students Only
        </button>
      );
    }

    // Open event OR vitian logged in → Register button
    return (
      <button
        onClick={() => handleRegisterClick(event)}
        disabled={registering === event.id}
        className="w-full py-2 px-4 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm disabled:opacity-60"
      >
        {registering === event.id ? "Registering..." : !user ? "🌐 Register as Guest" : "Register Now →"}
      </button>
    );
  };

  const filteredEvents = events.filter(event => {
    const matchCat = selectedCategory === "All" || event.category === selectedCategory;
    const matchType = selectedType === "All" || event.event_type === selectedType;
    const matchSearch = !searchQuery ||
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchType && matchSearch;
  });

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
          <p className="text-center text-gray-400 py-16 text-lg">No events found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => {
              const totalSeats = Number(event.seats) || 0;
              const registered = Number(event.registered_count || event.registered || 0);
              const pct = totalSeats > 0 ? Math.min(100, Math.round((registered / totalSeats) * 100)) : 0;
              const isFree = !event.fees || event.fees === "0" || event.fees?.toLowerCase() === "free";

              return (
                <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                  {/* Card header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-base leading-snug">{event.title}</h3>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {event.event_type && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold bg-white/20`}>
                            {EVENT_TYPE_ICONS[event.event_type] || "📅"} {event.event_type}
                          </span>
                        )}
                        {event.allow_external ? (
                          <span className="text-xs bg-green-400/30 border border-green-300/50 text-green-100 px-2 py-0.5 rounded-full">🌐 Open to All</span>
                        ) : (
                          <span className="text-xs bg-white/10 border border-white/20 text-white/70 px-2 py-0.5 rounded-full">🔒 VIT Only</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-blue-100">
                      {event.date && <span>📅 {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                      {event.venue && <span>📍 {event.venue}</span>}
                      <span className={`font-semibold ${isFree ? "text-green-300" : "text-yellow-300"}`}>
                        {isFree ? "Free" : `₹${event.fees}`}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4 flex flex-col flex-1 gap-3">
                    {event.description && (
                      <p className="text-gray-500 text-xs line-clamp-2">{event.description}</p>
                    )}
                    {event.category && (
                      <span className="self-start text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{event.category}</span>
                    )}

                    {/* Capacity bar */}
                    {totalSeats > 0 && (
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>{registered} registered</span>
                          <span>{totalSeats} seats</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-red-400" : pct >= 60 ? "bg-yellow-400" : "bg-green-400"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="mt-auto">
                      {getRegistrationButton(event)}
                    </div>
                  </div>
                </div>
              );
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