import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const departments = ['Computer Engineering', 'IT', 'Mechanical', 'Civil', 'ENTC', 'Chemical Engineering', 'AI-ML']
const interests = ['Hackathons', 'Cultural', 'Sports', 'Seminars', 'Workshops', 'Networking', 'Photography', 'Music', 'Dance', 'Robotics']
const campuses = ['Kondhwa', 'Bibwewadi']
const divisions = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']

export default function Register() {
  const navigate = useNavigate()
  const [role, setRole] = useState('student')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [nonVitBlocked, setNonVitBlocked] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    phone: '', department: '', division: '', year: '',
    grNumber: '', campus: '', designation: '', interests: []
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleEmailChange = (val) => {
    update('email', val)
    // Block non-VIT emails — they register only through event forms
    if (val.length > 5) {
      setNonVitBlocked(!val.endsWith('@vit.edu'))
    } else {
      setNonVitBlocked(false)
    }
  }

  const canProceedStep1 = () => {
    if (nonVitBlocked) return false
    return !!(form.firstName && form.lastName && form.email && form.password && form.phone)
  }

  const canProceedStep2 = () => {
    if (!form.department || !form.campus) return false
    if (role === 'student' && (!form.grNumber || !form.division || !form.year)) return false
    if (role === 'faculty' && (!form.designation || !form.grNumber)) return false
    return true
  }

  const toggleInterest = (interest) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const body = {
        firstName: form.firstName, lastName: form.lastName,
        email: form.email, password: form.password, phone: form.phone,
        role, department: form.department, division: form.division,
        year: form.year, grNumber: form.grNumber, campus: form.campus,
        designation: form.designation, interests: form.interests,
      }
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
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
    background: '#f8faff', border: '1px solid #cbd5e1', color: '#1a3a6b',
    borderRadius: '10px', width: '100%', padding: '12px 14px',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box'
  }
  const labelStyle = { color: '#1a3a6b', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }
  const focusIn = e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }
  const focusOut = e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }

  const stepLabels = ['Personal Info', 'Academic Info', 'Interests']

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

          {/* ✅ SUCCESS */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
              <h2 style={{ color: '#16a34a', fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>Account Created!</h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
                Welcome {form.firstName}! Your VIT account is ready.
              </p>
              <button onClick={() => navigate('/login')}
                style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '13px 32px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
                Go to Login →
              </button>
            </div>
          )}

          {step !== 4 && (
            <>
              {/* Role Selector */}
              <div style={{ background: '#f0f4ff', borderRadius: '12px', padding: '4px', display: 'flex', marginBottom: '24px' }}>
                {['student', 'faculty'].map(r => (
                  <button key={r} onClick={() => { setRole(r); setStep(1) }}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                      background: role === r ? '#1a3a6b' : 'transparent',
                      color: role === r ? '#fff' : '#64748b',
                      border: 'none', cursor: 'pointer'
                    }}>
                    {r === 'student' ? '🎓 VIT Student' : '👨‍🏫 VIT Faculty'}
                  </button>
                ))}
              </div>

              {/* ✅ Non-VIT notice — informational only, not a form */}
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
                <p style={{ color: '#1d4ed8', fontSize: '12px', fontWeight: '700', margin: '0 0 4px' }}>🏫 Non-VIT / External Students</p>
                <p style={{ color: '#3b82f6', fontSize: '12px', margin: 0 }}>
                  This registration is for VIT students only. External students can participate in events marked <strong>🌐 Open to All</strong> by filling the event registration form directly on the Events page — no account needed.
                </p>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                {stepLabels.map((label, i) => (
                  <span key={label} style={{
                    color: step === i + 1 ? '#1a3a6b' : '#94a3b8',
                    fontSize: '11px', fontWeight: step === i + 1 ? '700' : '400',
                    flex: 1, textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right'
                  }}>{label}</span>
                ))}
              </div>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                  <p style={{ color: '#dc2626', fontSize: '13px' }}>⚠️ {error}</p>
                </div>
              )}

              {/* STEP 1 — Personal Info */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>First Name *</label>
                      <input style={inputStyle} placeholder="First name" value={form.firstName}
                        onChange={e => update('firstName', e.target.value)} onFocus={focusIn} onBlur={focusOut} />
                    </div>
                    <div>
                      <label style={labelStyle}>Last Name *</label>
                      <input style={inputStyle} placeholder="Last name" value={form.lastName}
                        onChange={e => update('lastName', e.target.value)} onFocus={focusIn} onBlur={focusOut} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>VIT Email Address *</label>
                    <input style={{ ...inputStyle, borderColor: nonVitBlocked ? '#f87171' : '#cbd5e1' }}
                      type="email" placeholder="yourname@vit.edu"
                      value={form.email}
                      onChange={e => handleEmailChange(e.target.value)}
                      onFocus={focusIn} onBlur={focusOut} />
                    {form.email && !nonVitBlocked && form.email.includes('@') &&
                      <p style={{ color: '#16a34a', fontSize: '11px', marginTop: '4px' }}>✅ VIT email detected</p>}
                    {nonVitBlocked && (
                      <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '8px 12px', marginTop: '6px' }}>
                        <p style={{ color: '#92400e', fontSize: '12px', margin: 0 }}>
                          ⚠️ Non-VIT email detected. External students don't need an account — just go to <strong>Events</strong> and register directly for any <strong>🌐 Open to All</strong> event.
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={labelStyle}>Phone Number *</label>
                    <input style={inputStyle} placeholder="+91 98765 43210" value={form.phone}
                      onChange={e => update('phone', e.target.value)} onFocus={focusIn} onBlur={focusOut} />
                  </div>

                  <div>
                    <label style={labelStyle}>Password *</label>
                    <input style={inputStyle} type="password" placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={e => update('password', e.target.value)} onFocus={focusIn} onBlur={focusOut} />
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
                </div>
              )}

              {/* STEP 2 — Academic Info */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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

                  <div>
                    <label style={labelStyle}>Department *</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.department}
                      onChange={e => update('department', e.target.value)}>
                      <option value="">Select your department</option>
                      {departments.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>

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
                        <label style={labelStyle}>GR Number *</label>
                        <input style={inputStyle} placeholder="e.g. VIT2023CSE045" value={form.grNumber}
                          onChange={e => update('grNumber', e.target.value)} onFocus={focusIn} onBlur={focusOut} />
                        <p style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>📌 Found on your college ID card</p>
                      </div>
                    </>
                  )}

                  {role === 'faculty' && (
                    <>
                      <div>
                        <label style={labelStyle}>Designation *</label>
                        <input style={inputStyle} placeholder="e.g. Assistant Professor" value={form.designation}
                          onChange={e => update('designation', e.target.value)} onFocus={focusIn} onBlur={focusOut} />
                      </div>
                      <div>
                        <label style={labelStyle}>Employee ID *</label>
                        <input style={inputStyle} placeholder="e.g. VIT-FAC-2019-045" value={form.grNumber}
                          onChange={e => update('grNumber', e.target.value)} onFocus={focusIn} onBlur={focusOut} />
                      </div>
                    </>
                  )}

                  <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                    <button onClick={() => setStep(1)}
                      style={{ flex: 1, background: '#f0f4ff', color: '#1a3a6b', border: '1px solid #dbeafe', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                      ← Back
                    </button>
                    <button onClick={() => canProceedStep2() && setStep(3)}
                      style={{ flex: 2, background: canProceedStep2() ? '#1a3a6b' : '#94a3b8', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '700', cursor: canProceedStep2() ? 'pointer' : 'not-allowed' }}>
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 — Interests */}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: '4px' }}>🎯 Select your interests</label>
                    <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '12px' }}>This helps us suggest relevant events for you</p>
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
                    {[
                      { label: 'Name', value: `${form.firstName} ${form.lastName}` },
                      { label: 'Email', value: form.email },
                      { label: 'Role', value: role === 'student' ? '🎓 VIT Student' : '👨‍🏫 VIT Faculty' },
                      { label: 'Campus', value: form.campus },
                      { label: 'Department', value: form.department },
                      { label: role === 'student' ? 'GR Number' : 'Employee ID', value: form.grNumber },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: '#64748b', fontSize: '12px' }}>{item.label}:</span>
                        <span style={{ color: '#1a3a6b', fontSize: '12px', fontWeight: '600' }}>{item.value}</span>
                      </div>
                    ))}
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