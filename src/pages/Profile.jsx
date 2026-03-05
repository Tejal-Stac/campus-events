import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import userService from '../api/userService'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    branch: '',
    year: '',
    rollNo: '',
    bio: '',
    interests: [],
    skills: [],
    social: { linkedin: '', github: '' },
  })

  // Save profile changes
  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Send PUT request to backend
      await userService.updateProfile({
        name: form.name,
        email: form.email,
        phone: form.phone,
        branch: form.branch,
        year: form.year,
        bio: form.bio,
        interests: form.interests,
        skills: form.skills,
        social: form.social,
      })
      
      // Refresh user data in AuthContext (updates navbar and all pages)
      await refreshUser()
      
      setActiveTab('overview')
      alert('✅ Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('❌ Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Fetch user registrations on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Refresh user data to get latest points
        await refreshUser()
        
        // Fetch user's registered events
        try {
          const regs = await userService.getMyRegistrations()
          setRegistrations(regs || [])
        } catch (err) {
          console.log('No registrations endpoint yet:', err)
          setRegistrations([])
        }
      } catch (error) {
        console.error('Error fetching profile data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        branch: user.branch || 'N/A',
        year: user.year || 'N/A',
        rollNo: user.vit_id || user.rollNo || 'N/A',
        bio: user.bio || 'Update your bio in the Edit Profile section!',
        interests: user.interests || [],
        skills: user.skills || [],
        social: user.social || { linkedin: '', github: '' },
      })
    }
  }, [user])

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))
  
  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
  }

  const inputStyle = {
    background: '#f8faff', border: '1px solid #cbd5e1', color: '#1a3a6b',
    borderRadius: '10px', width: '100%', padding: '11px 14px',
    fontSize: '13px', outline: 'none', boxSizing: 'border-box'
  }
  const labelStyle = { color: '#1a3a6b', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }

  const tabs = [
    { id: 'overview', label: '👤 Overview' },
    { id: 'history', label: '📅 History' },
    { id: 'skills', label: '💡 Skills' },
    { id: 'edit', label: '✏️ Edit Profile' },
  ]

  if (loading) {
    return (
      <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', paddingTop: '56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #dbeafe', borderTop: '4px solid #1a3a6b', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: '#64748b', fontSize: '14px' }}>Loading profile...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a6b, #2563eb)', paddingTop: '56px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 0' }}>

          {/* Profile Card */}
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '32px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ background: '#1a3a6b', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '28px', flexShrink: 0 }}>
                {getInitials(user?.name || 'NA')}
              </div>
              <div>
                <h1 style={{ color: '#1a3a6b', fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{form.name || 'Student Name'}</h1>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>{form.branch} · {form.year} · {form.rollNo}</p>
                <p style={{ color: '#94a3b8', fontSize: '13px', maxWidth: '400px' }}>{form.bio}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  {form.social?.linkedin && (
                    <a href={form.social.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontSize: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '4px 12px', textDecoration: 'none', fontWeight: '600' }}>🔗 LinkedIn</a>
                  )}
                  {form.social?.github && (
                    <a href={form.social.github} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontSize: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '4px 12px', textDecoration: 'none', fontWeight: '600' }}>💻 GitHub</a>
                  )}
                </div>
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
            { label: 'Certificates', value: registrations?.filter(r => r.completed)?.length || 0, icon: '📜', color: '#059669', bg: '#f0fdf4' },
            { label: 'Skills Gained', value: form.skills?.length || 0, icon: '💡', color: '#d97706', bg: '#fffbeb' },
            { label: 'Points', value: user?.points || 0, icon: '⭐', color: '#7c3aed', bg: '#fdf4ff' },
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
                  { label: 'Full Name', value: form.name, icon: '👤' },
                  { label: 'Email', value: form.email, icon: '📧' },
                  { label: 'Phone', value: form.phone, icon: '📱' },
                  { label: 'Branch', value: form.branch, icon: '🏫' },
                  { label: 'Year', value: form.year, icon: '📅' },
                  { label: 'Roll No.', value: form.rollNo, icon: '🪪' },
                ].map(item => (
                  <div key={item.label} style={{ background: '#f8faff', borderRadius: '10px', padding: '11px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #dbeafe' }}>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>{item.icon} {item.label}</span>
                    <span style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '600' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
                <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>🎯 Interests</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {form.interests?.length > 0 ? (
                    form.interests.map(i => (
                      <span key={i} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '20px', fontSize: '13px', padding: '5px 14px', fontWeight: '500' }}>{i}</span>
                    ))
                  ) : (
                    <p style={{ color: '#94a3b8', fontSize: '13px' }}>No interests added yet. Update your profile to add interests!</p>
                  )}
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
                <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>💡 Top Skills</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {form.skills?.length > 0 ? (
                    form.skills.slice(0, 5).map(s => (
                      <span key={s} style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '20px', fontSize: '13px', padding: '5px 14px', fontWeight: '500' }}>{s}</span>
                    ))
                  ) : (
                    <p style={{ color: '#94a3b8', fontSize: '13px' }}>No skills added yet. Update your profile to add skills!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '24px' }}>📅 Event Participation Timeline</h2>
            {registrations?.length > 0 ? (
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '20px', top: 0, bottom: 0, width: '2px', background: '#dbeafe' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {registrations.map((event, idx) => {
                    const colors = ['#1d4ed8', '#059669', '#d97706', '#db2777', '#7c3aed']
                    const icons = ['💻', '🎤', '🏆', '🎭', '🤖']
                    const color = colors[idx % colors.length]
                    const icon = icons[idx % icons.length]
                    const eventDate = new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                    
                    return (
                      <div key={event.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', paddingLeft: '8px' }}>
                        <div style={{ background: color, borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0, zIndex: 1, border: '3px solid #f0f4ff' }}>
                          {icon}
                        </div>
                        <div style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '12px', flex: 1, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ color: '#1a3a6b', fontSize: '14px', fontWeight: '700' }}>{event.title}</p>
                            <p style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>{eventDate}</p>
                          </div>
                          <span style={{ background: color + '18', color: color, borderRadius: '6px', fontSize: '12px', padding: '4px 10px', fontWeight: '600' }}>
                            Participant
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📅</div>
                <p style={{ fontSize: '14px', fontWeight: '600' }}>No events in your history yet</p>
                <p style={{ fontSize: '13px', marginTop: '8px' }}>Register for events to see them here!</p>
              </div>
            )}
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '24px' }}>💡 All Skills Gained</h2>
            {form.skills?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {form.skills.map((skill, i) => {
                  const levels = [90, 75, 80, 85, 70, 65, 88, 72]
                  const level = levels[i] || 70
                  return (
                    <div key={skill}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '600' }}>{skill}</span>
                        <span style={{ color: '#64748b', fontSize: '12px' }}>{level}%</span>
                      </div>
                      <div style={{ background: '#f0f4ff', borderRadius: '6px', height: '8px' }}>
                        <div style={{ width: `${level}%`, background: 'linear-gradient(90deg, #1a3a6b, #2563eb)', borderRadius: '6px', height: '8px' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>💡</div>
                <p style={{ fontSize: '14px', fontWeight: '600' }}>No skills added yet</p>
                <p style={{ fontSize: '13px', marginTop: '8px' }}>Update your profile to showcase your skills!</p>
              </div>
            )}
          </div>
        )}

        {/* Edit Tab */}
        {activeTab === 'edit' && (
          <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px', maxWidth: '600px' }}>
            <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '24px' }}>✏️ Edit Your Profile</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input style={inputStyle} value={form.name} onChange={e => update('name', e.target.value)}
                    onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                    onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input style={inputStyle} value={form.phone} onChange={e => update('phone', e.target.value)}
                    onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                    onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} value={form.email} onChange={e => update('email', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Branch</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.branch} onChange={e => update('branch', e.target.value)}>
                    {['CSE', 'IT', 'MECH', 'CIVIL', 'ENTC', 'MBA'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Year</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.year} onChange={e => update('year', e.target.value)}>
                    {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Bio</label>
                <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={form.bio} onChange={e => update('bio', e.target.value)}
                  onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              </div>
              <div>
                <label style={labelStyle}>LinkedIn URL</label>
                <input style={inputStyle} value={form.social?.linkedin} onChange={e => update('social', { ...form.social, linkedin: e.target.value })}
                  onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button onClick={() => setActiveTab('overview')}
                  style={{ flex: 1, background: '#f0f4ff', color: '#1a3a6b', border: '1px solid #dbeafe', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  style={{ 
                    flex: 2, 
                    background: saving ? '#94a3b8' : '#1a3a6b', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '10px', 
                    padding: '12px', 
                    fontSize: '14px', 
                    fontWeight: '700', 
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1
                  }}>
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