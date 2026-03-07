import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const departments = ['Computer Engineering', 'IT', 'Mechanical', 'Civil', 'ENTC', 'MBA', 'MCA']
const divisions = ['A', 'B', 'C', 'D']
const interests = ['Hackathons', 'Cultural', 'Sports', 'Seminars', 'Workshops', 'Networking', 'Photography', 'Music', 'Dance', 'Robotics']
const campuses = ['Kondhwa', 'Bibwewadi']

export default function Register() {
  const navigate = useNavigate()
  const [role, setRole] = useState('student')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    department: '', division: '', year: '', grNumber: '',
    phone: '', campus: '', interests: [], designation: ''
  })
  const [emailError, setEmailError] = useState('')

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const validateEmail = (email) => {
    if (email && !email.endsWith('@vit.edu')) {
      setEmailError('Only @vit.edu email addresses are allowed')
    } else {
      setEmailError('')
    }
  }

  const toggleInterest = (interest) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const canProceedStep1 = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) return false
    if (!form.email.endsWith('@vit.edu')) return false
    return true
  }

  const canProceedStep2 = () => {
    if (!form.department || !form.campus) return false
    if (role === 'student' && (!form.grNumber || !form.division || !form.year)) return false
    if (role === 'faculty' && (!form.designation || !form.grNumber)) return false
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          role: role,
          department: form.department,
          division: form.division,
          year: form.year,
          grNumber: form.grNumber,
          campus: form.campus,
          phone: form.phone,
          designation: form.designation,
          interests: form.interests,
        })
      })

      const data = await response.json()

      if (response.ok) {
        setStep(4)
      } else {
        setError(data.message || 'Registration failed!')
      }
    } catch (err) {
      setError('Cannot connect to server! Make sure backend is running on port 5000.')
    }
    setLoading(false)
  }

  const inputStyle = {
    background: '#f8faff', border: '1px solid #cbd5e1', color: '#6d9ee8',
    borderRadius: '10px', width: '100%', padding: '12px 14px',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box'
  }
  const labelStyle = { color: '#1a3a6b', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', paddingTop: '80px' }}>
        <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '20px', width: '100%', maxWidth: '520px', padding: '40px', boxShadow: '0 8px 32px rgba(26,58,107,0.08)' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ background: '#1a3a6b', borderRadius: '12px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '16px', margin: '0 auto 12px' }}>CE</div>
            <h1 style={{ color: '#1a3a6b', fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>Create Account</h1>
            <p style={{ color: '#64748b', fontSize: '13px' }}>Vishwakarma Institute of Technology, Pune</p>
          </div>

          {/* SUCCESS - Step 4 */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
              <h2 style={{ color: '#16a34a', fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>Account Created!</h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
                Welcome {form.firstName}! Your account has been created successfully. You can now login!
              </p>
              <button onClick={() => navigate('/login')}
                style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '13px 32px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
                Go to Login →
              </button>
            </div>
          )}

          {/* STEPS 1-3 */}
          {step !== 4 && (
            <>
              {/* Role Selector */}
              <div style={{ background: '#f0f4ff', borderRadius: '12px', padding: '4px', display: 'flex', marginBottom: '24px' }}>
                {['student', 'faculty'].map(r => (
                  <button key={r} onClick={() => { setRole(r); setStep(1); setForm({ firstName: '', lastName: '', email: '', password: '', department: '', division: '', year: '', grNumber: '', phone: '', campus: '', interests: [], designation: '' }) }}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                      background: role === r ? '#1a3a6b' : 'transparent',
                      color: role === r ? '#fff' : '#64748b',
                      border: 'none', cursor: 'pointer'
                    }}>
                    {r === 'student' ? '🎓 Student' : '👨‍🏫 Faculty'}
                  </button>
                ))}
              </div>

              {/* Step Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                {[1, 2, 3].map((s, i) => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '13px', fontWeight: '700', flexShrink: 0,
                      background: step > s ? '#16a34a' : step === s ? '#1a3a6b' : '#f0f4ff',
                      color: step >= s ? '#fff' : '#94a3b8',
                      border: step >= s ? 'none' : '1px solid #dbeafe'
                    }}>
                      {step > s ? '✓' : s}
                    </div>
                    {i < 2 && <div style={{ flex: 1, height: '2px', background: step > s ? '#16a34a' : '#dbeafe', margin: '0 4px' }} />}
                  </div>
                ))}
              </div>

              {/* Step Labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                {['Personal Info', 'Academic Info', 'Interests'].map((label, i) => (
                  <span key={label} style={{ color: step === i + 1 ? '#1a3a6b' : '#94a3b8', fontSize: '11px', fontWeight: step === i + 1 ? '700' : '400', flex: 1, textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right' }}>
                    {label}
                  </span>
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                  <p style={{ color: '#dc2626', fontSize: '13px' }}>⚠️ {error}</p>
                </div>
              )}

              {/* STEP 1 - Personal Info */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>First Name *</label>
                      <input style={inputStyle} placeholder="Tejal" value={form.firstName}
                        onChange={e => update('firstName', e.target.value)}
                        onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                        onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Last Name *</label>
                      <input style={inputStyle} placeholder="Jadhav" value={form.lastName}
                        onChange={e => update('lastName', e.target.value)}
                        onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                        onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Official College Email *</label>
                    <input
                      style={{ ...inputStyle, borderColor: emailError ? '#dc2626' : '#cbd5e1' }}
                      type="email" placeholder="firstname.lastname23@vit.edu"
                      value={form.email}
                      onChange={e => { update('email', e.target.value); validateEmail(e.target.value) }}
                      onFocus={e => { e.target.style.background = '#fff' }}
                      onBlur={e => { e.target.style.background = '#f8faff' }} />
                    {emailError && <p style={{ color: '#dc2626', fontSize: '11px', marginTop: '4px' }}>⚠️ {emailError}</p>}
                    {form.email && !emailError && <p style={{ color: '#16a34a', fontSize: '11px', marginTop: '4px' }}>✅ Valid VIT email</p>}
                  </div>

                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input style={inputStyle} placeholder="+91 98765 43210" value={form.phone}
                      onChange={e => update('phone', e.target.value)}
                      onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                      onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
                  </div>

                  <div>
                    <label style={labelStyle}>Password *</label>
                    <input style={inputStyle} type="password" placeholder="Min. 8 characters" value={form.password}
                      onChange={e => update('password', e.target.value)}
                      onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                      onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
                  </div>

                  <button onClick={() => canProceedStep1() && setStep(2)}
                    style={{
                      background: canProceedStep1() ? '#1a3a6b' : '#94a3b8',
                      color: '#fff', border: 'none', borderRadius: '10px', padding: '13px',
                      fontSize: '15px', fontWeight: '700',
                      cursor: canProceedStep1() ? 'pointer' : 'not-allowed', marginTop: '4px'
                    }}>
                    Continue →
                  </button>
                  {!canProceedStep1() && (form.firstName || form.email) && (
                    <p style={{ color: '#94a3b8', fontSize: '11px', textAlign: 'center' }}>
                      Fill all required fields with a valid @vit.edu email
                    </p>
                  )}
                </div>
              )}

              {/* STEP 2 - Academic Info */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                  {/* Campus */}
                  <div>
                    <label style={labelStyle}>Campus *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {campuses.map(c => (
                        <button key={c} onClick={() => update('campus', c)}
                          style={{
                            padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                            background: form.campus === c ? '#1a3a6b' : '#f0f4ff',
                            color: form.campus === c ? '#fff' : '#64748b',
                            border: `2px solid ${form.campus === c ? '#1a3a6b' : '#dbeafe'}`
                          }}>
                          🏫 {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Department */}
                  <div>
                    <label style={labelStyle}>Department *</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.department}
                      onChange={e => update('department', e.target.value)}>
                      <option value="">Select your department</option>
                      {departments.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* STUDENT Fields */}
                  {role === 'student' && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={labelStyle}>Year *</label>
                          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.year}
                            onChange={e => update('year', e.target.value)}>
                            <option value="">Select</option>
                            {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(y => <option key={y}>{y}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Division *</label>
                          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.division}
                            onChange={e => update('division', e.target.value)}>
                            <option value="">Select</option>
                            {divisions.map(d => <option key={d}>{d}</option>)}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label style={labelStyle}>GR Number * <span style={{ color: '#64748b', fontWeight: '400' }}>(Unique student ID)</span></label>
                        <input style={inputStyle} placeholder="e.g. VIT2023CSE045" value={form.grNumber}
                          onChange={e => update('grNumber', e.target.value)}
                          onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                          onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
                        <p style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>📌 Your unique GR number from your college ID card</p>
                      </div>
                    </>
                  )}

                  {/* FACULTY Fields */}
                  {role === 'faculty' && (
                    <>
                      <div>
                        <label style={labelStyle}>Designation *</label>
                        <input style={inputStyle} placeholder="e.g. Assistant Professor" value={form.designation}
                          onChange={e => update('designation', e.target.value)}
                          onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                          onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
                      </div>
                      <div>
                        <label style={labelStyle}>Employee ID * <span style={{ color: '#64748b', fontWeight: '400' }}>(Unique faculty ID)</span></label>
                        <input style={inputStyle} placeholder="e.g. VIT-FAC-2019-045" value={form.grNumber}
                          onChange={e => update('grNumber', e.target.value)}
                          onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                          onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
                        <p style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>📌 Your unique Employee ID from your faculty ID card</p>
                      </div>
                    </>
                  )}

                  <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                    <button onClick={() => setStep(1)}
                      style={{ flex: 1, background: '#f0f4ff', color: '#1a3a6b', border: '1px solid #dbeafe', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                      ← Back
                    </button>
                    <button onClick={() => canProceedStep2() && setStep(3)}
                      style={{
                        flex: 2, background: canProceedStep2() ? '#1a3a6b' : '#94a3b8',
                        color: '#fff', border: 'none', borderRadius: '10px', padding: '12px',
                        fontSize: '14px', fontWeight: '700',
                        cursor: canProceedStep2() ? 'pointer' : 'not-allowed'
                      }}>
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 - Interests */}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: '4px' }}>🎯 Select your interests</label>
                    <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '12px' }}>
                      This helps us suggest relevant events for you
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {interests.map(i => (
                        <button key={i} onClick={() => toggleInterest(i)}
                          style={{
                            padding: '7px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                            background: form.interests.includes(i) ? '#1a3a6b' : '#f0f4ff',
                            color: form.interests.includes(i) ? '#fff' : '#64748b',
                            border: `1px solid ${form.interests.includes(i) ? '#1a3a6b' : '#dbeafe'}`,
                            fontWeight: form.interests.includes(i) ? '600' : '400'
                          }}>
                          {i}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '16px' }}>
                    <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>📋 Registration Summary</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {[
                        { label: 'Name', value: `${form.firstName} ${form.lastName}` },
                        { label: 'Email', value: form.email },
                        { label: 'Role', value: role === 'student' ? '🎓 Student' : '👨‍🏫 Faculty' },
                        { label: 'Campus', value: form.campus },
                        { label: 'Department', value: form.department },
                        role === 'student'
                          ? { label: 'GR Number', value: form.grNumber }
                          : { label: 'Employee ID', value: form.grNumber },
                      ].map(item => (
                        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748b', fontSize: '12px' }}>{item.label}:</span>
                          <span style={{ color: '#1a3a6b', fontSize: '12px', fontWeight: '600' }}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => setStep(2)}
                      style={{ flex: 1, background: '#f0f4ff', color: '#1a3a6b', border: '1px solid #dbeafe', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                      ← Back
                    </button>
                    <button onClick={handleSubmit} disabled={loading}
                      style={{ flex: 2, background: loading ? '#94a3b8' : '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}>
                      {loading ? '⏳ Creating Account...' : '🎉 Create Account'}
                    </button>
                  </div>
                </div>
              )}

              <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}