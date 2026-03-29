import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import eventService from "../api/eventService";
import Navbar from "../components/Navbar";

const EVENT_TYPE_STYLES = {
  National:     "bg-red-100 text-red-700 border-red-200",
  Intercollege: "bg-purple-100 text-purple-700 border-purple-200",
  Intracollege: "bg-blue-100 text-blue-700 border-blue-200",
  Department:   "bg-green-100 text-green-700 border-green-200",
};
const EVENT_TYPE_ICONS = {
  National: "🏆", Intercollege: "🎓", Intracollege: "🏫", Department: "📚",
};
const EVENT_TYPES = ["All", "National", "Intercollege", "Intracollege", "Department"];

export default function FacultyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    if (user && user.role !== "faculty") {
      navigate(`/${user.role}-dashboard`, { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    eventService.getAllEvents()
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents = events.filter(e => {
    const matchType = selectedType === "All" || e.event_type === selectedType;
    const matchCat  = selectedCategory === "All" || e.category === selectedCategory;
    return matchType && matchCat;
  });

  const typeStats = EVENT_TYPES.slice(1).map(type => ({
    type,
    count: events.filter(e => e.event_type === type).length,
    icon: EVENT_TYPE_ICONS[type],
    style: EVENT_TYPE_STYLES[type],
  }));

  // ✅ NaN guard
  const totalRegistrations = events.reduce((s, e) => s + (e.registered_count || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Faculty Dashboard</h1>
          <p className="text-gray-500 mt-1">
            {user?.designation || "Faculty"}{user?.department ? " · " + user.department : ""}
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Events"        value={events.length}             icon="📅" color="bg-blue-50 border-blue-200" />
          <StatCard label="Total Registrations" value={totalRegistrations}         icon="👥" color="bg-indigo-50 border-indigo-200" />
          <StatCard label="Active Events"       value={events.filter(e => e.status === "Active" || e.status === "active").length} icon="✅" color="bg-green-50 border-green-200" />
          <StatCard label="Upcoming"            value={events.filter(e => new Date(e.date) > new Date()).length} icon="📌" color="bg-purple-50 border-purple-200" />
        </div>

        {/* ✅ Event Type Breakdown — clickable filter cards */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-3">Events by Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {typeStats.map(({ type, count, icon, style }) => (
              <button key={type}
                onClick={() => setSelectedType(selectedType === type ? "All" : type)}
                className={`p-4 rounded-xl border-2 text-left transition-all
                  ${selectedType === type
                    ? "border-indigo-400 bg-indigo-50 shadow-sm"
                    : "border-gray-100 bg-white hover:border-indigo-200 hover:shadow-sm"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{icon}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${style}`}>{type}</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{count}</p>
                <p className="text-xs text-gray-400 mt-0.5">events</p>
              </button>
            ))}
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h2 className="text-lg font-bold text-gray-700">All Campus Events</h2>
            {/* ✅ Filter pills */}
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map(type => (
                <button key={type} onClick={() => setSelectedType(type)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all
                    ${selectedType === type
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {type !== "All" && EVENT_TYPE_ICONS[type]} {type}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No events found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 text-gray-500 font-semibold">Event</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-semibold">Type</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-semibold">Category</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-semibold">Date</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-semibold">Registrations</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map(event => {
                    const regCount = event.registered_count || 0;
                    const maxPart  = event.max_participants || event.seats || 100;
                    const pct      = Math.min((regCount / maxPart) * 100, 100);

                    return (
                      <tr key={event.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="py-3 px-2">
                          <p className="font-semibold text-gray-800">{event.title}</p>
                          <p className="text-xs text-gray-400">{event.location || event.venue || "—"}</p>
                        </td>
                        <td className="py-3 px-2">
                          {event.event_type ? (
                            <span className={`text-xs font-bold px-2 py-1 rounded-full border ${EVENT_TYPE_STYLES[event.event_type] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                              {EVENT_TYPE_ICONS[event.event_type]} {event.event_type}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                            {event.category || "—"}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-gray-600 text-xs">
                          {new Date(event.date).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-100 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-blue-500"
                                style={{ width: `${pct}%` }} />
                            </div>
                            {/* ✅ NaN guard */}
                            <span className="text-xs text-gray-500">{regCount}/{maxPart}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full
                            ${event.status === "Active" || event.status === "active"
                              ? "bg-green-100 text-green-700"
                              : event.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : event.status === "approved"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-500"}`}>
                            {event.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

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