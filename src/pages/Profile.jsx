import { useState } from 'react'
import Navbar from '../components/Navbar'

const student = {
  name: 'Tejal Jadhav',
  email: 'tejal.jadhav23@vit.edu',
  phone: '+91 98765 43210',
  branch: 'CSE',
  year: '3rd Year',
  rollNo: 'VIT2023CSE045',
  bio: 'Passionate about AI/ML and hackathons. Love collaborating on innovative projects!',
  interests: ['Hackathons', 'AI/ML', 'Photography', 'Music', 'Workshops'],
  skills: ['Python', 'Machine Learning', 'C++', 'Problem Solving', 'Leadership', 'Coordination', 'Teamwork', 'Public Speaking'],
  social: { linkedin: 'linkedin.com/in/tejal', github: 'github.com/tejal' },
}

const timeline = [
  { id: 1, title: 'National Hackathon 2025', date: 'Mar 2025', role: 'Participant', icon: '💻', color: '#1d4ed8' },
  { id: 2, title: 'Tech Talk: AI & Future', date: 'Apr 2025', role: 'Participant', icon: '🎤', color: '#059669' },
  { id: 3, title: 'CodeSprint 2024', date: 'Nov 2024', role: 'Winner 🏆', icon: '🏆', color: '#d97706' },
  { id: 4, title: 'Cultural Fest 2024', date: 'Oct 2024', role: 'Volunteer', icon: '🎭', color: '#db2777' },
  { id: 5, title: 'ML Workshop', date: 'Sep 2024', role: 'Participant', icon: '🤖', color: '#7c3aed' },
]

export default function Profile() {
  const [activeTab, setActiveTab] = useState('overview')
  const [form, setForm] = useState({ ...student })
  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

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

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />

      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a6b, #2563eb)', paddingTop: '56px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 0' }}>

          {/* Profile Card */}
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '32px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ background: '#1a3a6b', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '28px', flexShrink: 0 }}>
                TJ
              </div>
              <div>
                <h1 style={{ color: '#1a3a6b', fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{form.name}</h1>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '8px' }}>{form.branch} · {form.year} · {form.rollNo}</p>
                <p style={{ color: '#94a3b8', fontSize: '13px', maxWidth: '400px' }}>{form.bio}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <a href="#" style={{ color: '#2563eb', fontSize: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '4px 12px', textDecoration: 'none', fontWeight: '600' }}>🔗 LinkedIn</a>
                  <a href="#" style={{ color: '#2563eb', fontSize: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '4px 12px', textDecoration: 'none', fontWeight: '600' }}>💻 GitHub</a>
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
            { label: 'Events Attended', value: '12', icon: '🎯', color: '#1d4ed8', bg: '#eff6ff' },
            { label: 'Certificates', value: '5', icon: '📜', color: '#059669', bg: '#f0fdf4' },
            { label: 'Skills Gained', value: '8', icon: '💡', color: '#d97706', bg: '#fffbeb' },
            { label: 'Points', value: '1,240', icon: '⭐', color: '#7c3aed', bg: '#fdf4ff' },
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
                  {form.interests.map(i => (
                    <span key={i} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '20px', fontSize: '13px', padding: '5px 14px', fontWeight: '500' }}>{i}</span>
                  ))}
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
                <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>💡 Top Skills</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {form.skills.slice(0, 5).map(s => (
                    <span key={s} style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '20px', fontSize: '13px', padding: '5px 14px', fontWeight: '500' }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '24px' }}>📅 Event Participation Timeline</h2>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '20px', top: 0, bottom: 0, width: '2px', background: '#dbeafe' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {timeline.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', paddingLeft: '8px' }}>
                    <div style={{ background: item.color, borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0, zIndex: 1, border: '3px solid #f0f4ff' }}>
                      {item.icon}
                    </div>
                    <div style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '12px', flex: 1, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ color: '#1a3a6b', fontSize: '14px', fontWeight: '700' }}>{item.title}</p>
                        <p style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>{item.date}</p>
                      </div>
                      <span style={{ background: item.color + '18', color: item.color, borderRadius: '6px', fontSize: '12px', padding: '4px 10px', fontWeight: '600' }}>
                        {item.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '24px' }}>💡 All Skills Gained</h2>
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
                <button onClick={() => { setActiveTab('overview'); alert('Profile updated!') }}
                  style={{ flex: 2, background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                  💾 Save Changes
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