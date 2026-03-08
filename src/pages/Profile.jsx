import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    year: '',
    grNumber: '',
    bio: '',
    interests: [],
    linkedin: '',
  })

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const u = JSON.parse(storedUser)
      setForm({
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        email: u.email || '',
        phone: u.phone || '',
        department: u.department || '',
        year: u.year || '',
        grNumber: u.gr_number || '',
        bio: u.bio || '',
        interests: u.interests || [],
        linkedin: u.linkedin || '',
      })
    }
    setLoading(false)
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')

      const response = await fetch(`http://localhost:5000/api/users/${storedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: form.firstName,
          last_name: form.lastName,
          phone: form.phone,
          department: form.department,
          year: form.year,
          bio: form.bio,
          interests: form.interests,
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Update failed')
      }

      // Update localStorage with new data
      const updated = { ...storedUser, firstName: form.firstName, lastName: form.lastName, phone: form.phone, department: form.department, year: form.year }
      localStorage.setItem('user', JSON.stringify(updated))

      setActiveTab('overview')
      alert('✅ Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('❌ Failed to save profile: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const getInitials = () => {
    const f = form.firstName?.[0] || ''
    const l = form.lastName?.[0] || ''
    return (f + l).toUpperCase() || 'U'
  }

  const fullName = `${form.firstName} ${form.lastName}`.trim() || 'Student'

  const inputStyle = {
    background: '#f8faff', border: '1px solid #cbd5e1', color: '#1a3a6b',
    borderRadius: '10px', width: '100%', padding: '11px 14px',
    fontSize: '13px', outline: 'none', boxSizing: 'border-box'
  }
  const labelStyle = { color: '#1a3a6b', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }

  const tabs = [
    { id: 'overview', label: '👤 Overview' },
    { id: 'history', label: '📅 History' },
    { id: 'edit', label: '✏️ Edit Profile' },
  ]

  if (loading) {
    return (
      <div style={{ background: '#f0f4ff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '56px' }}>
        <p style={{ color: '#1a3a6b' }}>Loading profile...</p>
      </div>
    )
  }

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a6b, #2563eb)', paddingTop: '56px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 0' }}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '32px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ background: '#1a3a6b', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '28px', flexShrink: 0 }}>
                {getInitials()}
              </div>
              <div>
                <h1 style={{ color: '#1a3a6b', fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{fullName}</h1>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>{form.department} · {form.year} · {form.grNumber}</p>
                <p style={{ color: '#94a3b8', fontSize: '13px', maxWidth: '400px' }}>{form.bio || 'Update your bio in the Edit Profile section!'}</p>
                {form.linkedin && (
                  <a href={form.linkedin} target="_blank" rel="noopener noreferrer"
                    style={{ color: '#2563eb', fontSize: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '4px 12px', textDecoration: 'none', fontWeight: '600', display: 'inline-block', marginTop: '8px' }}>
                    🔗 LinkedIn
                  </a>
                )}
              </div>
            </div>
            <button onClick={() => setActiveTab('edit')}
              style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
              ✏️ Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 40px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', background: '#fff', padding: '20px', borderBottom: '1px solid #dbeafe', marginBottom: '24px' }}>
          {[
            { label: 'Events Attended', value: registrations?.length || 0, icon: '🎯', color: '#1d4ed8', bg: '#eff6ff' },
            { label: 'Certificates', value: 0, icon: '📜', color: '#059669', bg: '#f0fdf4' },
            { label: 'Interests', value: form.interests?.length || 0, icon: '💡', color: '#d97706', bg: '#fffbeb' },
            { label: 'Points', value: 0, icon: '⭐', color: '#7c3aed', bg: '#fdf4ff' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: '12px', textAlign: 'center', padding: '16px' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
              <div style={{ color: s.color, fontSize: '24px', fontWeight: '800' }}>{s.value}</div>
              <div style={{ color: '#64748b', fontSize: '12px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '4px', display: 'inline-flex', gap: '4px', marginBottom: '20px' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', border: 'none', cursor: 'pointer',
                background: activeTab === tab.id ? '#1a3a6b' : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#64748b'
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>📋 Personal Information</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Full Name', value: fullName, icon: '👤' },
                  { label: 'Email', value: form.email, icon: '📧' },
                  { label: 'Phone', value: form.phone || 'Not added', icon: '📱' },
                  { label: 'Department', value: form.department || 'Not added', icon: '🏫' },
                  { label: 'Year', value: form.year || 'Not added', icon: '📅' },
                  { label: 'GR Number', value: form.grNumber || 'Not added', icon: '🪪' },
                ].map(item => (
                  <div key={item.label} style={{ background: '#f8faff', borderRadius: '10px', padding: '11px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #dbeafe' }}>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>{item.icon} {item.label}</span>
                    <span style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '600' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>🎯 Interests</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {form.interests?.length > 0 ? (
                  form.interests.map(i => (
                    <span key={i} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '20px', fontSize: '13px', padding: '5px 14px', fontWeight: '500' }}>{i}</span>
                  ))
                ) : (
                  <p style={{ color: '#94a3b8', fontSize: '13px' }}>No interests added yet. Edit your profile to add some!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '24px' }}>📅 Event Participation History</h2>
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📅</div>
              <p style={{ fontSize: '14px', fontWeight: '600' }}>No events in your history yet</p>
              <p style={{ fontSize: '13px', marginTop: '8px' }}>Register for events to see them here!</p>
            </div>
          </div>
        )}

        {/* Edit Tab */}
        {activeTab === 'edit' && (
          <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px', maxWidth: '600px' }}>
            <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '24px' }}>✏️ Edit Your Profile</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input style={inputStyle} value={form.firstName} onChange={e => update('firstName', e.target.value)}
                    onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                    onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input style={inputStyle} value={form.lastName} onChange={e => update('lastName', e.target.value)}
                    onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                    onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Email (read only)</label>
                <input style={{ ...inputStyle, background: '#f1f5f9', color: '#94a3b8' }} value={form.email} readOnly />
              </div>

              <div>
                <label style={labelStyle}>Phone</label>
                <input style={inputStyle} value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+91 XXXXX XXXXX"
                  onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Department</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.department} onChange={e => update('department', e.target.value)}>
                    <option value="">Select</option>
                    {['CSE', 'IT', 'MECH', 'CIVIL', 'ENTC', 'MBA', 'CHEMICAL'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Year</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.year} onChange={e => update('year', e.target.value)}>
                    <option value="">Select</option>
                    {['FE', 'SE', 'TE', 'BE'].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Bio</label>
                <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={form.bio} onChange={e => update('bio', e.target.value)} placeholder="Tell us about yourself..."
                  onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              </div>

              <div>
                <label style={labelStyle}>LinkedIn URL</label>
                <input style={inputStyle} value={form.linkedin} onChange={e => update('linkedin', e.target.value)} placeholder="https://linkedin.com/in/yourname"
                  onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button onClick={() => setActiveTab('overview')}
                  style={{ flex: 1, background: '#f0f4ff', color: '#1a3a6b', border: '1px solid #dbeafe', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  style={{ flex: 2, background: saving ? '#94a3b8' : '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? '⏳ Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer style={{ background: '#1a3a6b', color: '#93c5fd', textAlign: 'center', padding: '20px', fontSize: '13px' }}>
        © 2025 CampusEvents · Vishwakarma Institute of Technology, Pune
      </footer>
    </div>
  )
}