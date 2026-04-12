import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import eventService from "../api/eventService";
import Navbar from "../components/Navbar";
import EventCard from "../components/EventCard";

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
const CATEGORIES = ["All", "Hackathon", "Seminar", "Workshop", "Cultural", "Sports", "Technical"];

export default function FacultyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("overview");
  const [newEvent, setNewEvent] = useState({ title: '', date: '', category: '', seats: '', venue: '', desc: '', event_type: 'Intracollege', allow_external: false });
  const [creating, setCreating] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (user && user.role !== "faculty") {
      navigate(`/${user.role}-dashboard`, { replace: true });
    }
  }, [user, navigate]);

  const updateEvent = (field, value) => setNewEvent(prev => ({ ...prev, [field]: value }));

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleFacultyAction = async (action, eventId) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    switch (action) {
      case 'edit':
        // Navigate to edit event page or open edit modal
        console.log('Edit event:', eventId);
        showAlert('Edit functionality coming soon', 'info');
        break;
      
      case 'markAttendance':
        console.log('Mark attendance for event:', eventId);
        showAlert('📋 Attendance marking feature coming soon', 'info');
        break;
      
      case 'analytics':
        console.log('View analytics for event:', eventId);
        showAlert('📊 Analytics feature coming soon', 'info');
        break;
      
      case 'view':
        console.log('View event details:', eventId);
        break;
      
      default:
        break;
    }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.venue) {
      showAlert("Please fill in all required fields (Title, Date, Venue)", "error");
      return;
    }

    try {
      setCreating(true);
      const eventPayload = {
        title: newEvent.title,
        date: newEvent.date,
        category: newEvent.category || 'General',
        seats: parseInt(newEvent.seats) || 100,
        venue: newEvent.venue,
        desc: newEvent.desc,
        event_type: newEvent.event_type,
        allow_external: newEvent.allow_external,
        organisingClub: user?.organisingClub || user?.organising_club || 'Faculty Department',
      };
      
      const response = await eventService.createEvent(eventPayload);
      
      showAlert("✅ Event created successfully! Awaiting Dean approval.", "success");
      setNewEvent({ title: '', date: '', category: '', seats: '', venue: '', desc: '', event_type: 'Intracollege', allow_external: false });
      setActiveTab("overview");
      fetchEvents();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to create event";
      showAlert(errorMsg, "error");
      console.error('Event creation error:', err);
    } finally {
      setCreating(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const eventsData = await eventService.getAllEvents();
      setEvents(eventsData || []);
    } catch (err) {
      console.error('Events fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

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

      {/* Alert */}
      {alert && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-medium transition-all ${
          alert.type === "error" ? "bg-red-500" : "bg-green-500"
        }`}>
          {alert.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'events', label: '📅 All Events' },
            { id: 'create', label: '➕ Create Event' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
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
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-2xl font-bold text-gray-800">All Events</h2>
              {/* Filter pills */}
              <div className="flex flex-wrap gap-2">
                {EVENT_TYPES.map(type => (
                  <button key={type} onClick={() => setSelectedType(type)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                      ${selectedType === type
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {type !== "All" ? (EVENT_TYPE_ICONS[type] + " ") : ""}{type}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-gray-500 text-lg font-medium">No events found</p>
                <p className="text-gray-400 text-sm mt-2">Create a new event to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map(event => {
                  // Check if current user is the owner (created_by matches user.id)
                  const isOwner = event.created_by === user?.id;
                  
                  return (
                    <EventCard
                      key={event.id}
                      event={event}
                      role="faculty"
                      isOwner={isOwner}
                      onAction={(action, eventId) => handleFacultyAction(action, eventId)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Create Event Tab */}
        {activeTab === 'create' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">➕ Create New Event</h2>
            <p className="text-gray-500 text-sm mb-6">Fill in the details below. Your event will be submitted for Dean approval.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Title *</label>
                <input
                  type="text"
                  placeholder="e.g. National Hackathon 2025"
                  value={newEvent.title}
                  onChange={(e) => updateEvent('title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Date *</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => updateEvent('date', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                <select
                  value={newEvent.category}
                  onChange={(e) => updateEvent('category', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.slice(1).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Type *</label>
                <select
                  value={newEvent.event_type}
                  onChange={(e) => updateEvent('event_type', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {EVENT_TYPES.slice(1).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Total Seats *</label>
                <input
                  type="number"
                  placeholder="e.g. 120"
                  value={newEvent.seats}
                  onChange={(e) => updateEvent('seats', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Venue *</label>
                <input
                  type="text"
                  placeholder="e.g. Main Auditorium"
                  value={newEvent.venue}
                  onChange={(e) => updateEvent('venue', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Event Description *</label>
              <textarea
                placeholder="Describe your event..."
                value={newEvent.desc}
                onChange={(e) => updateEvent('desc', e.target.value)}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newEvent.allow_external}
                  onChange={(e) => updateEvent('allow_external', e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
                <span className="text-sm font-semibold text-gray-700">Allow External/Non-VIT Registrations</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-8">If checked, non-VIT students can register for this event</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('overview')}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                disabled={creating}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400"
              >
                {creating ? 'Creating...' : '🚀 Create & Submit'}
              </button>
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