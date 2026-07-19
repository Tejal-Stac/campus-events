import React, { useState } from 'react'
import { getEventStatus } from '../utils/eventHelpers'
import api from '../api/axiosConfig'

/**
 * Universal EventCard Component
 * Used across Student, Dean, and Faculty dashboards
 * 
 * @param {Object} event - Event data object
 * @param {string} role - User role: 'student', 'dean', or 'faculty'
 * @param {Function} onAction - Callback for role-specific actions
 * @param {boolean} isRegistered - Whether student is already registered (student role only)
 * @param {string} userCollegeType - Current user's college type (vitian, non_vitian, guest)
 * @param {boolean} isOwner - Whether current user is the event owner (faculty only)
 * @param {boolean} readOnly - Whether to display read-only mode (dean oversight of approved events)
 */
export default function EventCard({ event, role, onAction, isRegistered = false, userCollegeType = 'guest', isOwner = false, readOnly = false, user = null }) {
  const [remarks, setRemarks] = useState('')
  const [imageError, setImageError] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('idle')
  const [uploadedUrl, setUploadedUrl] = useState(null)
  
  // Check if a report path already exists from the backend data fetch
  const existingReportUrl = event.report_url || event.report
  const hasExistingReport = !!existingReportUrl
  
  // ✅ LOGISTICAL DATA HELPERS (NEW)
  const rawFee = event?.registration_fee !== undefined && event?.registration_fee !== null ? event.registration_fee : event?.fees
  const isFreeEvent = !rawFee || parseInt(rawFee) <= 0 || String(rawFee).toLowerCase() === 'free'
  const feeDisplay = isFreeEvent ? 'Free' : `₹${parseInt(rawFee)}`
  const organizingDept = event?.department || event?.organizing_dept || null
  const guestSpeaker = event?.special_guest || null
  const amenitiesList = event?.amenities && Array.isArray(event.amenities) ? event.amenities : []
  
  // ✅ AMENITIES ICON MAPPING
  const getAmenityIcon = (amenity) => {
    if (amenity?.includes('Food')) return '🍕'
    if (amenity?.includes('Certificate') || amenity?.includes('Gift')) return '🎓'
    if (amenity?.includes('Duty') || amenity?.includes('Leave')) return '📋'
    if (amenity?.includes('Transport')) return '🚌'
    if (amenity?.includes('Accommodation')) return '🏨'
    return '✨'
  }
  
  // Image handling - Category-based fallback system
  const getCategoryImage = (category) => {
    const images = {
      'Technical': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      'Cultural': 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',
      'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
      'Workshop': 'https://images.unsplash.com/photo-1540317580384-e5d43616e00b?w=800',
      'Seminar': 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
      'Conference': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      'Hackathon': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
      'Competition': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
      'General': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
      'default': 'https://images.unsplash.com/photo-1562774053-701939374585?w=800'
    }
    // Normalize category (handle null/undefined and case variations)
    const normalizedCategory = category?.trim() || 'default'
    return images[normalizedCategory] || images.default
  }
  
  // Handle both database schemas
  const maxParticipants = event.max_participants || event.capacity || event.seats || 100
  const registeredCount = event.registered_count || event.registered || 0
  const pct = Math.round((registeredCount / maxParticipants) * 100)
  
  // Format date
  const eventDate = event.date ? new Date(event.date).toLocaleDateString('en-US', { 
    year: 'numeric', month: 'short', day: 'numeric' 
  }) : 'TBA'
  
  // Get event image with robust fallback logic
  // Handle null, undefined, empty string, and whitespace-only values
  const hasValidImage = event.image_url && event.image_url.trim().length > 0
  const eventImage = imageError 
    ? getCategoryImage(event.category) 
    : (hasValidImage ? event.image_url.trim() : getCategoryImage(event.category))
  
  // Handle key features - robust parsing for JSON strings and arrays
  const getFeatures = () => {
    const features = event.keyFeatures || event.key_features
    
    // Already an array
    if (Array.isArray(features)) return features
    
    // JSON string like '["Certificates","Prizes"]' or '{"key": "value"}'
    if (typeof features === 'string' && features.trim()) {
      try {
        const parsed = JSON.parse(features)
        if (Array.isArray(parsed)) return parsed
      } catch (e) {
        // Not JSON, treat as comma-separated string
        return features.split(',').map(f => f.trim()).filter(Boolean)
      }
    }
    
    return []
  }
  
  const featuresArray = getFeatures()
  
  // CSV Export Utility Functions
  const downloadAttendanceCSV = () => {
    // This would typically fetch registrations from API, but we'll use event data
    const csvContent = [
      ['Attendance Report - ' + event.title],
      [''],
      ['Event Details:'],
      ['Title', event.title],
      ['Date', eventDate],
      ['Venue', event.location || event.venue || 'TBA'],
      ['Organizer', event.organizing_club || event.organising_club || event.organisingClub || 'N/A'],
      [''],
      ['Registration Statistics:'],
      ['Total Seats', maxParticipants],
      ['Registered', registeredCount],
      ['Available', maxParticipants - registeredCount],
      ['Occupancy Rate', pct + '%'],
      [''],
      ['Generated on', new Date().toLocaleString()],
      [''],
      ['Note: For detailed attendee list, please use the View Applicants feature in the dashboard.']
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}_attendance.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
  
  const downloadEventReportCSV = () => {
    const csvContent = [
      ['Event Comprehensive Report'],
      [''],
      ['Basic Information:'],
      ['Event Title', event.title],
      ['Category', event.category || 'General'],
      ['SA Vertical', event.saVertical || event.sa_vertical || event.eventType || 'General'],
      [''],
      ['Organization Details:'],
      ['Organizing Club/Dept', event.organizing_club || event.organising_club || event.organisingClub || 'N/A'],
      ['Department', event.department || 'N/A'],
      [''],
      ['Schedule:'],
      ['Date', eventDate],
      ['Day', event.day || 'N/A'],
      ['Start Time', event.timeFrom || event.time_from || 'TBA'],
      ['End Time', event.timeTo || event.time_to || 'TBA'],
      [''],
      ['Venue Information:'],
      ['Physical Venue', event.location || event.venue || 'TBA'],
      ['Online Link', event.onlineLink || event.online_link || 'N/A'],
      [''],
      ['Participation Details:'],
      ['Target Audience', event.target_audience || event.targetAudience || 'All'],
      ['Total Capacity', maxParticipants],
      ['Current Registrations', registeredCount],
      ['Available Seats', maxParticipants - registeredCount],
      ['Occupancy Rate', pct + '%'],
      ['Expected Count', event.expected_count || event.expectedCount || 'N/A'],
      [''],
      ['Financial:'],
      ['Registration Fees', feeDisplay],
      [''],
      ['Contact Information:'],
      ['Contact Person', event.contact || 'N/A'],
      ['Contact Number', event.contactNumber || event.contact_number || 'N/A'],
      [''],
      ['Additional Details:'],
      ['Description', (event.description || event.desc || 'N/A').replace(/,/g, ';')],
      ['Key Features', featuresArray.join(' | ') || 'N/A'],
      ['Status', event.status || 'Active'],
      [''],
      ['Report Generated:', new Date().toLocaleString()],
      ['Generated By:', 'Campus Events Management System']
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}_full_report.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
  
  // Render action buttons based on role
  const renderActions = () => {
    if (role === 'student') {
      const isExternalAllowed = event.external_allowed !== undefined ? event.external_allowed : event.allow_external;
      const isVitian = user && user.email && user.email.toLowerCase().endsWith('@vit.edu');
      const isRestricted = isExternalAllowed === false && !isVitian;
      const status = getEventStatus(event.start_date || event.event_date || event.date, event.end_date, event.is_closed);
      const isClosed = status === 'past' || event.is_closed;

      if (isRegistered) {
        return (
          <button
            disabled
            className="w-full py-3 rounded-xl text-sm font-bold bg-green-600 text-white cursor-not-allowed border-2 border-green-700 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Already Registered
          </button>
        )
      }

      if (isClosed) {
        return (
          <button
            disabled
            className="w-full py-3 rounded-xl text-sm font-bold bg-gray-200 text-gray-500 cursor-not-allowed border-2 border-gray-300 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Registrations Closed
          </button>
        )
      }

      if (isRestricted) {
        return (
          <button
            disabled
            className="w-full py-3 rounded-xl text-sm font-bold bg-gray-100 border-2 border-gray-300 text-gray-600 flex items-center justify-center gap-2 cursor-not-allowed">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            VIT Only Event
          </button>
        )
      }

      return (
        <button
          className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-105 hover:shadow-lg active:scale-95"
          onClick={() => onAction && onAction('register', event.id)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          Register Now
        </button>
      )
    }
    
    if (role === 'dean') {
      // Read-only mode for approved/live events
      if (readOnly) {
        return (
          <div className="space-y-2">
            <button
              onClick={() => onAction && onAction('view', event.id)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Live Event
            </button>
            <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 font-medium">
              ✅ Event is live and visible to students
            </div>
          </div>
        )
      }
      
      // Active approval mode for pending events
      return (
        <div className="space-y-3">
          {/* Remarks textarea */}
          <textarea
            placeholder="Add remarks (optional)..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows="2"
          />
          
          <div className="flex gap-2">
            <button
              onClick={() => onAction && onAction('approve', event.id, remarks)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Approve
            </button>
            <button
              onClick={() => onAction && onAction('reject', event.id, remarks)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject
            </button>
          </div>
        </div>
      )
    }
    
    if (role === 'faculty') {
      // Owner-specific actions with enhanced stats
      if (isOwner) {
        return (
          <div className="space-y-3 border-t pt-3 bg-gradient-to-r from-blue-50 to-indigo-50 -mx-5 -mb-5 px-5 py-4 rounded-b-2xl">
            {/* Owner Stats Section */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="p-2 bg-white rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600 font-medium">Registered</p>
                <p className="text-lg font-bold text-blue-600">{registeredCount}</p>
              </div>
              <div className="p-2 bg-white rounded-lg border border-indigo-200">
                <p className="text-xs text-gray-600 font-medium">Capacity</p>
                <p className="text-lg font-bold text-indigo-600">{maxParticipants}</p>
              </div>
            </div>
            
            {/* Owner Actions Row */}
            <div className="space-y-2">
              {/* Primary Action: View Participants */}
              <button
                onClick={() => onAction && onAction('viewParticipants', event.id)}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                View Participants
              </button>
              
              {/* Secondary Actions Row */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={downloadAttendanceCSV}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Attendance CSV
                </button>
                <button
                  onClick={downloadEventReportCSV}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Full Report
                </button>
              </div>
              
              {/* Edit Button */}
              <button
                onClick={() => onAction && onAction('edit', event.id)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Event
              </button>
            </div>
          </div>
        )
      }
      
      // Non-owner faculty view (coordinator viewing others' events)
      return (
        <div className="space-y-2">
          <button
            onClick={() => onAction && onAction('view', event.id)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Details
          </button>
        </div>
      )
    }

    if (role === 'club_president') {
      const status = getEventStatus(event.start_date || event.event_date || event.date, event.end_date, event.is_closed);
      if (status === 'past') {
        return (
          <div className="space-y-2">
            {uploadStatus === 'idle' && !hasExistingReport && (
              <label className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Report
                <input type="file" accept=".pdf,.odf,.docx,.doc" className="hidden" onChange={async (e) => {
                  const file = e.target.files[0]
                  if (!file) return
                  setUploadStatus('uploading')
                  try {
                    const formData = new FormData();
                    formData.append('report', file);
                    formData.append('eventId', event.id);

                    const response = await api.post(`/events/${event.id}/upload-report`, formData, {
                      headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    const data = response.data;
                    
                    setUploadedUrl(data.report_url);
                    setUploadStatus('success');
                    if (onAction) onAction('reportUploaded', event.id, data.report_url);
                  } catch (err) {
                    setUploadStatus('idle');
                    console.error('Failed to upload report', err);
                    alert('Failed to upload report. Please try again.');
                  }
                }} />
              </label>
            )}
            
            {uploadStatus === 'uploading' && (
              <button disabled className="w-full bg-gray-400 text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                🔄 Uploading...
              </button>
            )}

            {(uploadStatus === 'success' || hasExistingReport) && (
              <a 
                href={uploadedUrl || existingReportUrl || '#'} 
                target="_blank" 
                rel="noreferrer" 
                className="block w-full px-3 py-2.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-bold text-center hover:bg-green-100 transition"
              >
                📄 View Uploaded Report
              </a>
            )}
          </div>
        )
      }
    }
    
    return null
  }

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
      style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>

      {/* Hero Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={eventImage} 
          alt={event?.title || 'Event'}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            if (!imageError) {
              setImageError(true)
              e.target.src = getCategoryImage(event?.category)
            }
          }}
        />
        
        {/* Glassmorphism Overlay Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start gap-2">
          <div className="flex flex-col gap-2">
            <div className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white backdrop-blur-md bg-white/20 border border-white/30 shadow-lg">
              {event?.saVertical || event?.sa_vertical || event?.eventType || 'General'}
            </div>
            {/* ✅ DEPARTMENT BADGE (NEW) */}
            {organizingDept && (
              <div className="px-3 py-1.5 rounded-lg text-xs font-bold text-amber-900 bg-amber-300/90 backdrop-blur-md border border-amber-400 shadow-lg flex items-center gap-1">
                🏢 {organizingDept}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className="px-3 py-1.5 rounded-lg text-xs font-bold text-white backdrop-blur-md bg-gradient-to-r from-indigo-500/80 to-purple-500/80 border border-white/30 shadow-lg">
              {event?.category}
            </div>
            {/* ✅ FEES BADGE (NEW) */}
            <div className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white backdrop-blur-md border border-white/30 shadow-lg ${
              isFreeEvent 
                ? 'bg-green-600/90' 
                : 'bg-blue-600/90'
            }`}>
              {isFreeEvent ? '✨ FREE' : `💰 ${feeDisplay}`}
            </div>
          </div>
        </div>
        
        {/* Gradient Overlay at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      <div className="p-5">
        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
          {event?.title}
        </h3>

        {/* Description */}
        {event?.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}

        {/* ✅ GUEST SPEAKER SECTION (NEW) */}
        {guestSpeaker && (
          <div className="mb-4 flex items-start gap-3 p-3 bg-pink-50 rounded-lg border border-pink-200">
            <span className="text-lg mt-0.5">👤</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-pink-700 uppercase tracking-wide">Special Guest</p>
              <p className="text-sm font-semibold text-pink-900 mt-0.5">{guestSpeaker}</p>
            </div>
          </div>
        )}

        {/* ✅ AMENITIES SECTION (NEW) */}
        {amenitiesList.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-700 mb-2">✨ Amenities Included</p>
            <div className="flex flex-wrap gap-2">
              {amenitiesList.map((amenity, idx) => (
                <span key={`amenity-${idx}`} className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-semibold border border-amber-300 flex items-center gap-1">
                  {getAmenityIcon(amenity)} {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Organized By */}
        <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="text-xs font-semibold text-indigo-900">
            {event?.organizing_club || event?.organising_club || event?.organisingClub || 'N/A'}
          </span>
        </div>

        {/* 2-Column Grid for Details */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {/* Date */}
          <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
            <svg className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium">Date</p>
              <p className="text-xs font-bold text-gray-900 truncate">{eventDate}</p>
            </div>
          </div>
          
          {/* Time */}
          {(event?.timeFrom || event?.time_from) && (
            <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
              <svg className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium">Time</p>
                <p className="text-xs font-bold text-gray-900 truncate">{event?.timeFrom || event?.time_from}</p>
              </div>
            </div>
          )}
          
          {/* Venue */}
          <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
            <svg className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium">Venue</p>
              <p className="text-xs font-bold text-gray-900 truncate">{event?.location || event?.venue || 'TBA'}</p>
            </div>
          </div>
          
          {/* Fees */}
          <div className={`flex items-start gap-2 p-2 rounded-lg col-span-2 border ${
            isFreeEvent 
              ? 'bg-green-50 border-green-200' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <span className="text-lg mt-0.5">{isFreeEvent ? '💚' : '💰'}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-bold uppercase tracking-wide ${
                isFreeEvent ? 'text-green-700' : 'text-blue-700'
              }`}>Registration Fee</p>
              <p className={`text-sm font-bold ${
                isFreeEvent ? 'text-green-900' : 'text-blue-900'
              }`}>{feeDisplay}</p>
            </div>
          </div>
          
          {/* Audience */}
          {(event?.target_audience || event?.targetAudience) && (
            <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg col-span-2">
              <svg className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium">Audience</p>
                <p className="text-xs font-bold text-gray-900">{event?.target_audience || event?.targetAudience}</p>
              </div>
            </div>
          )}
          
          {/* Contact */}
          {event?.contact && (
            <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg col-span-2">
              <svg className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium">Contact</p>
                <p className="text-xs font-bold text-gray-900">{event?.contact}</p>
              </div>
            </div>
          )}
        </div>

        {/* Key Features with Pastel Backgrounds */}
        {featuresArray?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-700 mb-2">✨ Key Features</p>
            <div className="flex flex-wrap gap-1.5">
              {featuresArray.map((f, idx) => {
                const colors = [
                  'bg-pink-50 text-pink-700 border-pink-200',
                  'bg-purple-50 text-purple-700 border-purple-200',
                  'bg-blue-50 text-blue-700 border-blue-200',
                  'bg-green-50 text-green-700 border-green-200',
                  'bg-yellow-50 text-yellow-700 border-yellow-200',
                ]
                return (
                  <span key={`${f}-${idx}`} className={`${colors[idx % colors.length]} border rounded-full text-xs px-3 py-1 font-medium`}>
                    {f}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Registration Progress Bar (only for student/faculty roles) */}
        {(role === 'student' || role === 'faculty') && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-gray-600 font-medium">
                {registeredCount}/{maxParticipants} registered
              </span>
              <span className={`text-xs font-bold ${pct > 80 ? 'text-red-600' : 'text-indigo-600'}`}>
                {pct}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${pct > 80 ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {/* Role-based Action Buttons */}
        {renderActions()}
      </div>
    </div>
  )
}
