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
  const [isNonVitian, setIsNonVitian] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    phone: '',
    // VITian fields
    department: '', division: '', year: '', grNumber: '', campus: '', designation: '',
    // Non-VITian fields
    college_name: '', nonVitDepartment: '', nonVitYear: '',
    // Shared
    interests: []
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleEmailChange = (val) => {
    update('email', val)
    if (val.length > 0) {
      setIsNonVitian(!val.endsWith('@vit.edu'))
    } else {
      setIsNonVitian(false)
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

  // ── Step 1 validation ──────────────────────────────────────────
  const canProceedStep1 = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.phone) return false
    if (isNonVitian && !form.college_name) return false
    return true
  }

  // ── Step 2 validation ──────────────────────────────────────────
  const canProceedStep2 = () => {
    if (isNonVitian) {
      return !!(form.nonVitDepartment && form.nonVitYear)
    }
    if (!form.department || !form.campus) return false
    if (role === 'student' && (!form.grNumber || !form.division || !form.year)) return false
    if (role === 'faculty' && (!form.designation || !form.grNumber)) return false
    return true
  }

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const body = isNonVitian
        ? {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            password: form.password,
            phone: form.phone,
            role: 'student',
            college_name: form.college_name,
            department: form.nonVitDepartment,
            year: form.nonVitYear,
            interests: form.interests,
          }
        : {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            password: form.password,
            phone: form.phone,
            role: role,
            department: form.department,
            division: form.division,
            year: form.year,
            grNumber: form.grNumber,
            campus: form.campus,
            designation: form.designation,
            interests: form.interests,
          }

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (response.ok) {
        setStep(data.pending ? 5 : 4)
      } else {
        setError(data.message || 'Registration failed!')
      }
    } catch (err) {
      setError('Cannot connect to server! Make sure backend is running on port 5000.')
    }
    setLoading(false)
  }

  // ── Styles ─────────────────────────────────────────────────────
  const inputStyle = {
    background: '#f8faff', border: '1px solid #cbd5e1', color: '#1a3a6b',
    borderRadius: '10px', width: '100%', padding: '12px 14px',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box'
  }
  const labelStyle = {
    color: '#1a3a6b', fontSize: '13px', fontWeight: '600',
    display: 'block', marginBottom: '6px'
  }
  const focusIn = e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }
  const focusOut = e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }

  // ── Step labels ────────────────────────────────────────────────
  const stepLabels = isNonVitian
    ? ['Personal Info', 'College Info', 'Interests']
    : ['Personal Info', 'Academic Info', 'Interests']

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

          {/* ── SUCCESS: VITian ── */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
              <h2 style={{ color: '#16a34a', fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>Account Created!</h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
                Welcome {form.firstName}! Your account is ready. You can now login.
              </p>
              <button onClick={() => navigate('/login')}
                style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '13px 32px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
                Go to Login →
              </button>
            </div>
          )}

          {/* ── PENDING: Non-VITian ── */}
          {step === 5 && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>⏳</div>
              <h2 style={{ color: '#d97706', fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>Registration Submitted!</h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '12px' }}>
                Hi {form.firstName}! Your registration from <strong>{form.college_name}</strong> has been submitted.
              </p>
              <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                <p style={{ color: '#92400e', fontSize: '13px' }}>
                  📋 A coordinator will review and approve your account. You can login once approved.
                </p>
              </div>
              <button onClick={() => navigate('/login')}
                style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '13px 32px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
                Go to Login →
              </button>
            </div>
          )}

          {/* ── STEPS 1–3 ── */}
          {step !== 4 && step !== 5 && (
            <>
              {/* Role Selector — only for VITians */}
              {!isNonVitian && (
                <div style={{ background: '#f0f4ff', borderRadius: '12px', padding: '4px', display: 'flex', marginBottom: '24px' }}>
                  {['student', 'faculty'].map(r => (
                    <button key={r} onClick={() => { setRole(r); setStep(1) }}
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
              )}

              {/* Non-VITian badge */}
              {isNonVitian && (
                <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '10px', padding: '10px 14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>🏫</span>
                  <div>
                    <p style={{ color: '#92400e', fontSize: '12px', fontWeight: '700', margin: 0 }}>Non-VIT Student Registration</p>
                    <p style={{ color: '#b45309', fontSize: '11px', margin: 0 }}>Requires coordinator approval before login</p>
                  </div>
                </div>
              )}

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
                {stepLabels.map((label, i) => (
                  <span key={label} style={{
                    color: step === i + 1 ? '#1a3a6b' : '#94a3b8',
                    fontSize: '11px', fontWeight: step === i + 1 ? '700' : '400',
                    flex: 1, textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right'
                  }}>
                    {label}
                  </span>
                ))}
              </div>

              {/* Error */}
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                  <p style={{ color: '#dc2626', fontSize: '13px' }}>⚠️ {error}</p>
                </div>
              )}

              {/* ════════════════════════════════════════
                  STEP 1 — Personal Info
                  (same for both VITian & Non-VITian)
              ════════════════════════════════════════ */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>First Name *</label>
                      <input style={inputStyle} placeholder="Tejal" value={form.firstName}
                        onChange={e => update('firstName', e.target.value)}
                        onFocus={focusIn} onBlur={focusOut} />
                    </div>
                    <div>
                      <label style={labelStyle}>Last Name *</label>
                      <input style={inputStyle} placeholder="Jadhav" value={form.lastName}
                        onChange={e => update('lastName', e.target.value)}
                        onFocus={focusIn} onBlur={focusOut} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Email Address *</label>
                    <input style={inputStyle} type="email"
                      placeholder="your@email.com or name@vit.edu"
                      value={form.email}
                      onChange={e => handleEmailChange(e.target.value)}
                      onFocus={focusIn} onBlur={focusOut} />
                    {form.email && !isNonVitian &&
                      <p style={{ color: '#16a34a', fontSize: '11px', marginTop: '4px' }}>✅ VIT email detected — full registration unlocked</p>}
                    {isNonVitian &&
                      <p style={{ color: '#d97706', fontSize: '11px', marginTop: '4px' }}>🏫 Non-VIT email — simplified form below</p>}
                  </div>

                  <div>
                    <label style={labelStyle}>Phone Number *</label>
                    <input style={inputStyle} placeholder="+91 98765 43210" value={form.phone}
                      onChange={e => update('phone', e.target.value)}
                      onFocus={focusIn} onBlur={focusOut} />
                  </div>

                  {/* Non-VITian: College Name in Step 1 */}
                  {isNonVitian && (
                    <div>
                      <label style={labelStyle}>College Name *</label>
                      <input style={inputStyle} placeholder="e.g. MIT College of Engineering"
                        value={form.college_name}
                        onChange={e => update('college_name', e.target.value)}
                        onFocus={focusIn} onBlur={focusOut} />
                    </div>
                  )}

                  <div>
                    <label style={labelStyle}>Password *</label>
                    <input style={inputStyle} type="password" placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={e => update('password', e.target.value)}
                      onFocus={focusIn} onBlur={focusOut} />
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
                      {isNonVitian
                        ? 'Fill name, email, phone, college name and password'
                        : 'Fill all required fields'}
                    </p>
                  )}
                </div>
              )}

              {/* ════════════════════════════════════════
                  STEP 2A — VITian Academic Info
              ════════════════════════════════════════ */}
              {step === 2 && !isNonVitian && (
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
                          onChange={e => update('grNumber', e.target.value)}
                          onFocus={focusIn} onBlur={focusOut} />
                        <p style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>📌 Found on your college ID card</p>
                      </div>
                    </>
                  )}

                  {role === 'faculty' && (
                    <>
                      <div>
                        <label style={labelStyle}>Designation *</label>
                        <input style={inputStyle} placeholder="e.g. Assistant Professor" value={form.designation}
                          onChange={e => update('designation', e.target.value)}
                          onFocus={focusIn} onBlur={focusOut} />
                      </div>
                      <div>
                        <label style={labelStyle}>Employee ID *</label>
                        <input style={inputStyle} placeholder="e.g. VIT-FAC-2019-045" value={form.grNumber}
                          onChange={e => update('grNumber', e.target.value)}
                          onFocus={focusIn} onBlur={focusOut} />
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

              {/* ════════════════════════════════════════
                  STEP 2B — Non-VITian College Info
                  (No GR, No Division, No Campus)
              ════════════════════════════════════════ */}
              {step === 2 && isNonVitian && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                  <div>
                    <label style={labelStyle}>Department *</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.nonVitDepartment}
                      onChange={e => update('nonVitDepartment', e.target.value)}>
                      <option value="">Select your department</option>
                      {departments.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Year *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(y => (
                        <button key={y} onClick={() => update('nonVitYear', y)}
                          style={{
                            padding: '10px 6px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                            background: form.nonVitYear === y ? '#1a3a6b' : '#f0f4ff',
                            color: form.nonVitYear === y ? '#fff' : '#64748b',
                            border: `2px solid ${form.nonVitYear === y ? '#1a3a6b' : '#dbeafe'}`
                          }}>
                          {y}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary of what they filled in Step 1 */}
                  <div style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '10px', padding: '12px' }}>
                    <p style={{ color: '#1a3a6b', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>✅ From Step 1:</p>
                    <p style={{ color: '#64748b', fontSize: '12px' }}>👤 {form.firstName} {form.lastName}</p>
                    <p style={{ color: '#64748b', fontSize: '12px' }}>📧 {form.email}</p>
                    <p style={{ color: '#64748b', fontSize: '12px' }}>📞 {form.phone}</p>
                    <p style={{ color: '#64748b', fontSize: '12px' }}>🏫 {form.college_name}</p>
                  </div>

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

              {/* ════════════════════════════════════════
                  STEP 3 — Interests (same for both)
              ════════════════════════════════════════ */}
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
                      {(isNonVitian
                        ? [
                            { label: 'Name', value: `${form.firstName} ${form.lastName}` },
                            { label: 'Email', value: form.email },
                            { label: 'Phone', value: form.phone },
                            { label: 'College', value: form.college_name },
                            { label: 'Department', value: form.nonVitDepartment },
                            { label: 'Year', value: form.nonVitYear },
                          ]
                        : [
                            { label: 'Name', value: `${form.firstName} ${form.lastName}` },
                            { label: 'Email', value: form.email },
                            { label: 'Role', value: role === 'student' ? '🎓 Student' : '👨‍🏫 Faculty' },
                            { label: 'Campus', value: form.campus },
                            { label: 'Department', value: form.department },
                            { label: role === 'student' ? 'GR Number' : 'Employee ID', value: form.grNumber },
                          ]
                      ).map(item => (
                        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748b', fontSize: '12px' }}>{item.label}:</span>
                          <span style={{ color: '#1a3a6b', fontSize: '12px', fontWeight: '600' }}>{item.value}</span>
                        </div>
                      ))}
                    </div>

                    {isNonVitian && (
                      <div style={{ marginTop: '10px', background: '#fffbeb', borderRadius: '8px', padding: '8px 12px' }}>
                        <p style={{ color: '#92400e', fontSize: '11px', margin: 0 }}>
                          ⚠️ Account needs coordinator approval before you can login.
                        </p>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => setStep(2)}
                      style={{ flex: 1, background: '#f0f4ff', color: '#1a3a6b', border: '1px solid #dbeafe', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                      ← Back
                    </button>
                    <button onClick={handleSubmit} disabled={loading}
                      style={{ flex: 2, background: loading ? '#94a3b8' : '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}>
                      {loading ? '⏳ Creating Account...' : isNonVitian ? '📋 Submit for Approval' : '🎉 Create Account'}
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