import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import eventService from "../api/eventService";
import userService from "../api/userService";
import Navbar from "../components/Navbar";

// Color map for event type badges
const EVENT_TYPE_STYLES = {
  National:      "bg-red-100 text-red-700 border border-red-200",
  Intercollege:  "bg-purple-100 text-purple-700 border border-purple-200",
  Intracollege:  "bg-blue-100 text-blue-700 border border-blue-200",
  Department:    "bg-green-100 text-green-700 border border-green-200",
};

const EVENT_TYPE_ICONS = {
  National:     "🏆",
  Intercollege: "🎓",
  Intracollege: "🏫",
  Department:   "📚",
};

const CATEGORIES = ["All", "Hackathon", "Seminar", "Workshop", "Cultural", "Sports", "Technical"];
const EVENT_TYPES = ["All", "National", "Intercollege", "Intracollege", "Department"];

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(null);
  const [alert, setAlert] = useState(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsData, regsData] = await Promise.all([
        eventService.getAllEvents(),
        userService.getMyRegistrations()
      ]);
      setEvents(eventsData);
      setMyRegistrations((regsData || []).map(r => r.event_id));
    } catch (err) {
      console.error(err);
      showAlert("Failed to load events", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      setRegistering(eventId);
      await eventService.registerForEvent(eventId);
      setMyRegistrations(prev => [...prev, eventId]);
      setEvents(prev =>
        prev.map(e =>
          e.id === eventId
            ? { ...e, registered_count: e.registered_count + 1 }
            : e
        )
      );
      showAlert("🎉 Registered! 100 points added to your account.", "success");
    } catch (err) {
      showAlert(err.response?.data?.message || "Registration failed", "error");
    } finally {
      setRegistering(null);
    }
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  // Filter logic
  const filteredEvents = events.filter(event => {
    const matchCategory = selectedCategory === "All" || event.category === selectedCategory;
    const matchType = selectedType === "All" || event.event_type === selectedType;
    const matchSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchType && matchSearch;
  });

  const isRegistered = (eventId) => myRegistrations.includes(eventId);
  const isFull = (event) => event.registered_count >= event.max_participants;
  const isVITOnly = (event) => !event.allow_external && !user?.is_vitian;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Alert */}
      {alert && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all
          ${alert.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {alert.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Campus Events</h1>
          <p className="text-gray-500 mt-1">Discover and register for upcoming events</p>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="🔍 Search events by name or description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
          />
        </div>

        {/* Category Filter */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
                  ${selectedCategory === cat
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Event Type Filter */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Event Type</p>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
                  ${selectedType === type
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-300"}`}
              >
                {type !== "All" && EVENT_TYPE_ICONS[type]} {type}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">
          Showing <span className="font-semibold text-gray-700">{filteredEvents.length}</span> events
          {selectedType !== "All" && <span> · Type: <span className="font-semibold">{selectedType}</span></span>}
          {selectedCategory !== "All" && <span> · Category: <span className="font-semibold">{selectedCategory}</span></span>}
        </p>

        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-lg font-medium">No events found</p>
            <p className="text-sm">Try changing your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                isRegistered={isRegistered(event.id)}
                isFull={isFull(event)}
                isVITOnly={isVITOnly(event)}
                registering={registering === event.id}
                onRegister={handleRegister}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Event Card Component ──────────────────────────────────────
function EventCard({ event, isRegistered, isFull, isVITOnly, registering, onRegister }) {
  const capacityPercent = Math.min(
    (event.registered_count / event.max_participants) * 100, 100
  );

  const capacityColor =
    capacityPercent >= 90 ? "bg-red-500" :
    capacityPercent >= 70 ? "bg-yellow-400" : "bg-green-500";

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden
                    hover:shadow-md transition-all duration-200 flex flex-col">

      {/* Hero Image with overlaid badges */}
      <div className="relative h-44 bg-gradient-to-br from-indigo-400 to-purple-600">
        {event.image_url ? (
          <img src={event.image_url} alt={event.title}
               className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">
            {event.category === "Hackathon" ? "💻" :
             event.category === "Cultural" ? "🎭" :
             event.category === "Sports" ? "⚽" :
             event.category === "Workshop" ? "🔧" : "🎓"}
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Category badge — top left */}
        <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white
                         text-xs font-semibold px-2.5 py-1 rounded-full border border-white/30">
          {event.category}
        </span>

        {/* Event Type badge — top right */}
        {event.event_type && (
          <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full
                            backdrop-blur-sm bg-white/90 ${EVENT_TYPE_STYLES[event.event_type] || ""}`}>
            {EVENT_TYPE_ICONS[event.event_type]} {event.event_type}
          </span>
        )}

        {/* VIT Only tag */}
        {!event.allow_external && (
          <span className="absolute bottom-3 left-3 bg-orange-500 text-white
                           text-xs font-bold px-2 py-0.5 rounded-full">
            🔒 VIT Only
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 text-base leading-snug mb-1 line-clamp-2">
          {event.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-3">{event.description}</p>

        {/* Meta info */}
        <div className="space-y-1 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1.5">
            <span>📅</span>
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>📍</span>
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>💰</span>
            <span>{event.fees || "Free"}</span>
          </div>
        </div>

        {/* Capacity bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{event.registered_count} registered</span>
            <span>{event.max_participants} max</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${capacityColor}`}
              style={{ width: `${capacityPercent}%` }}
            />
          </div>
        </div>

        {/* Register Button */}
        <div className="mt-auto">
          {isRegistered ? (
            <button disabled
              className="w-full py-2.5 rounded-xl bg-green-50 text-green-700 font-semibold
                         text-sm border border-green-200 cursor-default">
              ✅ Already Registered
            </button>
          ) : isVITOnly ? (
            <button disabled
              className="w-full py-2.5 rounded-xl bg-orange-50 text-orange-600 font-semibold
                         text-sm border border-orange-200 cursor-default">
              🔒 VIT Students Only
            </button>
          ) : isFull ? (
            <button disabled
              className="w-full py-2.5 rounded-xl bg-gray-50 text-gray-400 font-semibold
                         text-sm border border-gray-200 cursor-default">
              Fully Booked
            </button>
          ) : (
            <button
              onClick={() => onRegister(event.id)}
              disabled={registering}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white
                         font-semibold text-sm transition-all active:scale-95 disabled:opacity-70">
              {registering ? "Registering..." : "Register Now"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}