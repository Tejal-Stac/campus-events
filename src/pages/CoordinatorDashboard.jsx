import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import EventCard from '../components/EventCard'
import axios from 'axios'
import { X, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

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

  // [DIAGNOSTIC] Component rendered
  console.log('COORD_DEBUG: CoordinatorDashboard Component Rendered - user:', user?.id, 'token:', token?.substring(0, 20) + '...')

  // Verify coordinator access
  useEffect(() => {
    console.log('COORD_DEBUG: Access check useEffect fired - user.coordinator_type:', user?.coordinator_type)
    if (user && user.coordinator_type === 'none') {
      console.log('COORD_DEBUG: Coordinator type is "none", redirecting to /dashboard')
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  // Fetch events for coordinator's category (pending, approved, AND rejected)
  useEffect(() => {
    console.log('COORD_DEBUG: Fetch useEffect fired - user:', user?.id, 'token present:', !!token)
    
    const fetchData = async () => {
      try {
        console.log('COORD_DEBUG: fetchData started')
        
        // [FIX] Now fetches all three statuses (pending, approved, rejected) in one call
        console.log('COORD_DEBUG: Fetching events for category:', user?.coordinator_type)
        const url = `${API}/events/coordinator/pending-events`
        console.log('COORD_DEBUG: Fetching from:', url)
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        })
        console.log('COORD_DEBUG: Events response:', res.data)
        
        const allEvents = res.data.data || []
        // Separate events by status
        const pending = allEvents.filter(e => e.status === 'pending')
        const approved = allEvents.filter(e => e.status === 'approved')
        const rejected = allEvents.filter(e => e.status === 'rejected')
        
        console.log('COORD_DEBUG: Separated events - Pending:', pending.length, 'Approved:', approved.length, 'Rejected:', rejected.length)
        
        setPendingEvents(pending)
        setApprovedEvents(approved)
        setRejectedEvents(rejected)

        showAlert(`Loaded ${pending.length} pending, ${approved.length} approved, ${rejected.length} rejected events`, 'success')
      } catch (err) {
        console.error('COORD_DEBUG: Fetch data error:', err.response?.status, err.response?.data, err.message)
        showAlert(err.response?.data?.message || 'Failed to fetch events', 'error')
        setPendingEvents([])
        setApprovedEvents([])
        setRejectedEvents([])
      } finally {
        console.log('COORD_DEBUG: Fetch complete, setting loading to false')
        setLoading(false)
      }
    }

    // [FIX] Proper null guard check
    if (user && token && user.coordinator_type && user.coordinator_type !== 'none') {
      console.log('COORD_DEBUG: Conditions met - fetching data')
      fetchData()
    } else {
      console.log('COORD_DEBUG: Conditions NOT met - user:', !!user, 'token:', !!token, 'coordinator_type:', user?.coordinator_type)
      // Still stop loading if conditions aren't met after initial render
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
      showAlert('✅ Event approved successfully!', 'success')
      setPendingEvents(pendingEvents.filter(e => e.id !== eventId))
      if (res.data.data) {
        setApprovedEvents([res.data.data, ...approvedEvents])
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to approve event', 'error')
    }
  }

  const handleRejectEventClick = (eventId) => {
    setRejectingEventId(eventId)
    setRejectRemark('')
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
      showAlert('❌ Event rejected with remarks sent to faculty', 'success')
      setPendingEvents(pendingEvents.filter(e => e.id !== eventId))
      setRejectedEvents([res.data.data, ...rejectedEvents])
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Alert */}
      {alert && (
        <div className={`m-4 p-4 rounded-lg ${alert.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
          {alert.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            🎯 Coordinator Hub - {user?.coordinator_type || 'Loading...'}
          </h1>
          <p className="text-gray-600 mt-2">
            Review and approve/reject events in the {user?.coordinator_type} category
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-gray-200">
          {[
            { id: 'pending', label: `⏳ Pending (${pendingEvents.length})`, color: 'amber' },
            { id: 'approved', label: `✅ Approved (${approvedEvents.length})`, color: 'emerald' },
            { id: 'rejected', label: `❌ Rejected (${rejectedEvents.length})`, color: 'rose' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? `border-${tab.color}-500 text-${tab.color}-700`
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Pending Events */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {pendingEvents.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No pending events to review</p>
              </div>
            ) : (
              pendingEvents.map(event => (
                <div key={event.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="flex gap-4 p-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{event.description?.substring(0, 150)}...</p>
                      <div className="flex gap-4 mt-3 text-sm text-gray-600">
                        <span>📅 {new Date(event.date).toLocaleDateString('en-IN')}</span>
                        <span>📍 {event.venue}</span>
                        <span>👥 {event.registered_count || 0} registered</span>
                      </div>
                      <div className="mt-2">
                        <span className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold">
                          ⏳ Pending Review
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 self-start">
                      <button
                        onClick={() => handleApproveEvent(event.id)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectEventClick(event.id)}
                        className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>

                  {/* Reject Modal */}
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
                          className="bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          {rejectingInProgress ? 'Rejecting...' : 'Confirm Rejection'}
                        </button>
                        <button
                          onClick={() => setRejectingEventId(null)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
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

        {/* Approved Events */}
        {activeTab === 'approved' && (
          <div className="space-y-4">
            {approvedEvents.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No approved events yet</p>
              </div>
            ) : (
              approvedEvents.map(event => (
                <div key={event.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-emerald-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{event.description?.substring(0, 100)}...</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>📅 {new Date(event.date).toLocaleDateString('en-IN')}</span>
                        <span>📍 {event.venue}</span>
                        <span>👥 {event.registered_count || 0} registered</span>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">
                      ✅ Approved
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Rejected Events */}
        {activeTab === 'rejected' && (
          <div className="space-y-4">
            {rejectedEvents.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No rejected events</p>
              </div>
            ) : (
              rejectedEvents.map(event => (
                <div key={event.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-rose-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                      {event.coordinator_remarks && (
                        <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded text-sm text-rose-800">
                          <strong>Rejection reason:</strong> {event.coordinator_remarks}
                        </div>
                      )}
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>📅 {new Date(event.date).toLocaleDateString('en-IN')}</span>
                        <span>📍 {event.venue}</span>
                      </div>
                    </div>
                    <span className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-sm font-semibold">
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
