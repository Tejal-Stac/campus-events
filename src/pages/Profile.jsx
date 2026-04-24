import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API = 'http://localhost:5000'

export default function Profile() {
  const { user: authUser, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [editForm, setEditForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const getToken = () => localStorage.getItem('token')

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/api/users/profile`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const data = res.data.data || res.data
      // ✅ Fix: parse interests if it's a string
      if (data.interests && typeof data.interests === 'string') {
        try { data.interests = JSON.parse(data.interests) } catch { data.interests = [] }
      }
      if (!Array.isArray(data.interests)) data.interests = []
      setProfile(data)
      setEditForm(data)
    } catch (e) {
      console.error('Profile fetch error:', e.message)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(p => p[0]).filter(Boolean).join('').toUpperCase().slice(0, 2)
  }

  const getRoleBadge = (role) => {
    const map = {
      student:     { label: 'Student',     color: '#1d4ed8', bg: '#eff6ff' },
      faculty:     { label: 'Faculty',     color: '#059669', bg: '#f0fdf4' },
      hod:         { label: 'HOD',         color: '#7c3aed', bg: '#fdf4ff' },
      coordinator: { label: 'Coordinator', color: '#d97706', bg: '#fffbeb' },
      volunteer:   { label: 'Volunteer',   color: '#0891b2', bg: '#f0f9ff' },
      dean:        { label: 'Dean',        color: '#dc2626', bg: '#fef2f2' },
      admin:       { label: 'Admin',       color: '#dc2626', bg: '#fef2f2' },
    }
    return map[role] || { label: role, color: '#64748b', bg: '#f1f5f9' }
  }

  const getBio = (p) => {
    if (!p) return ''
    if (p.bio) return p.bio
    if (p.role === 'hod' && p.department) return `Head of Department of ${p.department}`
    return ''
  }

  // ✅ Safe interests getter — always returns array
  const getInterests = (p) => {
    if (!p) return []
    if (Array.isArray(p.interests)) return p.interests
    if (typeof p.interests === 'string') {
      try { return JSON.parse(p.interests) } catch { return [] }
    }
    return []
  }

  const inputStyle = {
    background: '#f8faff', border: '1px solid #cbd5e1', color: '#1a3a6b',
    borderRadius: '8px', width: '100%', padding: '10px 12px',
    fontSize: '13px', outline: 'none', boxSizing: 'border-box'
  }

  if (loading) return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#1a3a6b', fontWeight: '600' }}>Loading profile...</p>
    </div>
  )

  const p = profile
  const roleBadge = getRoleBadge(p?.role)
  const bio = getBio(p)
  const interests = getInterests(p)
  const fullName = p?.name || `${p?.firstName || ''} ${p?.lastName || ''}`.trim()

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* Navbar */}
      <div style={{ background: '#1a3a6b', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#fff', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#1a3a6b', fontSize: '12px' }}>CE</div>
          <span style={{ color: '#fff', fontWeight: '700' }}>CampusEvents</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <a href="/events" style={{ color: '#93c5fd', fontSize: '13px', textDecoration: 'none' }}>Events</a>
          <a href="/profile" style={{ color: '#fff', fontSize: '13px', textDecoration: 'none', fontWeight: '700', background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '6px' }}>Profile</a>
          <span style={{ color: '#93c5fd', fontSize: '13px' }}>⭐ {p?.points || 0} pts</span>
          <div style={{ background: '#2563eb', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '12px' }}>
            {getInitials(fullName)}
          </div>
          <button onClick={logout} style={{ color: '#93c5fd', fontSize: '12px', background: 'none', border: '1px solid #475569', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      {/* Profile Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a6b 0%, #2563eb 100%)', padding: '40px 0 80px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }} />
      </div>

      <div style={{ maxWidth: '900px', margin: '-60px auto 0', padding: '0 24px 40px', position: 'relative' }}>

        {/* Profile Card */}
        <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '20px', padding: '28px', marginBottom: '20px', boxShadow: '0 4px 24px rgba(26,58,107,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ background: '#1a3a6b', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '28px', flexShrink: 0, border: '4px solid #fff', boxShadow: '0 4px 12px rgba(26,58,107,0.2)' }}>
                {getInitials(fullName)}
              </div>
              <div>
                <h1 style={{ color: '#1a3a6b', fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{fullName}</h1>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '6px' }}>
                  {p?.department || ''}{p?.department && p?.campus ? ' · ' : ''}{p?.campus || ''}
                </p>
                {bio ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px' }}>🏛️</span>
                    <span style={{ color: '#7c3aed', fontSize: '14px', fontWeight: '600' }}>{bio}</span>
                  </div>
                ) : (
                  <p style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic', marginBottom: '8px' }}>
                    Update your bio in Edit Profile!
                  </p>
                )}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ background: roleBadge.bg, color: roleBadge.color, borderRadius: '20px', fontSize: '12px', padding: '3px 12px', fontWeight: '700' }}>
                    {p?.role === 'hod' ? '🏛️' : p?.role === 'dean' ? '👑' : p?.role === 'faculty' ? '👨‍🏫' : '🎓'} {roleBadge.label}
                  </span>
                  {p?.designation && (
                    <span style={{ background: '#f0f4ff', color: '#1a3a6b', borderRadius: '20px', fontSize: '12px', padding: '3px 12px', fontWeight: '600' }}>
                      {p.designation}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => setActiveTab('edit')}
              style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              ✏️ Edit Profile
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Events Attended', value: 0,                icon: '🎯', color: '#1d4ed8', bg: '#eff6ff' },
            { label: 'Certificates',    value: 0,                icon: '📜', color: '#059669', bg: '#f0fdf4' },
            { label: 'Interests',       value: interests.length, icon: '💡', color: '#d97706', bg: '#fffbeb' },
            { label: 'Points',          value: p?.points || 0,  icon: '⭐', color: '#7c3aed', bg: '#fdf4ff' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>{s.icon}</div>
              <div style={{ color: s.color, fontSize: '22px', fontWeight: '800' }}>{s.value}</div>
              <div style={{ color: '#64748b', fontSize: '11px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '4px', display: 'inline-flex', gap: '4px', marginBottom: '16px' }}>
          {[
            { id: 'overview', label: '👤 Overview' },
            { id: 'history',  label: '📋 History' },
            { id: 'edit',     label: '✏️ Edit Profile' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', border: 'none', cursor: 'pointer', background: activeTab === t.id ? '#1a3a6b' : 'transparent', color: activeTab === t.id ? '#fff' : '#64748b' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '15px', marginBottom: '16px' }}>📋 Personal Information</h2>
              {[
                { label: '👤 Full Name',   value: fullName },
                { label: '📧 Email',        value: p?.email },
                { label: '📱 Phone',        value: p?.phone || 'Not added' },
                { label: '🏛️ Department',   value: p?.department || 'Not added' },
                { label: '🗓️ Year',         value: p?.year || 'Not added' },
                { label: '🎫 GR Number',    value: p?.grNumber || 'Not added' },
                ...(p?.role === 'hod' ? [{ label: '🏛️ Bio', value: bio || 'Not set' }] : []),
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8faff', borderRadius: '8px', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>{item.label}</span>
                  <span style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '600', textAlign: 'right', maxWidth: '55%' }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '15px', marginBottom: '16px' }}>🎯 Interests</h2>
              {interests.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>No interests added yet. Edit your profile to add some!</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {interests.map((interest, i) => (
                    <span key={i} style={{ background: '#eff6ff', color: '#1a3a6b', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: '600' }}>
                      {interest}
                    </span>
                  ))}
                </div>
              )}

              {p?.role === 'hod' && (
                <div style={{ marginTop: '20px', background: '#fdf4ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '16px' }}>
                  <h3 style={{ color: '#7c3aed', fontWeight: '700', fontSize: '13px', marginBottom: '8px' }}>🏛️ HOD Information</h3>
                  <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>Department: <strong style={{ color: '#7c3aed' }}>{p.department}</strong></p>
                  <p style={{ color: '#64748b', fontSize: '12px' }}>Bio: <strong style={{ color: '#7c3aed' }}>{bio || 'Not set'}</strong></p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Event history coming soon...</p>
          </div>
        )}

        {/* Edit Tab */}
        {activeTab === 'edit' && (
          <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '15px', marginBottom: '20px' }}>✏️ Edit Profile</h2>
            {msg && (
              <div style={{ background: msg.includes('✅') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${msg.includes('✅') ? '#bbf7d0' : '#fecaca'}`, borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
                <p style={{ color: msg.includes('✅') ? '#059669' : '#dc2626', fontSize: '13px' }}>{msg}</p>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'First Name', field: 'firstName' },
                  { label: 'Last Name',  field: 'lastName' },
                ].map(({ label, field }) => (
                  <div key={field}>
                    <label style={{ color: '#1a3a6b', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>{label}</label>
                    <input style={inputStyle} value={editForm[field] || ''} onChange={e => setEditForm(prev => ({ ...prev, [field]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div>
                <label style={{ color: '#1a3a6b', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Phone</label>
                <input style={inputStyle} value={editForm.phone || ''} onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="10-digit number" />
              </div>
              <div>
                <label style={{ color: '#1a3a6b', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Department</label>
                <input style={inputStyle} value={editForm.department || ''} onChange={e => setEditForm(prev => ({ ...prev, department: e.target.value }))} />
              </div>
              {p?.role === 'hod' && (
                <div>
                  <label style={{ color: '#7c3aed', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>🏛️ Profile Bio (HOD)</label>
                  <input style={{ ...inputStyle, borderColor: '#e9d5ff' }}
                    value={editForm.bio || bio || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder={`Head of Department of ${p.department}`} />
                  <p style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>This bio appears on your profile</p>
                </div>
              )}
              <button
                onClick={async () => {
                  setSaving(true); setMsg('')
                  try {
                    await axios.put(`${API}/api/users/${p.id}`, {
                      first_name: editForm.firstName,
                      last_name: editForm.lastName,
                      phone: editForm.phone,
                      department: editForm.department,
                      year: editForm.year,
                      bio: editForm.bio,
                      interests: Array.isArray(editForm.interests) ? editForm.interests : []
                    }, {
                      headers: { Authorization: `Bearer ${getToken()}` }
                    })
                    setMsg('✅ Profile updated successfully!')
                    fetchProfile()
                  } catch (e) {
                    setMsg('❌ Failed to update: ' + (e.response?.data?.message || e.message))
                  } finally { setSaving(false) }
                }}
                disabled={saving}
                style={{ background: saving ? '#94a3b8' : '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? '⏳ Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}