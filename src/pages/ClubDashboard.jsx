import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import EventCard from '../components/EventCard'
import eventService from '../api/eventService'
import api from '../api/axiosConfig'
import { groupEventsByStatus } from '../utils/eventHelpers'

const initialFormData = {
  title: '',
  category: '',
  start_date: '',
  end_date: '',
  venue: '',
  registration_fee: 0,
  max_participants: 1,
  description: '',
  external_allowed: false,
  coordinator_remarks: '',
  club_name: '',
  special_guest: '',
  amenities: '',
  audience_type: 'All',
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
  const [statusTab, setStatusTab] = useState('upcoming')
  const [events, setEvents] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingEventId, setSavingEventId] = useState(null)
  const [verifyLoadingId, setVerifyLoadingId] = useState(null)
  const [toasts, setToasts] = useState([])
  const [posterFile, setPosterFile] = useState(null)

  const [showCreate, setShowCreate] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  // Validation errors
  const [formErrors, setFormErrors] = useState({})

  const [editingEvent, setEditingEvent] = useState(null)
  const [editDraft, setEditDraft] = useState(initialFormData)

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

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const eventsData = await eventService.getAllEvents({ creator_id: user.id })
      setEvents(eventsData || [])
      // ✅ Fix: fetch registrations by creator_id (president is a student-role user)
      const regData = await api.get(`/events/registrations/managed/${user.id}`)
      console.log('📊 Verification tab registrations:', regData.data)
      setRegistrations(regData.data?.data || [])
    } catch (err) {
      console.error('Dashboard load failed:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'club_president') {
      loadDashboardData()
    }
  }, [user?.role, user?.id])

  const pendingVerificationCount = useMemo(
    () => registrations.filter((r) => (r.verification_status || 'pending') === 'pending').length,
    [registrations]
  )

  const validateEventDraft = (draft) => {
    const errors = {}
    if (!draft.title || draft.title.trim().length < 5) errors.title = 'Event name must be at least 5 characters.'
    if (!draft.category || !['Technical','Cultural','Sports','Workshop'].includes(draft.category)) errors.category = 'Select a valid category.'
    if (!draft.start_date) errors.start_date = 'Start date & time is required.'
    if (!draft.venue || draft.venue.trim().length === 0) errors.venue = 'Venue is required.'
    if (draft.registration_fee === '' || isNaN(Number(draft.registration_fee)) || Number(draft.registration_fee) < 0) errors.registration_fee = 'Registration fee must be 0 or more.'
    if (!draft.max_participants || isNaN(Number(draft.max_participants)) || Number(draft.max_participants) < 1) errors.max_participants = 'Participant limit must be at least 1.'
    if (!draft.description || draft.description.trim().length < 20) errors.description = 'Description must be at least 20 characters.'
    return errors
  }

  const onCreateEvent = async () => {
    const errors = validateEventDraft(formData)
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      pushToast('Please fix the form errors.', 'error')
      return
    }
    try {
      setSavingEventId('create')
      const fd = new FormData()
      Object.entries({ ...formData, creator_id: user.id, status: 'pending' }).forEach(([k, v]) => fd.append(k, v))
      if (posterFile) fd.append('poster', posterFile)
      await api.post('/events', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      pushToast('Event submitted. Status is pending for approval.', 'success')
      setShowCreate(false)
      setFormData(initialFormData)
      setPosterFile(null)
      setFormErrors({})
      await loadDashboardData()
    } catch (error) {
      pushToast(error.response?.data?.message || 'Failed to create event', 'error')
    } finally {
      setSavingEventId(null)
    }
  }

  const grouped = useMemo(() => groupEventsByStatus(events), [events])
  const STATUS_TABS = [
    { key: 'live',     label: '🔴 Live',     color: 'bg-red-600' },
    { key: 'upcoming', label: '📅 Upcoming', color: 'bg-violet-600' },
    { key: 'past',     label: '🏁 Past',     color: 'bg-gray-500' },
  ]

  const openEditResubmit = (event) => {
    setEditingEvent(event)
    setEditDraft({
      title: event.title || '',
      start_date: event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
      end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
      venue: event.venue || '',
      category: event.category || '',
      description: event.description || '',
      max_participants: event.max_participants || 1,
      registration_fee: event.registration_fee || 0,
      external_allowed: !!event.external_allowed,
      coordinator_remarks: event.coordinator_remarks || '',
      club_name: event.club_name || '',
      special_guest: event.special_guest || '',
      amenities: event.amenities || '',
      audience_type: event.audience_type || 'All',
    })
  }

  const saveResubmission = async () => {
    const errors = validateEventDraft(editDraft)
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      pushToast('Please fix the form errors.', 'error')
      return
    }
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
          <div>
            {/* Status sub-tabs */}
            <div className="flex gap-2 mb-5">
              {STATUS_TABS.map(t => (
                <button key={t.key}
                  onClick={() => setStatusTab(t.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    statusTab === t.key ? `${t.color} text-white shadow` : 'bg-white border border-violet-200 text-violet-700 hover:bg-violet-50'
                  }`}
                >
                  {t.label}
                  <span className="ml-2 bg-white/30 text-xs px-1.5 py-0.5 rounded-full">
                    {grouped[t.key]?.length || 0}
                  </span>
                </button>
              ))}
            </div>

            {grouped[statusTab]?.length === 0 ? (
              <div className="bg-white rounded-2xl border border-violet-100 p-12 text-center text-gray-400">
                No {statusTab} events.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {grouped[statusTab].map(event => (
                  <div key={event.id} className="relative">
                    <EventCard
                      event={event}
                      role="club_president"
                      onAction={() => {}}
                      isOwner={true}
                    />
                    {event.status === 'rejected' && (
                      <div className="mt-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                        <p className="font-bold mb-1">Coordinator Remarks</p>
                        <p>{event.coordinator_remarks}</p>
                        <button onClick={() => openEditResubmit(event)}
                          className="mt-2 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold">
                          Edit & Resubmit
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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
                    const studentName = r.student_name || r.name || r.reg_name || `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Participant'
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
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-violet-100 flex flex-col" style={{ maxHeight: '85vh' }}>
            <div className="px-6 py-4 border-b border-violet-100 flex-shrink-0">
              <h2 className="text-lg font-bold text-violet-900">{showCreate ? 'Create Event' : 'Edit & Resubmit Event'}</h2>
            </div>
            <div className="p-6 space-y-3 overflow-y-auto flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Event Name *</label>
              <input
                required
                value={showCreate ? formData.title : editDraft.title}
                onChange={(e) =>
                  showCreate
                    ? setFormData((p) => ({ ...p, title: e.target.value }))
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
                    required
                    value={showCreate ? formData.category : editDraft.category}
                    onChange={(e) =>
                      showCreate
                        ? setFormData((p) => ({ ...p, category: e.target.value }))
                        : setEditDraft((p) => ({ ...p, category: e.target.value }))
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${formErrors.category ? 'border-rose-400' : 'border-violet-200'} focus:ring-2 focus:ring-violet-300 focus:outline-none`}
                  >
                    <option value="">Select category</option>
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Workshop">Workshop</option>
                  </select>
                  {formErrors.category && <div className="text-xs text-rose-600 mb-1">{formErrors.category}</div>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Venue *</label>
                  <input
                    required
                    value={showCreate ? formData.venue : editDraft.venue}
                    onChange={(e) =>
                      showCreate
                        ? setFormData((p) => ({ ...p, venue: e.target.value }))
                        : setEditDraft((p) => ({ ...p, venue: e.target.value }))
                    }
                    placeholder="Venue"
                    className={`w-full px-3 py-2 rounded-lg border ${formErrors.venue ? 'border-rose-400' : 'border-violet-200'} focus:ring-2 focus:ring-violet-300 focus:outline-none`}
                  />
                  {formErrors.venue && <div className="text-xs text-rose-600 mb-1">{formErrors.venue}</div>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={showCreate ? formData.start_date : editDraft.start_date}
                    onChange={(e) =>
                      showCreate
                        ? setFormData((p) => ({ ...p, start_date: e.target.value }))
                        : setEditDraft((p) => ({ ...p, start_date: e.target.value }))
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${formErrors.start_date ? 'border-rose-400' : 'border-violet-200'} focus:ring-2 focus:ring-violet-300 focus:outline-none`}
                  />
                  {formErrors.start_date && <div className="text-xs text-rose-600 mb-1">{formErrors.start_date}</div>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={showCreate ? formData.end_date : editDraft.end_date}
                    onChange={(e) =>
                      showCreate
                        ? setFormData((p) => ({ ...p, end_date: e.target.value }))
                        : setEditDraft((p) => ({ ...p, end_date: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-violet-200 focus:ring-2 focus:ring-violet-300 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Event Poster / PPT</label>
                <input
                  type="file"
                  accept="image/*,.pdf,.ppt,.pptx"
                  onChange={(e) => setPosterFile(e.target.files[0] || null)}
                  className="w-full px-3 py-2 rounded-lg border border-violet-200 text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-violet-100 file:text-violet-700 file:font-semibold hover:file:bg-violet-200"
                />
                {posterFile && <p className="text-xs text-violet-600 mt-1">📎 {posterFile.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Registration Fee (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={showCreate ? formData.registration_fee : editDraft.registration_fee}
                    onChange={(e) =>
                      showCreate
                        ? setFormData((p) => ({ ...p, registration_fee: e.target.value }))
                        : setEditDraft((p) => ({ ...p, registration_fee: e.target.value }))
                    }
                    placeholder="0"
                    className={`w-full px-3 py-2 rounded-lg border ${formErrors.registration_fee ? 'border-rose-400' : 'border-violet-200'} focus:ring-2 focus:ring-violet-300 focus:outline-none`}
                  />
                  {formErrors.registration_fee && <div className="text-xs text-rose-600 mb-1">{formErrors.registration_fee}</div>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Participant Limit *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={showCreate ? formData.max_participants : editDraft.max_participants}
                    onChange={(e) =>
                      showCreate
                        ? setFormData((p) => ({ ...p, max_participants: e.target.value }))
                        : setEditDraft((p) => ({ ...p, max_participants: e.target.value }))
                    }
                    placeholder="1"
                    className={`w-full px-3 py-2 rounded-lg border ${formErrors.max_participants ? 'border-rose-400' : 'border-violet-200'} focus:ring-2 focus:ring-violet-300 focus:outline-none`}
                  />
                  {formErrors.max_participants && <div className="text-xs text-rose-600 mb-1">{formErrors.max_participants}</div>}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer mt-2 p-2 rounded-lg border border-violet-100 bg-violet-50">
                  <input
                    type="checkbox"
                    checked={showCreate ? formData.external_allowed : editDraft.external_allowed}
                    onChange={(e) =>
                      showCreate
                        ? setFormData((p) => ({ ...p, external_allowed: e.target.checked }))
                        : setEditDraft((p) => ({ ...p, external_allowed: e.target.checked }))
                    }
                    className="w-4 h-4 text-violet-600 bg-gray-100 border-gray-300 rounded focus:ring-violet-500 focus:ring-2"
                  />
                  <span className="text-sm font-semibold text-gray-700">External Entry (Non-VIT students allowed)</span>
                </label>
              </div>

              <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
              <textarea
                required
                value={showCreate ? formData.description : editDraft.description}
                onChange={(e) =>
                  showCreate
                    ? setFormData((p) => ({ ...p, description: e.target.value }))
                    : setEditDraft((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                placeholder="Event details (min 20 chars)"
                className={`w-full px-3 py-2 rounded-lg border ${formErrors.description ? 'border-rose-400' : 'border-violet-200'} focus:ring-2 focus:ring-violet-300 focus:outline-none`}
              />
              {formErrors.description && <div className="text-xs text-rose-600 mb-1">{formErrors.description}</div>}

              <input
                type="hidden"
                value={showCreate ? formData.coordinator_remarks : editDraft.coordinator_remarks}
                readOnly
              />

              {/* ✅ New Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Club Name</label>
                  <input
                    value={showCreate ? formData.club_name : editDraft.club_name}
                    onChange={(e) =>
                      showCreate
                        ? setFormData((p) => ({ ...p, club_name: e.target.value }))
                        : setEditDraft((p) => ({ ...p, club_name: e.target.value }))
                    }
                    placeholder="e.g. CodeCell, Robotics Club"
                    className="w-full px-3 py-2 rounded-lg border border-violet-200 focus:ring-2 focus:ring-violet-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Target Audience</label>
                  <select
                    value={showCreate ? formData.audience_type : editDraft.audience_type}
                    onChange={(e) =>
                      showCreate
                        ? setFormData((p) => ({ ...p, audience_type: e.target.value }))
                        : setEditDraft((p) => ({ ...p, audience_type: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-violet-200 focus:ring-2 focus:ring-violet-300 focus:outline-none"
                  >
                    <option value="All">All</option>
                    <option value="SE">SE (2nd Year)</option>
                    <option value="TE">TE (3rd Year)</option>
                    <option value="BE">BE (4th Year)</option>
                    <option value="FE">FE (1st Year)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Special Guest</label>
                <input
                  value={showCreate ? formData.special_guest : editDraft.special_guest}
                  onChange={(e) =>
                    showCreate
                      ? setFormData((p) => ({ ...p, special_guest: e.target.value }))
                      : setEditDraft((p) => ({ ...p, special_guest: e.target.value }))
                  }
                  placeholder="e.g. Dr. John Doe, Industry Expert"
                  className="w-full px-3 py-2 rounded-lg border border-violet-200 focus:ring-2 focus:ring-violet-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Amenities</label>
                <input
                  value={showCreate ? formData.amenities : editDraft.amenities}
                  onChange={(e) =>
                    showCreate
                      ? setFormData((p) => ({ ...p, amenities: e.target.value }))
                      : setEditDraft((p) => ({ ...p, amenities: e.target.value }))
                  }
                  placeholder="e.g. Lunch, T-shirt, Certificate"
                  className="w-full px-3 py-2 rounded-lg border border-violet-200 focus:ring-2 focus:ring-violet-300 focus:outline-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-violet-100 flex items-center justify-end gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  setShowCreate(false)
                  setEditingEvent(null)
                  setFormErrors({})
                  setPosterFile(null)
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
