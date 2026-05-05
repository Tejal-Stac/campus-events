import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import eventService from '../api/eventService'
import api from '../api/axiosConfig'

const initialEventDraft = {
  title: '',
  category: '',
  date: '',
  time: '',
  venue: '',
  fees: 0,
  seats: 1,
  description: '',
  coordinator_remarks: '',
}

function StatusBadge({ status }) {
  const normalized = (status || 'pending').toLowerCase()
  const cls =
    normalized === 'approved' || normalized === 'verified'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : normalized === 'rejected'
      ? 'bg-rose-100 text-rose-700 border-rose-200'
      : 'bg-amber-100 text-amber-700 border-amber-200'

  const label =
    normalized === 'approved'
      ? 'Approved'
      : normalized === 'verified'
      ? 'Verified'
      : normalized === 'rejected'
      ? 'Rejected'
      : 'Pending'

  return <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${cls}`}>{label}</span>
}

function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) return null

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`min-w-64 max-w-96 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
            t.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <span>{t.message}</span>
            <button onClick={() => onDismiss(t.id)} className="text-xs opacity-70 hover:opacity-100">
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ClubDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('events')
  const [events, setEvents] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingEventId, setSavingEventId] = useState(null)
  const [verifyLoadingId, setVerifyLoadingId] = useState(null)
  const [toasts, setToasts] = useState([])

  const [showCreate, setShowCreate] = useState(false)
  const [eventDraft, setEventDraft] = useState(initialEventDraft)
  // Validation errors
  const [formErrors, setFormErrors] = useState({})

  const [editingEvent, setEditingEvent] = useState(null)
  const [editDraft, setEditDraft] = useState(initialEventDraft)

  useEffect(() => {
    if (user && user.role !== 'club_president') {
      navigate('/events', { replace: true })
    }
  }, [user, navigate])

  const pushToast = (message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }

  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  const fetchEvents = async () => {
    try {
      const eventsData = await eventService.getAllEvents({ creator_id: user.id });
      setEvents(eventsData || []);
    } catch (err) {
      console.error('Events fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'club_president') {
      fetchEvents();
    }
  }, [user?.role, user?.id]);

  const pendingVerificationCount = useMemo(
    () => registrations.filter((r) => (r.verification_status || 'pending') === 'pending').length,
    [registrations]
  )

  // Strict validation for event creation
  const validateEventDraft = (draft) => {
    const errors = {}
    if (!draft.title || draft.title.trim().length < 5) errors.title = 'Event name must be at least 5 characters.'
    if (!draft.category || !['Technical','Cultural','Sports'].includes(draft.category)) errors.category = 'Select a valid category.'
    if (!draft.date) errors.date = 'Date is required.'
    else if (new Date(draft.date) < new Date(new Date().toDateString())) errors.date = 'Date must be in the future.'
    if (!draft.venue || draft.venue.trim().length === 0) errors.venue = 'Venue is required.'
    if (draft.fees === '' || isNaN(Number(draft.fees)) || Number(draft.fees) < 0) errors.fees = 'Registration fee must be 0 or more.'
    if (!draft.seats || isNaN(Number(draft.seats)) || Number(draft.seats) < 1) errors.seats = 'Participant limit must be at least 1.'
    if (!draft.description || draft.description.trim().length < 20) errors.description = 'Description must be at least 20 characters.'
    return errors
  }

  const onCreateEvent = async () => {
    const errors = validateEventDraft(eventDraft)
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      pushToast('Please fix the form errors.', 'error')
      return
    }
    try {
      setSavingEventId('create')
      await eventService.createEvent({
        ...eventDraft,
        creator_id: user.id,
        status: 'pending',
        coordinator_remarks: eventDraft.coordinator_remarks || 'Pending Review',
      })
      pushToast('Event submitted. Status is pending for approval.', 'success')
      setShowCreate(false)
      setEventDraft(initialEventDraft)
      setFormErrors({})
      await loadDashboardData()
    } catch (error) {
      pushToast(error.response?.data?.message || 'Failed to create event', 'error')
    } finally {
      setSavingEventId(null)
    }
  }

  const openEditResubmit = (event) => {
    setEditingEvent(event)
    setEditDraft({
      title: event.title || '',
      date: event.date ? new Date(event.date).toISOString().slice(0, 10) : '',
      venue: event.venue || '',
      category: event.category || '',
      description: event.description || '',
      event_type: event.event_type || 'Intracollege',
      seats: event.seats || 100,
      fees: event.fees || 'Free',
    })
  }

  const saveResubmission = async () => {
    if (!editingEvent) return

    try {
      setSavingEventId(editingEvent.id)
      await api.put(`/events/${editingEvent.id}`, {
        ...editDraft,
        status: 'pending',
      })
      pushToast('Event updated and resubmitted for approval', 'success')
      setEditingEvent(null)
      await loadDashboardData()
    } catch (error) {
      pushToast(error.response?.data?.message || 'Failed to resubmit event', 'error')
    } finally {
      setSavingEventId(null)
    }
  }

  const updateVerification = async (registrationId, status) => {
    try {
      setVerifyLoadingId(registrationId)
      await api.patch(`/registrations/${registrationId}/verify`, {
        verification_status: status,
      })
      pushToast(`Registration marked ${status}`, 'success')
      setRegistrations((prev) =>
        prev.map((item) =>
          item.id === registrationId ? { ...item, verification_status: status } : item
        )
      )
    } catch (error) {
      pushToast(error.response?.data?.message || 'Failed to update verification', 'error')
    } finally {
      setVerifyLoadingId(null)
    }
  }

  const transactionDisplay = (value) => {
    if (!value) return <span className="text-gray-400">Not provided</span>
    const isUrl = /^https?:\/\//i.test(value)
    if (isUrl) {
      return (
        <a href={value} target="_blank" rel="noreferrer" className="text-violet-700 font-semibold hover:underline">
          Open Receipt
        </a>
      )
    }
    return <span className="text-gray-700 font-medium">{value}</span>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      <Navbar />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-700 text-white shadow-lg">
          <h1 className="text-3xl font-bold">Club President Portal</h1>
          <p className="mt-2 text-violet-100">Manage your club events and verify participant payments</p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex rounded-xl border border-violet-200 bg-white p-1">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                activeTab === 'events' ? 'bg-violet-600 text-white' : 'text-violet-700'
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                activeTab === 'verification' ? 'bg-violet-600 text-white' : 'text-violet-700'
              }`}
            >
              Verification Hub ({pendingVerificationCount})
            </button>
          </div>
          {/* Only show Create Event for club_president */}
          {activeTab === 'events' && user?.role === 'club_president' && (
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold"
            >
              Create Event
            </button>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-500">Loading dashboard...</div>
        ) : activeTab === 'events' ? (
          <div className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-violet-50 border-b border-violet-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-violet-900">Event</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-violet-900">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-violet-900">Venue</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-violet-900">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-violet-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-10 text-center text-gray-500">
                        No events created yet.
                      </td>
                    </tr>
                  )}
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-violet-50 align-top">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-gray-900">{event.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{event.category || 'General'} • {event.event_type || 'Intracollege'}</div>
                        {event.status === 'rejected' && event.coordinator_remarks && (
                          <div className="mt-3 p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 text-xs">
                            <div className="font-semibold mb-1">Coordinator Remarks</div>
                            <div>{event.coordinator_remarks}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {event.date ? new Date(event.date).toLocaleDateString('en-IN') : '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">{event.venue || '-'}</td>
                      <td className="px-4 py-4"><StatusBadge status={event.status} /></td>
                      <td className="px-4 py-4">
                        {event.status === 'rejected' ? (
                          <button
                            onClick={() => openEditResubmit(event)}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                          >
                            Edit & Resubmit
                          </button>
                        ) : (
                          <span className="text-xs text-gray-500">No action</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-violet-50 border-b border-violet-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-violet-900">Student Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-violet-900">Event Title</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-violet-900">Transaction ID / Receipt</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-violet-900">Verification Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-violet-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-10 text-center text-gray-500">
                        No registrations found for your events.
                      </td>
                    </tr>
                  )}
                  {registrations.map((r) => {
                    const studentName = r.reg_name || `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Participant'
                    const status = r.verification_status || 'pending'
                    const isPending = status === 'pending'
                    return (
                      <tr key={r.id} className="border-b border-violet-50">
                        <td className="px-4 py-4 text-sm text-gray-800">{studentName}</td>
                        <td className="px-4 py-4 text-sm text-gray-800">{r.event_title || '-'}</td>
                        <td className="px-4 py-4 text-sm">{transactionDisplay(r.receipt_image_url)}</td>
                        <td className="px-4 py-4"><StatusBadge status={status} /></td>
                        <td className="px-4 py-4">
                          {isPending ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateVerification(r.id, 'verified')}
                                disabled={verifyLoadingId === r.id}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50"
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => updateVerification(r.id, 'rejected')}
                                disabled={verifyLoadingId === r.id}
                                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">Completed</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {(showCreate || editingEvent) && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-violet-100">
            <div className="px-6 py-4 border-b border-violet-100">
              <h2 className="text-lg font-bold text-violet-900">{showCreate ? 'Create Event' : 'Edit & Resubmit Event'}</h2>
            </div>
            <div className="p-6 space-y-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Event Name *</label>
              <input
                value={showCreate ? eventDraft.title : editDraft.title}
                onChange={(e) =>
                  showCreate
                    ? setEventDraft((p) => ({ ...p, title: e.target.value }))
                    : setEditDraft((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Event name (min 5 chars)"
                className={`w-full px-3 py-2 rounded-lg border ${formErrors.title ? 'border-rose-400' : 'border-violet-200'} focus:ring-2 focus:ring-violet-300 focus:outline-none`}
              />
              {formErrors.title && <div className="text-xs text-rose-600 mb-1">{formErrors.title}</div>}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                  <select
                    value={showCreate ? eventDraft.category : editDraft.category}
                    onChange={(e) =>
                      showCreate
                        ? setEventDraft((p) => ({ ...p, category: e.target.value }))
                        : setEditDraft((p) => ({ ...p, category: e.target.value }))
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${formErrors.category ? 'border-rose-400' : 'border-violet-200'} focus:ring-2 focus:ring-violet-300 focus:outline-none`}
                  >
                    <option value="">Select category</option>
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                  </select>
                  {formErrors.category && <div className="text-xs text-rose-600 mb-1">{formErrors.category}</div>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={showCreate ? eventDraft.date : editDraft.date}
                    onChange={(e) =>
                      showCreate
                        ? setEventDraft((p) => ({ ...p, date: e.target.value }))
                        : setEditDraft((p) => ({ ...p, date: e.target.value }))
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${formErrors.date ? 'border-rose-400' : 'border-violet-200'} focus:ring-2 focus:ring-violet-300 focus:outline-none`}
                  />
                  {formErrors.date && <div className="text-xs text-rose-600 mb-1">{formErrors.date}</div>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Venue *</label>
                  <input
                    value={showCreate ? eventDraft.venue : editDraft.venue}
                    onChange={(e) =>
                      showCreate
                        ? setEventDraft((p) => ({ ...p, venue: e.target.value }))
                        : setEditDraft((p) => ({ ...p, venue: e.target.value }))
                    }
                    placeholder="Venue"
                    className={`w-full px-3 py-2 rounded-lg border ${formErrors.venue ? 'border-rose-400' : 'border-violet-200'} focus:ring-2 focus:ring-violet-300 focus:outline-none`}
                  />
                  {formErrors.venue && <div className="text-xs text-rose-600 mb-1">{formErrors.venue}</div>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Registration Fee (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    value={showCreate ? eventDraft.fees : editDraft.fees}
                    onChange={(e) =>
                      showCreate
                        ? setEventDraft((p) => ({ ...p, fees: e.target.value }))
                        : setEditDraft((p) => ({ ...p, fees: e.target.value }))
                    }
                    placeholder="0"
                    className={`w-full px-3 py-2 rounded-lg border ${formErrors.fees ? 'border-rose-400' : 'border-violet-200'} focus:ring-2 focus:ring-violet-300 focus:outline-none`}
                  />
                  {formErrors.fees && <div className="text-xs text-rose-600 mb-1">{formErrors.fees}</div>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Participant Limit *</label>
                  <input
                    type="number"
                    min="1"
                    value={showCreate ? eventDraft.seats : editDraft.seats}
                    onChange={(e) =>
                      showCreate
                        ? setEventDraft((p) => ({ ...p, seats: e.target.value }))
                        : setEditDraft((p) => ({ ...p, seats: e.target.value }))
                    }
                    placeholder="1"
                    className={`w-full px-3 py-2 rounded-lg border ${formErrors.seats ? 'border-rose-400' : 'border-violet-200'} focus:ring-2 focus:ring-violet-300 focus:outline-none`}
                  />
                  {formErrors.seats && <div className="text-xs text-rose-600 mb-1">{formErrors.seats}</div>}
                </div>
              </div>

              <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
              <textarea
                value={showCreate ? eventDraft.description : editDraft.description}
                onChange={(e) =>
                  showCreate
                    ? setEventDraft((p) => ({ ...p, description: e.target.value }))
                    : setEditDraft((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                placeholder="Event details (min 20 chars)"
                className={`w-full px-3 py-2 rounded-lg border ${formErrors.description ? 'border-rose-400' : 'border-violet-200'} focus:ring-2 focus:ring-violet-300 focus:outline-none`}
              />
              {formErrors.description && <div className="text-xs text-rose-600 mb-1">{formErrors.description}</div>}

              <input
                type="hidden"
                value={showCreate ? eventDraft.coordinator_remarks : editDraft.coordinator_remarks}
                readOnly
              />
            </div>
            <div className="px-6 py-4 border-t border-violet-100 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowCreate(false)
                  setEditingEvent(null)
                  setFormErrors({})
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold"
              >
                Cancel
              </button>
              {showCreate ? (
                <button
                  onClick={onCreateEvent}
                  disabled={savingEventId === 'create'}
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold disabled:opacity-50"
                >
                  {savingEventId === 'create' ? 'Saving...' : 'Create'}
                </button>
              ) : (
                <button
                  onClick={saveResubmission}
                  disabled={savingEventId === editingEvent?.id}
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold disabled:opacity-50"
                >
                  {savingEventId === editingEvent?.id ? 'Resubmitting...' : 'Resubmit'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
