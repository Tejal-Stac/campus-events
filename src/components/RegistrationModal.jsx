import { useRef, useState, useEffect } from "react";

const departments = ['Computer Engineering', 'IT', 'Mechanical', 'Civil', 'ENTC', 'Chemical Engineering', 'AI-ML']
const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"]
const divisions = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]

function ConfirmationTicket({ event, registrationId, onClose }) {
  const isFree = !event.fees || event.fees === "0" || event.fees?.toLowerCase() === "free"
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-t-2xl text-center">
          <div className="text-5xl mb-3">✅</div>
          <h2 className="text-2xl font-bold">Registration Confirmed!</h2>
          <p className="text-emerald-100 text-sm mt-2">Your payment verification is pending</p>
        </div>
        <div className="p-6 space-y-5">
          <div className="border-2 border-dashed border-emerald-300 rounded-xl p-5 bg-emerald-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800">{event.title}</h3>
              <span className="bg-emerald-600 text-white text-xs px-3 py-1 rounded-full font-semibold">Registered</span>
            </div>
            <hr className="border-dashed border-emerald-200 mb-3" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Registration ID:</span>
                <span className="font-mono font-bold text-gray-800">{registrationId}</span>
              </div>
              {event.date && (
                <div className="flex justify-between">
                  <span className="text-gray-600">📅 Event Date:</span>
                  <span className="font-semibold text-gray-800">
                    {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}
              {event.venue && (
                <div className="flex justify-between">
                  <span className="text-gray-600">📍 Venue:</span>
                  <span className="font-semibold text-gray-800">{event.venue}</span>
                </div>
              )}
              {!isFree && (
                <div className="flex justify-between pt-2 border-t border-emerald-200">
                  <span className="text-gray-600">💳 Fee Status:</span>
                  <span className="font-bold text-amber-600">⏳ Pending Verification</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>📝 Next Step:</strong> The event organizer will verify your payment receipt and confirm your attendance.
            </p>
          </div>

          <button onClick={onClose}
            className="w-full py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RegistrationModal({ event, user, onConfirm, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [termsRead, setTermsRead] = useState(false);
  const [registrationId, setRegistrationId] = useState(null);
  
  const isGuest     = !user
  const isNonVitian = !isGuest && (user?.college_type === "non_vitian" || user?.is_vitian === false)
  const showExternalForm = isGuest || isNonVitian

  // Use REFS for text inputs
  const firstNameRef      = useRef()
  const lastNameRef       = useRef()
  const emailRef          = useRef()
  const phoneRef          = useRef()
  const grNumberRef       = useRef()
  const prnRef            = useRef()
  const collegeNameRef    = useRef()
  const collegeAddressRef = useRef()

  const [department, setDepartment] = useState(user?.department || "")
  const [year,       setYear]       = useState(user?.year       || "")
  const [division,   setDivision]   = useState(user?.division   || "")
  const [errors,     setErrors]     = useState({})

  // Payment Information
  const [receiptUrl, setReceiptUrl] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const isFree = !event.fees || event.fees === "0" || event.fees?.toLowerCase() === "free"

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

  const getFormValues = () => ({
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

  const validatePersonalInfo = (v) => {
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

  const validatePaymentInfo = () => {
    const e = {}
    if (!receiptUrl && !transactionId) {
      e.payment = "Provide receipt URL or transaction ID"
    }
    return e
  }

  const handleNextStep = async () => {
    if (currentStep === 1) {
      // Step 1 requires only terms acknowledgement
      if (!termsRead) {
        setErrors({ terms: "You must read and acknowledge the terms" })
        return
      }
      setErrors({})
      setCurrentStep(2)
    } else if (currentStep === 2) {
      // Validate payment if not free
      if (!isFree) {
        const e = validatePaymentInfo()
        if (Object.keys(e).length > 0) { setErrors(e); return }
      }
      setErrors({})
      setCurrentStep(3)
    }
  }

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1)
    setErrors({})
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      const v = getFormValues()
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
        receipt_image_url: receiptUrl || transactionId || null,
        verification_status: "pending", // [FIX] Payment verification pending
      }

      // Register for the event via parent's onConfirm
      const result = await onConfirm(payload)
      
      // Extract registration ID from result
      if (result?.id) {
        setRegistrationId(result.id)
      } else if (result?.registration_id) {
        setRegistrationId(result.registration_id)
      } else if (result?.data?.id) {
        setRegistrationId(result.data.id)
      } else if (result?.data?.registration_id) {
        setRegistrationId(result.data.registration_id)
      }
    } catch (err) {
      console.error("Registration error:", err)
    } finally {
      setSubmitting(false)
    }
  }

  // Show confirmation after successful registration
  if (registrationId) {
    return <ConfirmationTicket event={event} registrationId={registrationId} onClose={onClose} />
  }

  const ic = (field) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 ${errors[field] ? "border-red-400" : "border-gray-200"}`

  const Err = ({ f }) => errors[f] ? <p className="text-red-500 text-xs mt-0.5">{errors[f]}</p> : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-violet-700 to-indigo-800 text-white p-5 rounded-t-2xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white text-xl font-bold leading-none">✕</button>
          <p className="text-xs text-violet-200 uppercase tracking-wider font-semibold mb-1">Event Registration - Step {currentStep} of 3</p>
          <h2 className="text-xl font-bold pr-8">{event.title}</h2>
          <div className="flex gap-2 mt-3">
            {[1, 2, 3].map(step => (
              <div key={step} className={`h-1 flex-1 rounded ${step <= currentStep ? 'bg-violet-300' : 'bg-violet-600/30'}`} />
            ))}
          </div>
        </div>

        <div className="p-5 space-y-4">

          {/* STEP 1: Event Review */}
          {currentStep === 1 && (
            <>
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                <h3 className="font-bold text-violet-900 mb-3">📋 Event Details</h3>
                {(event.image_url || event.poster_url || event.poster) && (
                  <img
                    src={event.image_url || event.poster_url || event.poster}
                    alt="Event poster"
                    className="w-full h-44 object-cover rounded-lg border border-violet-200 mb-3"
                  />
                )}
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between"><span className="font-semibold">Title:</span> <span>{event.title}</span></div>
                  {event.date && <div className="flex justify-between"><span className="font-semibold">📅 Date:</span> <span>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>}
                  {event.venue && <div className="flex justify-between"><span className="font-semibold">📍 Venue:</span> <span>{event.venue}</span></div>}
                  {event.category && <div className="flex justify-between"><span className="font-semibold">Category:</span> <span>{event.category}</span></div>}
                  {!isFree && <div className="flex justify-between"><span className="font-semibold">💳 Fee:</span> <span className="text-amber-600 font-bold">₹{event.fees}</span></div>}
                  {isFree && <div className="flex justify-between"><span className="font-semibold">Price:</span> <span className="text-green-600 font-bold">Free</span></div>}
                </div>
                {(event.ppt_url || event.details_url || event.attachment_url) && (
                  <div className="mt-3 p-2 rounded-md bg-white border border-violet-200 text-sm">
                    <span className="font-semibold text-violet-800">Attached Details: </span>
                    <a
                      href={event.ppt_url || event.details_url || event.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-violet-700 hover:underline"
                    >
                      Open PPT/Details
                    </a>
                  </div>
                )}
                {event.description && (
                  <>
                    <hr className="border-violet-200 my-3" />
                    <p className="text-xs text-gray-600">{event.description}</p>
                  </>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-bold text-blue-900 mb-3">✓ Terms & Conditions</h3>
                <div className="text-xs text-gray-700 space-y-2 mb-4 max-h-32 overflow-y-auto">
                  <p>• I confirm that I am eligible to attend this event</p>
                  <p>• I understand the event schedule and requirements</p>
                  <p>• I agree to follow the event code of conduct</p>
                  <p>• My attendance information may be recorded for certificate generation</p>
                  {!isFree && <p>• I will submit payment proof for verification before attendance</p>}
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsRead}
                    onChange={(e) => {
                      setTermsRead(e.target.checked)
                      if (e.target.checked) {
                        const newErrors = { ...errors }
                        delete newErrors.terms
                        setErrors(newErrors)
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300 accent-blue-600"
                  />
                  <span className="text-sm font-semibold text-gray-700">I have read and understand the terms</span>
                </label>
                <Err f="terms" />
              </div>
            </>
          )}

          {/* STEP 2: Payment Info */}
          {currentStep === 2 && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h3 className="font-bold text-green-900 mb-3">👤 Your Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="font-semibold text-gray-700">Name:</span> <span className="text-gray-800">{firstNameRef.current?.value} {lastNameRef.current?.value}</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-gray-700">Email:</span> <span className="text-gray-800 text-xs">{emailRef.current?.value}</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-gray-700">Phone:</span> <span className="text-gray-800">{phoneRef.current?.value}</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-gray-700">Department:</span> <span className="text-gray-800">{department}</span></div>
                </div>
              </div>

              {!isFree && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h3 className="font-bold text-amber-900 mb-3">💳 Payment Information</h3>
                  <p className="text-xs text-amber-800 mb-3">Fee: <span className="font-bold">₹{event.fees}</span></p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Transaction/Receipt URL</label>
                      <input
                        type="url"
                        value={receiptUrl}
                        onChange={(e) => setReceiptUrl(e.target.value)}
                        placeholder="https://example.com/receipt"
                        className={ic("payment")}
                      />
                      <p className="text-xs text-gray-500 mt-1">Paste the link to your payment receipt or screenshot</p>
                    </div>
                    <p className="text-center text-gray-500 text-xs">OR</p>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Transaction ID</label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="e.g., TXN123456789"
                        className={ic("payment")}
                      />
                      <p className="text-xs text-gray-500 mt-1">Your bank/payment app transaction ID</p>
                    </div>
                  </div>
                  <Err f="payment" />
                </div>
              )}

              {isFree && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-lg font-bold text-green-700">🎉 This event is FREE!</p>
                  <p className="text-sm text-green-600 mt-1">No payment required to attend</p>
                </div>
              )}
            </>
          )}

          {/* STEP 3: Confirmation */}
          {currentStep === 3 && (
            <>
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <h3 className="font-bold text-indigo-900 mb-4">✓ Registration Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="border-b border-indigo-200 pb-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Event</p>
                    <p className="font-bold text-gray-800">{event.title}</p>
                  </div>
                  <div className="border-b border-indigo-200 pb-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Participant</p>
                    <p className="font-semibold text-gray-800">{firstNameRef.current?.value} {lastNameRef.current?.value}</p>
                    <p className="text-xs text-gray-600">{emailRef.current?.value}</p>
                  </div>
                  {!isFree && (
                    <div className="border-b border-indigo-200 pb-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Payment Status</p>
                      <p className="font-bold text-amber-600">⏳ Pending Verification</p>
                      <p className="text-xs text-gray-600 mt-1">The organizer will verify your payment receipt</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Next Steps</p>
                    <ul className="text-xs text-gray-700 mt-1 space-y-1 list-disc list-inside">
                      <li>You'll receive a registration confirmation</li>
                      {!isFree && <li>Event organizer will verify your payment</li>}
                      <li>You'll get event details and final instructions</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 text-xs text-violet-800">
                <strong>Note:</strong> By submitting, you confirm all information is correct and agree to the event terms.
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            {currentStep > 1 && (
              <button onClick={handlePreviousStep}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">
                ← Back
              </button>
            )}
            {currentStep < 3 && (
              <button onClick={handleNextStep}
                className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors">
                Next →
              </button>
            )}
            {currentStep === 3 && (
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60">
                {submitting ? "Submitting..." : "Confirm Registration ✓"}
              </button>
            )}
            {currentStep === 1 && (
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}