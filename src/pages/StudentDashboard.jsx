import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import eventService from "../api/eventService";
import userService from "../api/userService";
import Navbar from "../components/Navbar";

const EVENT_TYPE_STYLES = {
  National: "bg-red-100 text-red-700 border-red-200",
  Intercollege: "bg-purple-100 text-purple-700 border-purple-200",
  Intracollege: "bg-blue-100 text-blue-700 border-blue-200",
  Department: "bg-green-100 text-green-700 border-green-200",
};
const EVENT_TYPE_ICONS = {
  National: "🏆", Intercollege: "🎓", Intracollege: "🏫", Department: "📚",
};
const EVENT_TYPE_COLORS = {
  National: { bg: "bg-red-50", border: "border-red-200", active: "border-red-400", text: "text-red-700" },
  Intercollege: { bg: "bg-purple-50", border: "border-purple-200", active: "border-purple-400", text: "text-purple-700" },
  Intracollege: { bg: "bg-blue-50", border: "border-blue-200", active: "border-blue-400", text: "text-blue-700" },
  Department: { bg: "bg-green-50", border: "border-green-200", active: "border-green-400", text: "text-green-700" },
};
const EVENT_TYPES = ["All", "National", "Intercollege", "Intracollege", "Department"];

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [registrationDetails, setRegistrationDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("All");
  const [ticketEvent, setTicketEvent] = useState(null);

  useEffect(() => {
    if (user && user.role !== "student") {
      navigate(`/${user.role}-dashboard`, { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [eventsData, regsData] = await Promise.all([
        eventService.getAllEvents(),
        userService.getMyRegistrations()
      ]);
      setEvents(eventsData);
      setMyRegistrations((regsData || []).map(r => r.event_id));
      setRegistrationDetails(regsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const registeredEvents = events.filter(e => myRegistrations.includes(e.id));

  // Group registered events by type
  const registeredByType = EVENT_TYPES.slice(1).reduce((acc, type) => {
    acc[type] = registeredEvents.filter(e => e.event_type === type);
    return acc;
  }, {});

  const typeCounts = EVENT_TYPES.slice(1).reduce((acc, type) => {
    acc[type] = registeredByType[type].length;
    return acc;
  }, {});

  const filteredEvents = selectedType === "All"
    ? events
    : events.filter(e => e.event_type === selectedType);

  const getRegDetail = (eventId) =>
    registrationDetails.find(r => r.event_id === eventId);

  // ✅ Clean subtitle — only VIT academic info, no non-VIT college block
  const userSubtitle = [user?.department, user?.year, user?.campus]
    .filter(Boolean).join(" · ");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {ticketEvent && (
        <TicketModal
          event={ticketEvent}
          user={user}
          regDetail={getRegDetail(ticketEvent.id)}
          onClose={() => setTicketEvent(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ✅ Welcome — no non-VIT college section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {user?.firstName || user?.name?.split(" ")[0]} 👋
          </h1>
          {userSubtitle && <p className="text-gray-500 mt-1">{userSubtitle}</p>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Points" value={user?.points || 0} icon="⭐" color="bg-yellow-50 border-yellow-200" />
          <StatCard label="Registered" value={registeredEvents.length} icon="📋" color="bg-blue-50 border-blue-200" />
          <StatCard label="Upcoming" value={events.filter(e => new Date(e.date) > new Date()).length} icon="📅" color="bg-purple-50 border-purple-200" />
          <StatCard label="Certificates" value={0} icon="🏅" color="bg-green-50 border-green-200" />
        </div>

        {/* ✅ Event Type Breakdown — count cards, clickable to filter */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-3">My Participation by Event Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {EVENT_TYPES.slice(1).map(type => {
              const c = EVENT_TYPE_COLORS[type];
              const isActive = selectedType === type;
              return (
                <button key={type}
                  onClick={() => setSelectedType(isActive ? "All" : type)}
                  className={`p-4 rounded-xl border-2 text-left transition-all
                    ${isActive
                      ? `${c.bg} ${c.active} shadow-sm`
                      : `bg-white ${c.border} hover:shadow-sm`}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{EVENT_TYPE_ICONS[type]}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${EVENT_TYPE_STYLES[type]}`}>
                      {type}
                    </span>
                  </div>
                  <p className={`text-3xl font-bold ${c.text}`}>{typeCounts[type]}</p>
                  <p className="text-xs text-gray-400 mt-0.5">events registered</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ✅ My Registered Events — separate section per event type */}
        {registeredEvents.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-700 mb-3">
              🎟️ My Registered Events
              <span className="ml-2 text-sm font-normal text-gray-400">— tap ticket to show at venue</span>
            </h2>
            <div className="space-y-4">
              {EVENT_TYPES.slice(1).map(type => {
                const typeEvents = registeredByType[type];
                if (typeEvents.length === 0) return null;
                const c = EVENT_TYPE_COLORS[type];
                return (
                  <div key={type} className={`bg-white rounded-2xl shadow-sm border-2 ${c.border} overflow-hidden`}>
                    {/* Type section header */}
                    <div className={`px-5 py-2.5 ${c.bg} border-b ${c.border} flex items-center gap-2`}>
                      <span>{EVENT_TYPE_ICONS[type]}</span>
                      <span className={`font-bold text-sm ${c.text}`}>{type} Events</span>
                      <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full border ${EVENT_TYPE_STYLES[type]}`}>
                        {typeEvents.length}
                      </span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {typeEvents.map(event => (
                        <RegisteredEventRow
                          key={event.id}
                          event={event}
                          onViewTicket={() => setTicketEvent(event)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Events */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-700">All Upcoming Events</h2>
            <button onClick={() => navigate("/events")}
              className="text-sm text-blue-600 hover:underline font-medium">View All →</button>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {EVENT_TYPES.map(type => (
              <button key={type} onClick={() => setSelectedType(type)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all
                  ${selectedType === type ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
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
              {filteredEvents.slice(0, 8).map(event => (
                <EventRow key={event.id} event={event}
                  isRegistered={myRegistrations.includes(event.id)}
                  onViewTicket={myRegistrations.includes(event.id) ? () => setTicketEvent(event) : null} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RegisteredEventRow({ event, onViewTicket }) {
  const registeredCount = event.registered_count || 0;
  const maxParticipants = event.max_participants || event.seats || 100;
  const rawFee = event?.registration_fee !== undefined && event?.registration_fee !== null ? event.registration_fee : event?.fees;
  const isPaid = rawFee && parseInt(rawFee) > 0 && String(rawFee).toLowerCase() !== "free";

  return (
    <div className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-base flex-shrink-0">
          {EVENT_TYPE_ICONS[event.event_type] || "📌"}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate">{event.title}</p>
          <p className="text-xs text-gray-400">
            {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            {" · "}{event.location || event.venue || "TBA"}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-indigo-600 font-medium">👥 {registeredCount}/{maxParticipants}</span>
            {isPaid && <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-1.5 py-0.5 rounded-full">💳 Paid</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full hidden sm:block">✅</span>
        <button onClick={onViewTicket}
          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-95 whitespace-nowrap">
          🎟️ Ticket
        </button>
      </div>
    </div>
  );
}

function EventRow({ event, isRegistered, onViewTicket }) {
  const registeredCount = event.registered_count || 0;
  const maxParticipants = event.max_participants || event.seats || 100;

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-lg">
          {EVENT_TYPE_ICONS[event.event_type] || "📌"}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{event.title}</p>
          <p className="text-xs text-gray-400">
            {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            {" · "}{event.location || "TBA"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">👥 {registeredCount}/{maxParticipants} registered</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${EVENT_TYPE_STYLES[event.event_type] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
          {EVENT_TYPE_ICONS[event.event_type]} {event.event_type}
        </span>
        {isRegistered && (
          <button onClick={onViewTicket}
            className="text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-2 py-0.5 rounded-full transition">
            🎟️
          </button>
        )}
      </div>
    </div>
  );
}

function TicketModal({ event, user, regDetail, onClose }) {
  const rawFee = event?.registration_fee !== undefined && event?.registration_fee !== null ? event.registration_fee : event?.fees;
  const isPaid = rawFee && parseInt(rawFee) > 0 && String(rawFee).toLowerCase() !== "free";
  const feeDisplay = isPaid ? `₹${parseInt(rawFee)}` : "Free";
  const ticketId = `EVT-${event.id}-USR-${user?.id}`;
  const registeredCount = event.registered_count || 0;
  const maxParticipants = event.max_participants || event.seats || 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.75)", backdropFilter: "blur(8px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl bg-white max-h-[90vh] overflow-y-auto">
        <div style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)" }}
          className="px-6 pt-6 pb-8 relative">
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 font-bold">✕</button>
          <div className="text-center">
            <div className="text-4xl mb-2">🎟️</div>
            <h2 className="text-white font-bold text-xl">{event.title}</h2>
            <p className="text-white/60 text-sm mt-1">{event.organising_club || ""}</p>
            <div className="mt-3 flex justify-center gap-2 flex-wrap">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border bg-white/90 ${EVENT_TYPE_STYLES[event.event_type] || ""}`}>
                {EVENT_TYPE_ICONS[event.event_type]} {event.event_type}
              </span>
              {event.allow_external
                ? <span className="bg-green-400/30 border border-green-300/50 text-green-100 text-xs font-bold px-3 py-1 rounded-full">🌐 Open to All</span>
                : <span className="bg-orange-400/30 border border-orange-300/50 text-orange-100 text-xs font-bold px-3 py-1 rounded-full">🔒 VIT Only</span>}
              {isPaid && <span className="bg-yellow-400/30 border border-yellow-300/50 text-yellow-100 text-xs font-bold px-3 py-1 rounded-full">💳 Paid</span>}
            </div>
          </div>
        </div>

        <div className="relative flex items-center px-4 -mt-1">
          <div className="w-6 h-6 rounded-full bg-gray-50 -ml-7 flex-shrink-0" />
          <div className="flex-1 border-t-2 border-dashed border-gray-200 mx-2" />
          <div className="w-6 h-6 rounded-full bg-gray-50 -mr-7 flex-shrink-0" />
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Date", value: new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), icon: "📅" },
              { label: "Venue", value: event.location || event.venue || "TBA", icon: "📍" },
              { label: "Fee", value: feeDisplay, icon: "💰", highlight: isPaid },
              { label: "Registered", value: `${registeredCount} / ${maxParticipants}`, icon: "👥" },
            ].map(({ label, value, icon, highlight }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">{icon} {label}</p>
                <p className={`text-sm font-bold mt-0.5 ${highlight ? "text-orange-600" : "text-gray-800"}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
            <p className="text-xs font-bold text-indigo-700 mb-2 uppercase tracking-wider">Registrant Details</p>
            <div className="space-y-1.5">
              {[
                { label: "Name", value: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() },
                { label: "Email", value: user?.email },
                { label: "Phone", value: regDetail?.reg_phone || user?.phone || "—" },
                { label: "Department", value: regDetail?.reg_department || user?.department || "—" },
                { label: "Year", value: regDetail?.reg_year || user?.year || "—" },
                { label: "GR / Roll", value: regDetail?.reg_gr_number || user?.grNumber || "—" },
                { label: "PRN", value: regDetail?.reg_prn || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold text-gray-800 text-right max-w-[60%] truncate">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center bg-gray-800 rounded-xl py-3 px-4">
            <p className="text-gray-400 text-xs mb-1">Ticket ID · Show at venue entry</p>
            <p className="text-white font-mono font-bold text-sm tracking-widest">{ticketId}</p>
          </div>

          {isPaid && (
            <div className="border-2 border-dashed border-orange-200 rounded-xl p-4 text-center bg-orange-50">
              <p className="text-orange-800 font-bold text-sm mb-2">💳 Payment Required</p>
              <img
                src={event.payment_qr_url ||
                  `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=PAY:${encodeURIComponent(event.title)}:${feeDisplay}`}
                alt="Payment QR"
                className="w-36 h-36 mx-auto rounded-lg border border-orange-200 bg-white p-1"
              />
              <p className="text-orange-700 text-xs mt-2">Amount: <strong>{feeDisplay}</strong></p>
            </div>
          )}

          <p className="text-center text-gray-400 text-xs">📱 Screenshot this ticket · Show at venue entry</p>
          <button onClick={onClose}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all">
            Close
          </button>
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