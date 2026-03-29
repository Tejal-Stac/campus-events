import { useRef, useState, useEffect } from "react";

const departments = ['Computer Engineering', 'IT', 'Mechanical', 'Civil', 'ENTC', 'Chemical Engineering', 'AI-ML']
const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"]
const divisions = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]

function GuestTicket({ event, formData, ticketId, onClose }) {
  const isFree = !event.fees || event.fees === "0" || event.fees?.toLowerCase() === "free"
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-5 rounded-t-2xl text-center">
          <div className="text-4xl mb-2">🎟️</div>
          <h2 className="text-xl font-bold">Registration Confirmed!</h2>
          <p className="text-green-100 text-sm mt-1">Screenshot this as your entry proof</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="border-2 border-dashed border-green-300 rounded-xl p-4 bg-green-50 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Event</p>
                <p className="font-bold text-gray-800">{event.title}</p>
              </div>
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-semibold">✓ Confirmed</span>
            </div>
            <hr className="border-dashed border-green-200" />
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="font-semibold text-gray-800">{formData.reg_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-semibold text-gray-800">{formData.reg_phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-semibold text-gray-800 text-xs break-all">{formData.reg_email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">College</p>
                <p className="font-semibold text-gray-800 text-xs">{formData.reg_college_name || "VIT"}</p>
              </div>
              {event.date && (
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              )}
              {event.venue && (
                <div>
                  <p className="text-xs text-gray-500">Venue</p>
                  <p className="font-semibold text-gray-800">{event.venue}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500">Fee</p>
                <p className={`font-semibold ${isFree ? "text-green-600" : "text-orange-600"}`}>
                  {isFree ? "Free" : `₹${event.fees}`}
                </p>
              </div>
            </div>
            <hr className="border-dashed border-green-200" />
            <div className="text-center">
              <p className="text-xs text-gray-500">Ticket ID</p>
              <p className="font-mono font-bold text-gray-700 tracking-widest">{ticketId}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center">📸 Screenshot this ticket and show it at the venue for entry</p>
          {!isFree && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800">
              💳 <strong>Paid event:</strong> Pay ₹{event.fees} at the venue or as instructed by the organiser.
            </div>
          )}
          <button onClick={onClose}
            className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors">
            Done ✓
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RegistrationModal({ event, user, onConfirm, onClose }) {
  const isGuest     = !user
  const isNonVitian = !isGuest && (user?.college_type === "non_vitian" || user?.is_vitian === false)
  const showExternalForm = isGuest || isNonVitian

  // Use REFS for text inputs → zero re-renders on keystroke = no lag
  const firstNameRef      = useRef()
  const lastNameRef       = useRef()
  const emailRef          = useRef()
  const phoneRef          = useRef()
  const grNumberRef       = useRef()
  const prnRef            = useRef()
  const collegeNameRef    = useRef()
  const collegeAddressRef = useRef()

  // Only dropdowns and button-groups need state
  const [department, setDepartment] = useState(user?.department || "")
  const [year,       setYear]       = useState(user?.year       || "")
  const [division,   setDivision]   = useState(user?.division   || "")
  const [filePreview, setFilePreview] = useState(null)
  const [errors,     setErrors]     = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [ticket,     setTicket]     = useState(null)

  // Pre-fill ref inputs once on mount
  useEffect(() => {
    if (!user) return
    if (firstNameRef.current)    firstNameRef.current.value    = user.firstName || ""
    if (lastNameRef.current)     lastNameRef.current.value     = user.lastName  || ""
    if (emailRef.current)        emailRef.current.value        = user.email     || ""
    if (phoneRef.current)        phoneRef.current.value        = user.phone     || ""
    if (grNumberRef.current)     grNumberRef.current.value     = user.grNumber  || user.gr_number || ""
    if (collegeNameRef.current)  collegeNameRef.current.value  = user.college_name || user.collegeName || ""
  }, [user])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.type.startsWith("image/")) setFilePreview(URL.createObjectURL(file))
    else setFilePreview(null)
  }

  const getVals = () => ({
    firstName:      firstNameRef.current?.value?.trim()      || "",
    lastName:       lastNameRef.current?.value?.trim()       || "",
    email:          emailRef.current?.value?.trim()          || "",
    phone:          phoneRef.current?.value?.trim()          || "",
    grNumber:       grNumberRef.current?.value?.trim()       || "",
    prn:            prnRef.current?.value?.trim()            || "",
    collegeName:    collegeNameRef.current?.value?.trim()    || "",
    collegeAddress: collegeAddressRef.current?.value?.trim() || "",
    department, year, division,
  })

  const validate = (v) => {
    const e = {}
    if (!v.firstName)  e.firstName  = "Required"
    if (!v.lastName)   e.lastName   = "Required"
    if (!v.email)      e.email      = "Required"
    else if (!/\S+@\S+\.\S+/.test(v.email)) e.email = "Invalid email"
    if (!v.phone)      e.phone      = "Required"
    if (!v.department) e.department = "Required"
    if (!v.year)       e.year       = "Required"
    if (showExternalForm) {
      if (!v.collegeName)    e.collegeName    = "Required"
      if (!v.collegeAddress) e.collegeAddress = "Required"
    } else {
      if (!v.grNumber) e.grNumber = "Required"
    }
    return e
  }

  const handleSubmit = async () => {
    const v = getVals()
    const e = validate(v)
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setErrors({})
    setSubmitting(true)
    const payload = {
      reg_name:         `${v.firstName} ${v.lastName}`,
      reg_department:   v.department,
      reg_division:     v.division,
      reg_year:         v.year,
      reg_gr_number:    v.grNumber,
      reg_prn:          v.prn,
      reg_phone:        v.phone,
      reg_college_name: v.collegeName    || null,
      reg_email:        v.email,
      college_address:  v.collegeAddress || null,
      is_external:      showExternalForm,
    }
    try {
      await onConfirm(payload)
      if (isGuest) {
        // Guest: show ticket, don't close, don't redirect
        const ticketId = `EVT-${event.id}-${Date.now().toString(36).toUpperCase()}`
        setTicket({ payload, ticketId })
      }
      // Logged-in: parent handles close + refresh
    } catch {
      // error handled in parent showAlert
    } finally {
      setSubmitting(false)
    }
  }

  const isFree = !event.fees || event.fees === "0" || event.fees?.toLowerCase() === "free"

  if (ticket) {
    return <GuestTicket event={event} formData={ticket.payload} ticketId={ticket.ticketId} onClose={onClose} />
  }

  const ic = (field) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${errors[field] ? "border-red-400" : "border-gray-200"}`
  const Err = ({ f }) => errors[f] ? <p className="text-red-500 text-xs mt-0.5">{errors[f]}</p> : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 rounded-t-2xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white text-xl font-bold leading-none">✕</button>
          <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold mb-1">Event Registration</p>
          <h2 className="text-xl font-bold pr-8">{event.title}</h2>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-blue-100">
            {event.date && <span>📅 {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
            {event.venue && <span>📍 {event.venue}</span>}
            <span className={`font-semibold ${isFree ? "text-green-300" : "text-yellow-300"}`}>
              {isFree ? "Free" : `₹${event.fees}`}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Banner */}
          {isGuest ? (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm text-orange-700 flex gap-2">
              <span>🌐</span>
              <span>Registering as <strong>External / Non-VIT Student</strong> — no account needed. You'll get a ticket to screenshot after submitting.</span>
            </div>
          ) : isNonVitian ? (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-sm text-purple-700 flex gap-2">
              <span>🎓</span>
              <span>Registering as <strong>External Student</strong> from {user.college_name || "your college"}.</span>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 flex gap-2">
              <span>✅</span>
              <span>Registering as <strong>VIT Student</strong> — fields auto-filled from your profile.</span>
            </div>
          )}

          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">First Name <span className="text-red-500">*</span></label>
              <input ref={firstNameRef} className={ic("firstName")} placeholder="First name" />
              <Err f="firstName" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name <span className="text-red-500">*</span></label>
              <input ref={lastNameRef} className={ic("lastName")} placeholder="Last name" />
              <Err f="lastName" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email <span className="text-red-500">*</span></label>
            <input ref={emailRef} type="email" className={ic("email")} placeholder="email@example.com" />
            <Err f="email" />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number <span className="text-red-500">*</span></label>
            <input ref={phoneRef} type="tel" className={ic("phone")} placeholder="10-digit mobile number" />
            <Err f="phone" />
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Department <span className="text-red-500">*</span></label>
            <select value={department} onChange={e => setDepartment(e.target.value)} className={ic("department")}>
              <option value="">Select department</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <Err f="department" />
          </div>

          {/* Year */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Year of Study <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-4 gap-2">
              {years.map(y => (
                <button key={y} type="button" onClick={() => setYear(y)}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-colors ${year === y ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>
                  {y.replace(" Year", "Y")}
                </button>
              ))}
            </div>
            <Err f="year" />
          </div>

          {/* VIT only */}
          {!showExternalForm && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">GR / Roll Number <span className="text-red-500">*</span></label>
                  <input ref={grNumberRef} className={ic("grNumber")} placeholder="GR Number" />
                  <Err f="grNumber" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">PRN Number</label>
                  <input ref={prnRef} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="e.g. 1234567890" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Division</label>
                <select value={division} onChange={e => setDivision(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                  <option value="">Select division</option>
                  {divisions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </>
          )}

          {/* External / Guest only */}
          {showExternalForm && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">College Name <span className="text-red-500">*</span></label>
                <input ref={collegeNameRef} className={ic("collegeName")} placeholder="Full college name" />
                <Err f="collegeName" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">College Address <span className="text-red-500">*</span></label>
                <textarea ref={collegeAddressRef} rows={2}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none ${errors.collegeAddress ? "border-red-400" : "border-gray-200"}`}
                  placeholder="College address with city" />
                <Err f="collegeAddress" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">College ID Card <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="file" accept="image/*,.pdf" onChange={handleFileChange}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 file:font-semibold hover:file:bg-blue-100" />
                {filePreview && <img src={filePreview} alt="ID preview" className="mt-2 h-20 rounded-lg object-cover border" />}
              </div>
            </>
          )}

          {/* Payment */}
          {!isFree && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-yellow-800 mb-2">💳 Event Fee: ₹{event.fees}</p>
              {event.payment_qr_url
                ? <><p className="text-xs text-yellow-700 mb-2">Scan to pay before confirming:</p>
                    <img src={event.payment_qr_url} alt="Payment QR" className="h-36 mx-auto rounded-lg border" /></>
                : <p className="text-xs text-yellow-700">Payment details will be shared after registration.</p>
              }
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60">
              {submitting ? "Submitting..." : "Confirm Registration →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}