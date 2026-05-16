import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import eventService from "../api/eventService";
import Navbar from "../components/Navbar";
import EventCard from "../components/EventCard";
import { Users, Mail, Phone, Calendar, X, AlertCircle } from "lucide-react";
import axios from "axios";

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
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("overview");
  const [editingEventId, setEditingEventId] = useState(null);
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
  const [rejectedEvents, setRejectedEvents] = useState([]);
  const [verifyingRegistrationId, setVerifyingRegistrationId] = useState(null);

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

  const handleVerifyStudent = async (registrationId) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/events/registrations/${registrationId}/verify`,
        { verification_status: 'verified' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showAlert('✅ Student verified successfully!', 'success');
      
      // Update participants list
      const updatedParticipants = participants.map(p => 
        p.id === registrationId ? { ...p, verification_status: 'verified' } : p
      );
      setParticipants(updatedParticipants);
      setVerifyingRegistrationId(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to verify student';
      showAlert(errorMsg, 'error');
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

  // [FIX] Fetch events with all statuses (approved, pending, rejected) to show rejected events to faculty
  useEffect(() => {
    const fetchAllStatusEvents = async () => {
      try {
        // Fetch approved events (default)
        const approvedEvents = await eventService.getAllEvents({ status: 'approved' });
        // Fetch pending events (awaiting coordinator approval)
        const pendingEvents = await eventService.getAllEvents({ status: 'pending' });
        // Fetch rejected events (so faculty can see feedback and resubmit)
        const rejectedEvents = await eventService.getAllEvents({ status: 'rejected' });
        
        // Combine all events from all statuses
        const allEvents = [
          ...(approvedEvents || []),
          ...(pendingEvents || []),
          ...(rejectedEvents || [])
        ];
        
        // Remove duplicates by event ID
        const uniqueEvents = Array.from(
          new Map(allEvents.map(e => [e.id, e])).values()
        );
        
        setEvents(uniqueEvents);
        console.log(`Loaded ${uniqueEvents.length} total events (approved: ${approvedEvents?.length || 0}, pending: ${pendingEvents?.length || 0}, rejected: ${rejectedEvents?.length || 0})`);
      } catch (err) {
        console.error('Error fetching events:', err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllStatusEvents();
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
            { id: 'students', label: '👥 My Students' },
            { id: 'insights', label: '📈 Insights & Reports' },
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

        {/* My Students Tab - Phase 2 */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">👥 My Students</h2>
              <p className="text-gray-500">Verify student registrations for your events</p>
            </div>

            {events.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-gray-500 text-lg font-medium">No events created yet</p>
                <p className="text-gray-400 text-sm mt-2">Create an event to see registered students here</p>
              </div>
            ) : (
              events.map(event => (
                <div key={event.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        📅 {new Date(event.date).toLocaleDateString('en-IN')} • 📍 {event.venue}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {event.status === 'rejected' && (
                        <span className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs font-semibold">
                          ❌ Rejected
                        </span>
                      )}
                      {event.status === 'approved' && (
                        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold">
                          ✅ Approved
                        </span>
                      )}
                      {event.status === 'pending' && (
                        <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold">
                          ⏳ Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Show rejection reason if rejected */}
                  {event.status === 'rejected' && event.coordinator_remarks && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                      <p className="text-sm font-semibold text-rose-900">💬 Coordinator Feedback:</p>
                      <p className="text-sm text-rose-800 mt-1">{event.coordinator_remarks}</p>
                      <button
                        onClick={() => {
                          setEditingEventId(event.id);
                          setNewEvent({
                            ...newEvent,
                            title: event.title,
                            date: event.date,
                            category: event.category,
                            seats: String(event.seats),
                            venue: event.venue,
                            desc: event.description,
                            event_type: event.event_type,
                          });
                          setActiveTab('create');
                        }}
                        className="mt-2 px-4 py-2 bg-rose-600 text-white text-sm rounded-lg font-semibold hover:bg-rose-700 transition"
                      >
                        ✏️ Edit & Resubmit
                      </button>
                    </div>
                  )}

                  {/* Participants Table */}
                  {participants.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No students registered yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Receipt</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {participants.map(participant => (
                            <tr key={participant.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">{participant.name || participant.email}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{participant.email}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{participant.phone || '-'}</td>
                              <td className="px-4 py-3">
                                <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                                  participant.verification_status === 'verified'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : participant.verification_status === 'rejected'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {participant.verification_status === 'verified' ? '✅ Verified' : 
                                   participant.verification_status === 'rejected' ? '❌ Rejected' : 
                                   '⏳ Pending'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {participant.receipt_image_url ? (
                                  <a href={participant.receipt_image_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm">
                                    📸 View
                                  </a>
                                ) : (
                                  <span className="text-gray-400 text-sm">No receipt</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => setVerifyingRegistrationId(participant.id)}
                                  disabled={participant.verification_status === 'verified'}
                                  className="px-3 py-1 bg-emerald-500 text-white text-sm rounded-lg font-semibold hover:bg-emerald-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                  {participant.verification_status === 'verified' ? '✓ Verified' : 'Verify'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Button to view participants if not already viewing */}
                  {!viewingParticipants || viewingParticipants.id !== event.id ? (
                    <button
                      onClick={() => handleViewParticipants(event.id, event.title)}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                    >
                      👁️ View All Registrations
                    </button>
                  ) : null}
                </div>
              ))
            )}
          </div>
        )}

        {/* Insights & Reports Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">📈 Insights & Reports</h2>
              <p className="text-gray-500">Track attendance and manage your event lifecycle</p>
            </div>

            {events.filter(e => e.created_by === user?.id || e.faculty_id === user?.id || e.coordinator_id === user?.id).length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-gray-500 text-lg font-medium">No events to manage</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {events.filter(e => e.created_by === user?.id || e.faculty_id === user?.id || e.coordinator_id === user?.id).map(event => (
                  <div key={event.id} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1" title={event.title}>{event.title}</h3>
                        {event.is_closed ? (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">Registrations Closed</span>
                        ) : (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
                            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse mr-1"></span>
                            Live
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                          <p className="text-xs text-indigo-600 font-semibold uppercase">Registrations</p>
                          <p className="text-3xl font-bold text-indigo-900 mt-1">{event.registered_count || 0}</p>
                        </div>
                        <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                          <p className="text-xs text-teal-600 font-semibold uppercase">Attendance</p>
                          <p className="text-3xl font-bold text-teal-900 mt-1">{event.attendance_count || 0}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <button
                          onClick={async () => {
                            try {
                              const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/events/${event.id}/export-csv`, { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' });
                              const url = window.URL.createObjectURL(new Blob([res.data]));
                              const link = document.createElement('a');
                              link.href = url;
                              link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}_attendees.csv`);
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            } catch (err) {
                              // Fallback if API fails: try fetching participants and creating CSV manually
                              handleViewParticipants(event.id, event.title);
                            }
                          }}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-semibold transition"
                        >
                          Download Attendee List
                        </button>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={async () => {
                            if (!window.confirm(`Are you sure you want to ${event.is_closed ? 'open' : 'close'} registrations for this event?`)) return;
                            try {
                              await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/events/${event.id}/close`, { is_closed: !event.is_closed }, { headers: { Authorization: `Bearer ${token}` } });
                              setEvents(events.map(e => e.id === event.id ? { ...e, is_closed: !event.is_closed } : e));
                              showAlert(`Event ${!event.is_closed ? 'closed' : 'opened'} successfully`, 'success');
                            } catch (err) {
                              showAlert('Failed to update event status', 'error');
                            }
                          }}
                          className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition ${event.is_closed ? 'border-gray-300 text-gray-700 hover:bg-gray-50' : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'}`}
                        >
                          {event.is_closed ? 'Re-open Event' : 'Close Event'}
                        </button>

                        {event.report_url && (
                          <a
                            href={event.report_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 text-center bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 rounded-lg text-sm font-semibold transition"
                          >
                            Download Report
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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