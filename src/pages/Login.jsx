import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const roles = [
  { id: 'student', label: 'Student', icon: '🎓', desc: 'Access events & certificates' },
  { id: 'faculty', label: 'Faculty', icon: '👨‍🏫', desc: 'Manage & create events' },
  { id: 'coordinator', label: 'Coordinator', icon: '🎯', desc: 'Coordinate assigned events' },
  { id: 'volunteer', label: 'Volunteer', icon: '🙋', desc: 'View assigned duties' },
  { id: 'dean', label: 'Dean / Admin', icon: '👑', desc: 'Full system access' },
]

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)   // ── NEW: pending state
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  // ── UPDATED: only validate @vit.edu for non-student roles ──
  const validateEmail = (val) => {
    if (selectedRole !== 'student' && val && !val.endsWith('@vit.edu')) {
      setEmailError('Only @vit.edu email addresses are allowed for this role')
    } else {
      setEmailError('')
    }
  }

  const isNonVitian = email.length > 0 && !email.endsWith('@vit.edu')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsPending(false)

    // ── UPDATED: block non-VIT emails only for non-student roles ──
    if (selectedRole !== 'student' && !email.endsWith('@vit.edu')) {
      setEmailError('Only @vit.edu email addresses are allowed for this role')
      return
    }

    setLoading(true)
    setError('')

    try {
      const user = await login(email, password, selectedRole)

      console.log('🔍 Login Response:', user)
      console.log('🔍 User Role:', user.role)

      const dashboardMap = {
        student: '/student-dashboard',
        coordinator: '/coordinator-dashboard',
        club_head: '/coordinator-dashboard',
        volunteer: '/volunteer-dashboard',
        faculty: '/faculty-dashboard',
        dean: '/dean-dashboard',
        admin: '/admin-dashboard',
      }

      const targetPath = dashboardMap[user.role] || '/dashboard'
      console.log(`➡️ Navigating to: ${targetPath}`)
      navigate(targetPath, { replace: true })

    } catch (err) {
      console.error('❌ Login error:', err)

      // ── NEW: handle pending approval (403) separately ──
      if (err.response?.status === 403) {
        setIsPending(true)
      } else {
        setError(err.response?.data?.message || 'Cannot connect to server! Make sure backend is running.')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: '#f8faff', border: '1px solid #cbd5e1', color: '#1a3a6b',
    borderRadius: '10px', width: '100%', padding: '12px 14px',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box'
  }

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', paddingTop: '80px' }}>
        <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '20px', width: '100%', maxWidth: '480px', padding: '40px', boxShadow: '0 8px 32px rgba(26,58,107,0.08)' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ background: '#1a3a6b', borderRadius: '12px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '16px', margin: '0 auto 12px' }}>CE</div>
            <h1 style={{ color: '#1a3a6b', fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>Welcome Back</h1>
            <p style={{ color: '#64748b', fontSize: '13px' }}>Vishwakarma Institute of Technology, Pune</p>
          </div>

          {/* ── NEW: Pending Approval Screen ── */}
          {isPending ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>⏳</div>
              <h2 style={{ color: '#d97706', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
                Account Pending Approval
              </h2>
              <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
                Your registration from a non-VIT college is still under review by a coordinator.
              </p>
              <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                <p style={{ color: '#92400e', fontSize: '13px' }}>
                  📋 Once approved, you will be able to login and register for events.<br />
                  Please check back later or contact the event coordinator.
                </p>
              </div>
              <button
                onClick={() => { setIsPending(false); setError('') }}
                style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '11px 28px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                ← Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Role Selector */}
              <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>Select your role</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
                {roles.map(r => (
                  <button key={r.id} onClick={() => { setSelectedRole(r.id); setError(''); setEmailError('') }}
                    style={{
                      padding: '10px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '600',
                      cursor: 'pointer', textAlign: 'left',
                      background: selectedRole === r.id ? '#1a3a6b' : '#f8faff',
                      color: selectedRole === r.id ? '#fff' : '#64748b',
                      border: `2px solid ${selectedRole === r.id ? '#1a3a6b' : '#dbeafe'}`,
                      transition: 'all 0.2s'
                    }}>
                    <div style={{ fontSize: '18px', marginBottom: '2px' }}>{r.icon}</div>
                    <div style={{ fontWeight: '700' }}>{r.label}</div>
                    <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '1px' }}>{r.desc}</div>
                  </button>
                ))}
              </div>

              {/* Selected Role Badge */}
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '8px 14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>{roles.find(r => r.id === selectedRole)?.icon}</span>
                <span style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '600' }}>
                  Signing in as: {roles.find(r => r.id === selectedRole)?.label}
                </span>
              </div>

              {/* ── NEW: Non-VITian info badge (only on student role + non-VIT email) ── */}
              {selectedRole === 'student' && isNonVitian && (
                <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>🏫</span>
                  <p style={{ color: '#92400e', fontSize: '12px' }}>
                    Non-VIT email detected — logging in as external student
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                  <p style={{ color: '#dc2626', fontSize: '13px' }}>⚠️ {error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                    {selectedRole === 'student' ? 'Email Address *' : 'Official College Email *'}
                  </label>
                  <input type="email" value={email}
                    onChange={e => { setEmail(e.target.value); validateEmail(e.target.value) }}
                    placeholder={selectedRole === 'student' ? 'any@email.com or name@vit.edu' : 'firstname.lastname@vit.edu'}
                    required
                    style={{ ...inputStyle, borderColor: emailError ? '#dc2626' : '#cbd5e1' }}
                    onFocus={e => { e.target.style.background = '#fff' }}
                    onBlur={e => { e.target.style.background = '#f8faff' }} />
                  {emailError && <p style={{ color: '#dc2626', fontSize: '11px', marginTop: '4px' }}>⚠️ {emailError}</p>}
                  {email && !emailError && email.endsWith('@vit.edu') && (
                    <p style={{ color: '#16a34a', fontSize: '11px', marginTop: '4px' }}>✅ Valid VIT email</p>
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '600' }}>Password *</label>
                    <a href="#" style={{ color: '#2563eb', fontSize: '12px', textDecoration: 'none' }}>Forgot password?</a>
                  </div>
                  <input type="password" value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                    onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
                </div>

                <button type="submit" disabled={loading}
                  style={{ background: loading ? '#94a3b8' : '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '13px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px' }}>
                  {loading ? '⏳ Signing in...' : `Sign In as ${roles.find(r => r.id === selectedRole)?.label} →`}
                </button>
              </form>

              {(selectedRole === 'coordinator' || selectedRole === 'volunteer') && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px', marginTop: '16px', textAlign: 'center' }}>
                  <p style={{ color: '#a16207', fontSize: '12px' }}>
                    ℹ️ Coordinator & Volunteer access is assigned by the Dean. Contact your Dean if you cannot login.
                  </p>
                </div>
              )}

              <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>Register here</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}