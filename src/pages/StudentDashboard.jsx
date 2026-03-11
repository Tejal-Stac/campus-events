import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import eventService from "../api/eventService";
import userService from "../api/userService";
import Navbar from "../components/Navbar";

const EVENT_TYPE_STYLES = {
  National:      "bg-red-100 text-red-700",
  Intercollege:  "bg-purple-100 text-purple-700",
  Intracollege:  "bg-blue-100 text-blue-700",
  Department:    "bg-green-100 text-green-700",
};
const EVENT_TYPE_ICONS = {
  National: "🏆", Intercollege: "🎓", Intracollege: "🏫", Department: "📚",
};
const EVENT_TYPES = ["All", "National", "Intercollege", "Intracollege", "Department"];

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("All");

  // Role guard
  useEffect(() => {
    if (user && user.role !== "student") {
      navigate(`/${user.role}-dashboard`, { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsData, regsData] = await Promise.all([
        eventService.getAllEvents(),
        userService.getMyRegistrations()
      ]);
      setEvents(eventsData);
      setMyRegistrations((regsData || []).map(r => r.event_id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = selectedType === "All"
    ? events
    : events.filter(e => e.event_type === selectedType);

  const registeredEvents = events.filter(e => myRegistrations.includes(e.id));
  const upcomingCount = events.filter(e => new Date(e.date) > new Date()).length;

  const typeCounts = EVENT_TYPES.slice(1).reduce((acc, type) => {
    acc[type] = registeredEvents.filter(e => e.event_type === type).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {user?.name?.split(" ")[0] || user?.firstName} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {user?.is_vitian
              ? `${user?.department || "VIT"} · ${user?.year || ""}`
              : `${user?.college_name || "External Student"}`}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Points" value={user?.points || 0} icon="⭐" color="bg-yellow-50 border-yellow-200" />
          <StatCard label="Registered" value={registeredEvents.length} icon="📋" color="bg-blue-50 border-blue-200" />
          <StatCard label="Upcoming" value={upcomingCount} icon="📅" color="bg-purple-50 border-purple-200" />
          <StatCard label="Certificates" value={0} icon="🏅" color="bg-green-50 border-green-200" />
        </div>

        {/* Event Type Summary Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-3">My Participation by Event Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {EVENT_TYPES.slice(1).map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type === selectedType ? "All" : type)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all
                  ${selectedType === type
                    ? "border-indigo-400 bg-indigo-50 shadow-sm"
                    : "border-gray-100 bg-white hover:border-indigo-200"}`}
              >
                <span className="text-2xl">{EVENT_TYPE_ICONS[type]}</span>
                <div>
                  <p className="text-xs text-gray-500">{type}</p>
                  <p className="text-xl font-bold text-gray-800">{typeCounts[type]}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Events Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-700">Upcoming Events</h2>
            <button
              onClick={() => navigate("/events")}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              View All →
            </button>
          </div>

          {/* Type Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-5">
            {EVENT_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all
                  ${selectedType === type
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
              >
                {type !== "All" && EVENT_TYPE_ICONS[type]} {type}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No events found for this type</p>
          ) : (
            <div className="space-y-3">
              {filteredEvents.slice(0, 6).map(event => (
                <EventRow
                  key={event.id}
                  event={event}
                  isRegistered={myRegistrations.includes(event.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* My Registered Events */}
        {registeredEvents.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-700 mb-4">My Registered Events</h2>
            <div className="space-y-3">
              {registeredEvents.map(event => (
                <EventRow key={event.id} event={event} isRegistered={true} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function EventRow({ event, isRegistered }) {
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    });

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-lg">
          {EVENT_TYPE_ICONS[event.event_type] || "📌"}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{event.title}</p>
          <p className="text-xs text-gray-400">{formatDate(event.date)} · {event.location}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${EVENT_TYPE_STYLES[event.event_type] || ""}`}>
          {event.event_type}
        </span>
        {isRegistered && (
          <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
            ✅ Registered
          </span>
        )}
      </div>
    </div>
  );
}