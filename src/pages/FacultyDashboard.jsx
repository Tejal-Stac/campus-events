import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import eventService from "../api/eventService";
import Navbar from "../components/Navbar";
import EventCard from "../components/EventCard";
import { Users, Mail, Phone, Calendar, X, AlertCircle } from "lucide-react";

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
  const [newEvent, setNewEvent] = useState({ 
    title: '', 
    date: '', 
    category: '', 
    seats: '', 
    venue: '', 
    desc: '', 
    event_type: 'Intracollege', 
    allow_external: false,
    organizing_dept: user?.department || '',
    fees: '',
    special_guest: '',
    amenities: []
  });
  const [creating, setCreating] = useState(false);
  const [alert, setAlert] = useState(null);
  const [viewingParticipants, setViewingParticipants] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantsError, setParticipantsError] = useState(null);

  useEffect(() => {
    if (user && user.role !== "faculty") {
      navigate(`/${user.role}-dashboard`, { replace: true });
    }
  }, [user, navigate]);

  const updateEvent = (field, value) => setNewEvent(prev => ({ ...prev, [field]: value }));

  const toggleAmenity = (amenity) => {
    setNewEvent(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

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
      
      case 'viewParticipants':
        // Fetch and display participants
        await handleViewParticipants(eventId, event.title);
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

  const handleViewParticipants = async (eventId, eventTitle) => {
    try {
      if (!eventId) {
        showAlert('❌ Event ID is missing', 'error');
        return;
      }
      
      setLoadingParticipants(true);
      setParticipantsError(null);
      setViewingParticipants({ id: eventId, title: eventTitle });
      
      // ✅ Call service - returns array directly
      const response = await eventService.getEventParticipants(eventId);
      
      // ✅ Defensive coding: extract array from response
      const data = response || [];
      
      // ✅ Verify we have an array
      if (!Array.isArray(data)) {
        console.error("Expected array but got:", typeof data, data);
        setParticipants([]);
        setParticipantsError('Unexpected response format from server');
        showAlert('⚠️ Unexpected response format from server', 'error');
        return;
      }
      
      // ✅ Set participants array
      setParticipants(data);
      const count = data.length;
      console.log(`✅ Loaded ${count} participant${count !== 1 ? 's' : ''} for "${eventTitle}"`);
      
      // ✅ Show success message
      if (count === 0) {
        showAlert('📋 No students have registered yet', 'info');
      } else {
        showAlert(`✅ Loaded ${count} participant${count !== 1 ? 's' : ''}`, 'success');
      }
    } catch (err) {
      console.error('❌ Error fetching participants:', err);
      
      // ✅ Better error handling
      let errorMsg = 'Failed to load participants';
      if (err.response?.status === 404) {
        errorMsg = 'Event not found';
      } else if (err.response?.status === 403) {
        errorMsg = 'You can only view participants for your own events';
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setParticipantsError(errorMsg);
      showAlert(`❌ ${errorMsg}`, 'error');
      setParticipants([]);
    } finally {
      setLoadingParticipants(false);
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
        // New fields
        organizing_dept: newEvent.organizing_dept || user?.department || '',
        fees: newEvent.fees || 'Free',
        special_guest: newEvent.special_guest || null,
        amenities: newEvent.amenities.length > 0 ? newEvent.amenities : null,
      };
      
      const response = await eventService.createEvent(eventPayload);
      
      showAlert("✅ Event created successfully! Awaiting Dean approval.", "success");
      setNewEvent({ 
        title: '', date: '', category: '', seats: '', venue: '', desc: '', 
        event_type: 'Intracollege', allow_external: false,
        organizing_dept: user?.department || '',
        fees: '',
        special_guest: '',
        amenities: []
      });
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

  // If viewing participants, show modal instead of dashboard
  if (viewingParticipants) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        {/* Participants Modal */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{viewingParticipants.title}</h2>
                <p className="text-gray-500 text-sm mt-1">
                  {participants.length} participant{participants.length !== 1 ? 's' : ''} registered
                </p>
              </div>
              <button
                onClick={() => {
                  setViewingParticipants(null);
                  setParticipants([]);
                  setParticipantsError(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Body - Table */}
            {loadingParticipants ? (
              <div className="flex justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Loading participants...</p>
                </div>
              </div>
            ) : participantsError ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-red-600 font-semibold">Error Loading Participants</p>
                <p className="text-gray-500 text-sm mt-2">{participantsError}</p>
              </div>
            ) : participants === null || participants === undefined || participants.length === 0 ? (
              <div className="text-center py-16 px-6">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No students have registered yet</p>
                <p className="text-gray-400 text-sm">Participants will appear here once they register for this event</p>
              </div>
            ) : (
              <div className="px-6 py-4">
                {/* Grid-based Table Header */}
                <div className="grid grid-cols-12 gap-4 pb-4 mb-4 border-b border-gray-200">
                  <div className="col-span-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Name</span>
                  </div>
                  <div className="col-span-3 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Email</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Phone</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Department</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">College</span>
                  </div>
                  <div className="col-span-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Joined</span>
                  </div>
                </div>

                {/* Grid-based Table Rows */}
                <div className="space-y-0 max-h-96 overflow-y-auto">
                  {Array.isArray(participants) && participants.map((participant, index) => {
                    if (!participant) return null;
                    
                    // ✅ Fallback for name: use email prefix if name is missing
                    const displayName = participant.name || participant.email?.split('@')[0] || 'N/A';
                    
                    return (
                      <div 
                        key={participant.registration_id || participant.id || index} 
                        className={`grid grid-cols-12 gap-4 py-4 px-3 rounded-lg transition-colors ${
                          index % 2 === 0 ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        {/* Name Cell */}
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-[#1C1D1F] truncate">
                            {displayName}
                          </p>
                        </div>

                        {/* Email Cell */}
                        <div className="col-span-3">
                          <p className="text-sm text-slate-600 truncate">
                            {participant.email || 'N/A'}
                          </p>
                        </div>

                        {/* Phone Cell */}
                        <div className="col-span-2">
                          <p className="text-sm text-slate-600">
                            {participant.phone || 'N/A'}
                          </p>
                        </div>

                        {/* Department Cell */}
                        <div className="col-span-2">
                          <p className="text-sm text-slate-600 truncate">
                            {participant.department || 'N/A'}
                          </p>
                        </div>

                        {/* College Badge Cell */}
                        <div className="col-span-2 flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            participant.college_type === 'vitian' 
                              ? 'bg-blue-100 text-blue-700 border border-blue-300'
                              : participant.college_type === 'non_vitian'
                                ? 'bg-amber-100 text-amber-700 border border-amber-300'
                                : 'bg-gray-100 text-gray-700 border border-gray-300'
                          }`}>
                            {participant.college_type === 'vitian' ? 'VIT' : participant.college_type === 'non_vitian' ? 'Non-VIT' : 'Guest'}
                          </span>
                        </div>

                        {/* Registration Date Cell */}
                        <div className="col-span-1">
                          <p className="text-xs text-slate-500 whitespace-nowrap">
                            {participant.registered_at ? new Date(participant.registered_at).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric'
                            }) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="text-sm text-slate-600">
                Total participants: 
                <span className="ml-2 font-semibold text-[#1C1D1F]">
                  {participants.length}
                </span>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    // Download as CSV
                    if (participants.length === 0) {
                      showAlert('⚠️ No participants to download', 'warning');
                      return;
                    }

                    const headers = ['Name', 'Email', 'Phone', 'Department', 'College Type', 'PRN', 'Year', 'Division', 'Registered'];
                    const rows = participants.map(p => {
                      const displayName = p.name || p.email?.split('@')[0] || '';
                      return [
                        displayName,
                        p.email || '',
                        p.phone || '',
                        p.department || '',
                        p.college_type || '',
                        p.prn || '',
                        p.year || '',
                        p.division || '',
                        p.registered_at ? new Date(p.registered_at).toLocaleString() : ''
                      ];
                    });

                    const csvContent = [
                      ['Event: ' + viewingParticipants.title],
                      ['Downloaded on ' + new Date().toLocaleString()],
                      ['Total Participants: ' + participants.length],
                      [''],
                      headers,
                      ...rows
                    ].map(row => 
                      row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')
                    ).join('\n');

                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `participants_${viewingParticipants.id}_${Date.now()}.csv`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(link.href);

                    showAlert('✅ Participants list downloaded as CSV');
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download CSV
                </button>
                <button
                  onClick={() => {
                    setViewingParticipants(null);
                    setParticipants([]);
                    setParticipantsError(null);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

            {/* Logistics & Amenities Section */}
            <div className="mb-6 p-5 border border-slate-200 rounded-lg bg-slate-50">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>⚙️ Logistics & Amenities</span>
              </h3>

              {/* Organizing Department */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Organizing Department</label>
                <select
                  value={newEvent.organizing_dept}
                  onChange={(e) => updateEvent('organizing_dept', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Business Administration">Business Administration</option>
                  <option value="Multi-Department">Multi-Department Event</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Default: Your department ({user?.department || 'Not set'})</p>
              </div>

              {/* Registration Fees */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Registration Fees</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-gray-600 font-semibold">₹</span>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    step="10"
                    value={newEvent.fees}
                    onChange={(e) => updateEvent('fees', e.target.value)}
                    className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Leave blank or 0 for free event</p>
              </div>

              {/* Special Guest */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Special Guest/Speaker (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. John Doe, CEO of TechCorp"
                  value={newEvent.special_guest}
                  onChange={(e) => updateEvent('special_guest', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Amenities Checkboxes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Amenities & Incentives</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={newEvent.amenities.includes('Food/Refreshments')}
                      onChange={() => toggleAmenity('Food/Refreshments')}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="text-sm text-gray-700">🍔 Food/Refreshments</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={newEvent.amenities.includes('Certificates/Gifts')}
                      onChange={() => toggleAmenity('Certificates/Gifts')}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="text-sm text-gray-700">🎁 Certificates/Gifts</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={newEvent.amenities.includes('Duty Leave/Attendance')}
                      onChange={() => toggleAmenity('Duty Leave/Attendance')}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="text-sm text-gray-700">📋 Duty Leave/Attendance</span>
                  </label>
                </div>
              </div>
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