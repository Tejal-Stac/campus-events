import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import api from '../api/axiosConfig'

const DEPARTMENTS = [
  'Computer Engineering',
  'Information Technology',
  'Mechanical Engineering',
  'Electronics & Telecommunication',
  'Civil Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Production Engineering',
]

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState('student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    department: '', division: '', year: '', grNumber: '', campus: 'Kondhwa',
    phone: '', designation: '', interests: [],
    college_name: '', college_email: '',
    hodDepartment: '',   // ← NEW: which dept the HOD heads
  })

  const roles = [
    { id: 'student',  label: 'Student',        icon: '🎓', desc: 'Access events & certificates' },
    { id: 'faculty',  label: 'Faculty / HOD',   icon: '👨‍🏫', desc: 'Faculty or Head of Department' },
    { id: 'dean',     label: 'Dean / Admin',    icon: '👑', desc: 'Full system access' },
  ]

  const isVitian = form.email.endsWith('@vit.edu')
  const isHodRole = selectedRole === 'faculty' && form.designation?.toLowerCase() === 'hod'

  const update = (field, val) => setForm(prev => ({ ...prev, [field]: val }))

  const validateStep1 = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) return 'First and last name are required'
    if (!form.email.trim()) return 'Email is required'
    if (selectedRole !== 'student' && !form.email.endsWith('@vit.edu')) return 'Only @vit.edu emails allowed for this role'
    if (!form.password) return 'Password is required'
    if (form.password.length < 6) return 'Password must be at least 6 characters'
    if (form.password !== form.confirmPassword) return 'Passwords do not match'
    return null
  }

  const validateStep2 = () => {
    if (selectedRole === 'student' && !isVitian && !form.college_name) return 'College name is required for non-VIT students'
    if (form.designation?.toLowerCase() === 'hod' && !form.hodDepartment) return 'Please select which department you head'
    return null
  }

  const handleSubmit = async () => {
    setError('')
    const step2Err = validateStep2()
    if (step2Err) { setError(step2Err); return }

    setLoading(true)
    try {
      // Build bio string for HOD
      let designation = form.designation
      let department = form.department

      if (designation?.toLowerCase() === 'hod' && form.hodDepartment) {
        department = form.hodDepartment  // HOD's department = the dept they head
      }

      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: selectedRole,
        department,
        division: form.division,
        year: form.year,
        grNumber: form.grNumber,
        campus: form.campus,
        phone: form.phone,
        designation,
        interests: form.interests,
        college_name: !isVitian ? form.college_name : undefined,
        college_email: !isVitian ? form.college_email : undefined,
        hod_department: form.hodDepartment || undefined,
      }

      const res = await api.post('/auth/register', payload)
      const data = res.data

      if (data.pending) {
        setSuccess('Registration submitted! Awaiting coordinator approval.')
        return
      }

      setSuccess('Registration successful! Redirecting...')
      setTimeout(() => navigate('/login'), 1500)

    } catch (err) {
      setError(err.response?.data?.message || 'Cannot connect to server.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: '#f8faff', border: '1px solid #cbd5e1', color: '#1a3a6b',
    borderRadius: '10px', width: '100%', padding: '11px 14px',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box'
  }
  const labelStyle = { color: '#1a3a6b', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }
  const fieldWrap = { display: 'flex', flexDirection: 'column', gap: '4px' }

  // ── HOD Bio preview ────────────────────────────────────────
  const hodBio = form.hodDepartment
    ? `Head of Department of ${form.hodDepartment}`
    : ''

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', minHeight: '100vh', padding: '24px', paddingTop: '90px' }}>
        <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '20px', width: '100%', maxWidth: '540px', padding: '40px', boxShadow: '0 8px 32px rgba(26,58,107,0.08)' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ background: '#1a3a6b', borderRadius: '12px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '16px', margin: '0 auto 12px' }}>CE</div>
            <h1 style={{ color: '#1a3a6b', fontSize: '22px', fontWeight: '700', marginBottom: '4px' }}>Create Account</h1>
            <p style={{ color: '#64748b', fontSize: '13px' }}>Vishwakarma Institute of Technology, Pune</p>
          </div>

          {/* Progress */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
            {[1, 2].map(s => (
              <div key={s} style={{ flex: 1, height: '4px', borderRadius: '4px', background: step >= s ? '#1a3a6b' : '#dbeafe', transition: 'background 0.3s' }}/>
            ))}
          </div>

          {success ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
              <h2 style={{ color: '#059669', fontSize: '20px', fontWeight: '700' }}>
                {success.includes('pending') ? 'Registration Submitted!' : 'Registration Successful!'}
              </h2>
              <p style={{ color: '#64748b', fontSize: '13px', marginTop: '8px' }}>{success}</p>
            </div>
          ) : (
            <>
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                  <p style={{ color: '#dc2626', fontSize: '13px' }}>⚠️ {error}</p>
                </div>
              )}

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Role Selector */}
                  <div>
                    <label style={labelStyle}>I am registering as *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                      {roles.map(r => (
                        <button key={r.id} type="button" onClick={() => setSelectedRole(r.id)}
                          style={{ padding: '10px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', textAlign: 'center', background: selectedRole === r.id ? '#1a3a6b' : '#f8faff', color: selectedRole === r.id ? '#fff' : '#64748b', border: `2px solid ${selectedRole === r.id ? '#1a3a6b' : '#dbeafe'}`, transition: 'all 0.2s' }}>
                          <div style={{ fontSize: '18px', marginBottom: '4px' }}>{r.icon}</div>
                          <div style={{ fontWeight: '700' }}>{r.label}</div>
                          <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>{r.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={fieldWrap}>
                      <label style={labelStyle}>First Name *</label>
                      <input style={inputStyle} value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder="John" required/>
                    </div>
                    <div style={fieldWrap}>
                      <label style={labelStyle}>Last Name *</label>
                      <input style={inputStyle} value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Doe" required/>
                    </div>
                  </div>

                  {/* Email */}
                  <div style={fieldWrap}>
                    <label style={labelStyle}>
                      {selectedRole === 'student' ? 'Email Address *' : 'Official VIT Email *'}
                    </label>
                    <input type="email" style={{ ...inputStyle }} value={form.email} onChange={e => update('email', e.target.value)}
                      placeholder={selectedRole === 'student' ? 'name@vit.edu or personal@email.com' : 'firstname.lastname@vit.edu'} required/>
                    {form.email && form.email.endsWith('@vit.edu') && (
                      <p style={{ color: '#16a34a', fontSize: '11px' }}>✅ Valid VIT email</p>
                    )}
                    {form.email && !form.email.endsWith('@vit.edu') && selectedRole !== 'student' && (
                      <p style={{ color: '#dc2626', fontSize: '11px' }}>⚠️ Only @vit.edu allowed for this role</p>
                    )}
                    {form.email && !form.email.endsWith('@vit.edu') && selectedRole === 'student' && (
                      <p style={{ color: '#d97706', fontSize: '11px' }}>🏫 Non-VIT student — will require coordinator approval</p>
                    )}
                  </div>

                  {/* Password */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={fieldWrap}>
                      <label style={labelStyle}>Password *</label>
                      <input type="password" style={inputStyle} value={form.password} onChange={e => update('password', e.target.value)} placeholder="Min. 6 characters" required/>
                    </div>
                    <div style={fieldWrap}>
                      <label style={labelStyle}>Confirm Password *</label>
                      <input type="password" style={{ ...inputStyle, borderColor: form.confirmPassword && form.password !== form.confirmPassword ? '#dc2626' : '#cbd5e1' }}
                        value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} placeholder="Repeat password" required/>
                      {form.confirmPassword && form.password !== form.confirmPassword && (
                        <p style={{ color: '#dc2626', fontSize: '11px' }}>⚠️ Passwords don't match</p>
                      )}
                    </div>
                  </div>

                  <button type="button"
                    onClick={() => {
                      const err = validateStep1()
                      if (err) { setError(err); return }
                      setError('')
                      setStep(2)
                    }}
                    style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '13px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '4px' }}>
                    Next →
                  </button>
                </div>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* Faculty/HOD Designation */}
                  {selectedRole === 'faculty' && (
                    <div style={fieldWrap}>
                      <label style={labelStyle}>Designation *</label>
                      <select style={inputStyle} value={form.designation} onChange={e => update('designation', e.target.value)}>
                        <option value="">-- Select Designation --</option>
                        <option value="Professor">Professor</option>
                        <option value="Associate Professor">Associate Professor</option>
                        <option value="Assistant Professor">Assistant Professor</option>
                        <option value="Lecturer">Lecturer</option>
                        <option value="HOD">HOD (Head of Department)</option>
                        <option value="Dean">Dean</option>
                      </select>
                    </div>
                  )}

                  {/* ── HOD Department Selector ── */}
                  {selectedRole === 'faculty' && form.designation?.toLowerCase() === 'hod' && (
                    <div>
                      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 14px', marginBottom: '12px', display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>🏛️</span>
                        <div>
                          <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700' }}>HOD Registration</p>
                          <p style={{ color: '#64748b', fontSize: '12px' }}>Select the department you are Head of. This will be shown in your profile bio and will filter your dashboard data.</p>
                        </div>
                      </div>
                      <label style={labelStyle}>Head of Department of *</label>
                      <select style={inputStyle} value={form.hodDepartment} onChange={e => update('hodDepartment', e.target.value)}>
                        <option value="">-- Select Your Department --</option>
                        {DEPARTMENTS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      {form.hodDepartment && (
                        <div style={{ background: '#fdf4ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '10px 14px', marginTop: '8px' }}>
                          <p style={{ color: '#7c3aed', fontSize: '12px', fontWeight: '600' }}>
                            📋 Profile Bio Preview:
                          </p>
                          <p style={{ color: '#1a3a6b', fontSize: '13px', marginTop: '4px' }}>
                            "Head of Department of {form.hodDepartment}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Department (for non-HOD) */}
                  {!(selectedRole === 'faculty' && form.designation?.toLowerCase() === 'hod') && (
                    <div style={fieldWrap}>
                      <label style={labelStyle}>Department</label>
                      <select style={inputStyle} value={form.department} onChange={e => update('department', e.target.value)}>
                        <option value="">-- Select Department --</option>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Student fields */}
                  {selectedRole === 'student' && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={fieldWrap}>
                          <label style={labelStyle}>Year</label>
                          <select style={inputStyle} value={form.year} onChange={e => update('year', e.target.value)}>
                            <option value="">-- Year --</option>
                            {['FY', 'SY', 'TY', 'Final Year'].map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                        <div style={fieldWrap}>
                          <label style={labelStyle}>Division</label>
                          <input style={inputStyle} value={form.division} onChange={e => update('division', e.target.value)} placeholder="e.g. A"/>
                        </div>
                      </div>
                      <div style={fieldWrap}>
                        <label style={labelStyle}>GR Number</label>
                        <input style={inputStyle} value={form.grNumber} onChange={e => update('grNumber', e.target.value)} placeholder="e.g. 2021CE001"/>
                      </div>
                    </>
                  )}

                  {/* Campus & Phone */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={fieldWrap}>
                      <label style={labelStyle}>Campus</label>
                      <select style={inputStyle} value={form.campus} onChange={e => update('campus', e.target.value)}>
                        <option value="Kondhwa">Kondhwa</option>
                        <option value="Bibwewadi">Bibwewadi</option>
                      </select>
                    </div>
                    <div style={fieldWrap}>
                      <label style={labelStyle}>Phone</label>
                      <input style={inputStyle} value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="10-digit number"/>
                    </div>
                  </div>

                  {/* Non-VITian fields */}
                  {selectedRole === 'student' && !isVitian && (
                    <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <p style={{ color: '#92400e', fontSize: '12px', fontWeight: '600' }}>🏫 Non-VIT Student Details</p>
                      <div style={fieldWrap}>
                        <label style={labelStyle}>College Name *</label>
                        <input style={inputStyle} value={form.college_name} onChange={e => update('college_name', e.target.value)} placeholder="Your college name" required/>
                      </div>
                      <div style={fieldWrap}>
                        <label style={labelStyle}>College Email</label>
                        <input style={inputStyle} value={form.college_email} onChange={e => update('college_email', e.target.value)} placeholder="Your college email"/>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button type="button" onClick={() => { setError(''); setStep(1) }}
                      style={{ flex: 1, background: '#f0f4ff', color: '#1a3a6b', border: '1px solid #dbeafe', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                      ← Back
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={loading}
                      style={{ flex: 2, background: loading ? '#94a3b8' : '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}>
                      {loading ? '⏳ Registering...' : '✅ Complete Registration'}
                    </button>
                  </div>
                </div>
              )}

              <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>Sign in here</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}