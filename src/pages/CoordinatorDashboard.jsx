import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function CoordinatorDashboard() {
  const { user, token } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('pending')
  const [pendingEvents, setPendingEvents] = useState([])
  const [approvedEvents, setApprovedEvents] = useState([])
  const [rejectedEvents, setRejectedEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [rejectingEventId, setRejectingEventId] = useState(null)
  const [rejectRemark, setRejectRemark] = useState('')
  const [rejectingInProgress, setRejectingInProgress] = useState(false)

  useEffect(() => {
    if (user && user.role !== 'coordinator') {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API}/events/coordinator/pending-events`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const allEvents = res.data.data || []
        setPendingEvents(allEvents.filter(e => e.status === 'pending'))
        setApprovedEvents(allEvents.filter(e => e.status === 'approved'))
        setRejectedEvents(allEvents.filter(e => e.status === 'rejected'))
        showAlert(`Loaded ${allEvents.length} events`, 'success')
      } catch (err) {
        console.error('Coordinator fetch error:', err.response?.status, err.response?.data?.message)
        showAlert(err.response?.data?.message || 'Failed to fetch events', 'error')
      } finally {
        setLoading(false)
      }
    }

    if (user && token && user.role === 'coordinator') {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [user, token])

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type })
    setTimeout(() => setAlert(null), 4000)
  }

  const handleApproveEvent = async (eventId) => {
    try {
      const res = await axios.put(
        `${API}/events/${eventId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      showAlert('Event approved successfully!', 'success')
      const approvedEvent = res.data.data
      setPendingEvents(prev => prev.filter(e => e.id !== eventId))
      if (approvedEvent) setApprovedEvents(prev => [approvedEvent, ...prev])
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to approve event', 'error')
    }
  }

  const handleRejectEventSubmit = async (eventId) => {
    if (!rejectRemark.trim()) {
      showAlert('Please provide remarks for rejection', 'error')
      return
    }
    try {
      setRejectingInProgress(true)
      const res = await axios.put(
        `${API}/events/${eventId}/reject`,
        { coordinator_remarks: rejectRemark },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      showAlert('Event rejected with remarks', 'success')
      const rejectedEvent = res.data.data
      setPendingEvents(prev => prev.filter(e => e.id !== eventId))
      if (rejectedEvent) setRejectedEvents(prev => [rejectedEvent, ...prev])
      setRejectingEventId(null)
      setRejectRemark('')
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to reject event', 'error')
    } finally {
      setRejectingInProgress(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading coordinator dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  const coordinatorLabel = user?.coordinator_type && user.coordinator_type !== 'none'
    ? `— ${user.coordinator_type} Category`
    : '— All Categories'

  const tabs = [
    { id: 'pending',  label: `⏳ Pending (${pendingEvents.length})`,   activeColor: 'border-amber-500 text-amber-700' },
    { id: 'approved', label: `✅ Approved (${approvedEvents.length})`,  activeColor: 'border-emerald-500 text-emerald-700' },
    { id: 'rejected', label: `❌ Rejected (${rejectedEvents.length})`,  activeColor: 'border-rose-500 text-rose-700' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {alert && (
        <div className={`m-4 p-4 rounded-lg ${
          alert.type === 'success'
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            : 'bg-rose-100 text-rose-800 border border-rose-300'
        }`}>
          {alert.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🎯 Coordinator Hub {coordinatorLabel}</h1>
          <p className="text-gray-600 mt-2">Review and approve or reject events</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab.id ? tab.activeColor : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Pending */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {pendingEvents.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center text-gray-500">
                ⚠️ No pending events to review
              </div>
            ) : (
              pendingEvents.map(event => (
                <div key={event.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="flex gap-4 p-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {(event.description || '').substring(0, 150)}{(event.description || '').length > 150 ? '...' : ''}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-600">
                        <span>📅 {new Date(event.date).toLocaleDateString('en-IN')}</span>
                        <span>📍 {event.venue}</span>
                        <span>🏷️ {event.category}</span>
                        <span>👥 {event.registered_count || 0} registered</span>
                        {event.faculty_first_name && (
                          <span>👤 {event.faculty_first_name} {event.faculty_last_name}</span>
                        )}
                      </div>
                      <div className="mt-2">
                        <span className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold">
                          ⏳ Pending Review
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 self-start">
                      <button
                        onClick={() => handleApproveEvent(event.id)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => { setRejectingEventId(event.id); setRejectRemark('') }}
                        className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>

                  {rejectingEventId === event.id && (
                    <div className="bg-rose-50 border-t border-rose-200 p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Remarks (visible to faculty):
                      </label>
                      <textarea
                        value={rejectRemark}
                        onChange={(e) => setRejectRemark(e.target.value)}
                        placeholder="Explain why this event is being rejected..."
                        className="w-full p-3 border border-rose-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                        rows={3}
                      />
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleRejectEventSubmit(event.id)}
                          disabled={rejectingInProgress}
                          className="bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white px-4 py-2 rounded-lg font-medium"
                        >
                          {rejectingInProgress ? 'Rejecting...' : 'Confirm Rejection'}
                        </button>
                        <button
                          onClick={() => setRejectingEventId(null)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Approved */}
        {activeTab === 'approved' && (
          <div className="space-y-4">
            {approvedEvents.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center text-gray-500">✅ No approved events yet</div>
            ) : (
              approvedEvents.map(event => (
                <div key={event.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-emerald-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                        <span>📅 {new Date(event.date).toLocaleDateString('en-IN')}</span>
                        <span>📍 {event.venue}</span>
                        <span>🏷️ {event.category}</span>
                        <span>👥 {event.registered_count || 0} registered</span>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                      ✅ Approved
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Rejected */}
        {activeTab === 'rejected' && (
          <div className="space-y-4">
            {rejectedEvents.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center text-gray-500">❌ No rejected events</div>
            ) : (
              rejectedEvents.map(event => (
                <div key={event.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-rose-500">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                      {event.coordinator_remarks && (
                        <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded text-sm text-rose-800">
                          <strong>Rejection reason:</strong> {event.coordinator_remarks}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                        <span>📅 {new Date(event.date).toLocaleDateString('en-IN')}</span>
                        <span>📍 {event.venue}</span>
                        <span>🏷️ {event.category}</span>
                      </div>
                    </div>
                    <span className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ml-4">
                      ❌ Rejected
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}