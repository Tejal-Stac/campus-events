import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validateEmail = (email) => {
    if (email && !email.endsWith('@vit.edu')) {
      setEmailError('Only @vit.edu email addresses are allowed')
    } else {
      setEmailError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.endsWith('@vit.edu')) {
      setEmailError('Only @vit.edu email addresses are allowed')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: selectedRole })
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))

        if (selectedRole === 'student') navigate('/dashboard')
        else if (selectedRole === 'faculty') navigate('/faculty')
        else if (selectedRole === 'coordinator') navigate('/coordinator')
        else if (selectedRole === 'volunteer') navigate('/volunteer')
        else if (selectedRole === 'dean') navigate('/admin')
      } else {
        setError(data.message || 'Login failed!')
      }
    } catch (err) {
      setError('Cannot connect to server! Make sure backend is running.')
    }

    setLoading(false)
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

          {/* Role Selector */}
          <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>Select your role</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
            {roles.map(r => (
              <button key={r.id} onClick={() => { setSelectedRole(r.id); setError('') }}
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
                Official College Email *
              </label>
              <input type="email" value={email}
                onChange={e => { setEmail(e.target.value); validateEmail(e.target.value) }}
                placeholder="firstname.lastname@vit.edu" required
                style={{ ...inputStyle, borderColor: emailError ? '#dc2626' : '#cbd5e1' }}
                onFocus={e => { e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.background = '#f8faff' }} />
              {emailError && <p style={{ color: '#dc2626', fontSize: '11px', marginTop: '4px' }}>⚠️ {emailError}</p>}
              {email && !emailError && <p style={{ color: '#16a34a', fontSize: '11px', marginTop: '4px' }}>✅ Valid VIT email</p>}
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
        </div>
      </div>
    </div>
  )
}