import { useState } from 'react'
import Navbar from '../components/Navbar'

const allTeams = [
  { id: 1, name: 'Code Crusaders', event: 'National Hackathon 2025', leader: 'Rahul Sharma', branch: 'CSE', members: 3, max: 4, skills: ['Python', 'ML', 'React'], open: true },
  { id: 2, name: 'Tech Titans', event: 'National Hackathon 2025', leader: 'Priya Mehta', branch: 'IT', members: 2, max: 4, skills: ['Java', 'Spring Boot', 'MySQL'], open: true },
  { id: 3, name: 'Robo Rangers', event: 'Robotics Competition', leader: 'Aman Verma', branch: 'MECH', members: 4, max: 4, skills: ['Arduino', 'C++', 'CAD'], open: false },
  { id: 4, name: 'Data Demons', event: 'National Hackathon 2025', leader: 'Sneha Patil', branch: 'CSE', members: 2, max: 3, skills: ['Data Science', 'Python', 'Tableau'], open: true },
  { id: 5, name: 'Cloud Chasers', event: 'National Hackathon 2025', leader: 'Vikram Singh', branch: 'IT', members: 1, max: 4, skills: ['AWS', 'DevOps', 'Docker'], open: true },
  { id: 6, name: 'UI Unicorns', event: 'National Hackathon 2025', leader: 'Ananya Joshi', branch: 'CSE', members: 3, max: 4, skills: ['React', 'Figma', 'CSS'], open: true },
]

const myProfile = {
  name: 'Tejal Jadhav',
  branch: 'CSE',
  year: '3rd',
  skills: ['Python', 'Machine Learning', 'React', 'Problem Solving'],
}

const skillOptions = ['Python', 'Java', 'React', 'ML', 'Data Science', 'DevOps', 'AWS', 'C++', 'Node.js', 'Figma', 'MySQL', 'Arduino']

export default function TeamBuilding() {
  const [activeTab, setActiveTab] = useState('find')
  const [search, setSearch] = useState('')
  const [filterEvent, setFilterEvent] = useState('All')
  const [filterBranch, setFilterBranch] = useState('All')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTeam, setNewTeam] = useState({ name: '', event: '', maxMembers: '4', skills: [], desc: '' })
  const [requestSent, setRequestSent] = useState([])

  const events = ['All', 'National Hackathon 2025', 'Robotics Competition']
  const branches = ['All', 'CSE', 'IT', 'MECH']

  const filtered = allTeams.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.leader.toLowerCase().includes(search.toLowerCase())
    const matchEvent = filterEvent === 'All' || t.event === filterEvent
    const matchBranch = filterBranch === 'All' || t.branch === filterBranch
    return matchSearch && matchEvent && matchBranch
  })

  const toggleSkill = (skill) => {
    setNewTeam(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter(s => s !== skill) : [...prev.skills, skill]
    }))
  }

  const sendRequest = (id) => setRequestSent(prev => [...prev, id])

  const inputStyle = {
    background: '#f8faff', border: '1px solid #cbd5e1', color: '#1a3a6b',
    borderRadius: '10px', width: '100%', padding: '11px 14px',
    fontSize: '13px', outline: 'none', boxSizing: 'border-box'
  }
  const labelStyle = { color: '#1a3a6b', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }

  const tabs = [
    { id: 'find', label: '🔍 Find a Team' },
    { id: 'create', label: '➕ Create Team' },
    { id: 'my', label: '👤 My Team' },
  ]

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a6b, #2563eb)', paddingTop: '56px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
          <h1 style={{ color: '#fff', fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>🤝 Team Building</h1>
          <p style={{ color: '#bfdbfe', fontSize: '15px' }}>Find teammates for hackathons and competitions based on skills and interests</p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>

        {/* My Profile Card */}
        <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#1a3a6b', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '16px', flexShrink: 0 }}>TJ</div>
            <div>
              <p style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '15px' }}>{myProfile.name}</p>
              <p style={{ color: '#64748b', fontSize: '13px' }}>{myProfile.branch} · {myProfile.year} Year</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                {myProfile.skills.map(s => (
                  <span key={s} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '20px', fontSize: '11px', padding: '2px 10px', fontWeight: '500' }}>{s}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>Your skills help teams find you!</p>
            <button style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              ✏️ Update Skills
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '4px', display: 'inline-flex', gap: '4px', marginBottom: '20px' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', border: 'none', cursor: 'pointer',
                background: activeTab === tab.id ? '#1a3a6b' : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#64748b'
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Find Team Tab */}
        {activeTab === 'find' && (
          <div>
            {/* Search + Filters */}
            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '20px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              <input placeholder="🔍 Search teams or leaders..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyle, flex: 2, minWidth: '200px' }}
                onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              <select value={filterEvent} onChange={e => setFilterEvent(e.target.value)}
                style={{ ...inputStyle, flex: 1, minWidth: '160px', cursor: 'pointer' }}>
                {events.map(ev => <option key={ev}>{ev}</option>)}
              </select>
              <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)}
                style={{ ...inputStyle, flex: 1, minWidth: '120px', cursor: 'pointer' }}>
                {branches.map(b => <option key={b}>{b === 'All' ? 'All Branches' : b}</option>)}
              </select>
            </div>

            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>{filtered.filter(t => t.open).length} open teams found</p>

            {/* Team Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {filtered.map(team => (
                <div key={team.id} style={{ background: '#fff', border: `1px solid ${team.open ? '#dbeafe' : '#e2e8f0'}`, borderRadius: '16px', padding: '20px', opacity: team.open ? 1 : 0.7, transition: 'all 0.2s' }}
                  onMouseOver={e => { if (team.open) e.currentTarget.style.borderColor = '#1a3a6b'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,58,107,0.08)' }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = team.open ? '#dbeafe' : '#e2e8f0'; e.currentTarget.style.boxShadow = 'none' }}>

                  {/* Team Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ color: '#1a3a6b', fontSize: '16px', fontWeight: '700', marginBottom: '2px' }}>{team.name}</h3>
                      <p style={{ color: '#64748b', fontSize: '12px' }}>Led by {team.leader} · {team.branch}</p>
                    </div>
                    <span style={{ background: team.open ? '#dcfce7' : '#f1f5f9', color: team.open ? '#16a34a' : '#64748b', borderRadius: '6px', fontSize: '11px', padding: '3px 10px', fontWeight: '600', flexShrink: 0 }}>
                      {team.open ? '🟢 Open' : '🔴 Full'}
                    </span>
                  </div>

                  {/* Event */}
                  <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '8px 12px', marginBottom: '12px' }}>
                    <p style={{ color: '#1d4ed8', fontSize: '12px', fontWeight: '600' }}>🏆 {team.event}</p>
                  </div>

                  {/* Members */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex' }}>
                      {Array.from({ length: team.members }).map((_, i) => (
                        <div key={i} style={{ background: '#1a3a6b', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: '700', marginLeft: i > 0 ? '-8px' : 0, border: '2px solid #fff' }}>
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                      {Array.from({ length: team.max - team.members }).map((_, i) => (
                        <div key={i} style={{ background: '#f0f4ff', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px', marginLeft: '-8px', border: '2px solid #fff' }}>+</div>
                      ))}
                    </div>
                    <p style={{ color: '#64748b', fontSize: '12px' }}>{team.members}/{team.max} members</p>
                  </div>

                  {/* Skills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {team.skills.map(s => (
                      <span key={s} style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '20px', fontSize: '11px', padding: '3px 10px', fontWeight: '500' }}>{s}</span>
                    ))}
                  </div>

                  {/* Action Button */}
                  {team.open ? (
                    requestSent.includes(team.id) ? (
                      <div style={{ background: '#dcfce7', color: '#16a34a', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: '600', textAlign: 'center' }}>
                        ✅ Request Sent!
                      </div>
                    ) : (
                      <button onClick={() => sendRequest(team.id)}
                        style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', width: '100%' }}>
                        Request to Join →
                      </button>
                    )
                  ) : (
                    <div style={{ background: '#f1f5f9', color: '#94a3b8', borderRadius: '10px', padding: '10px', fontSize: '13px', textAlign: 'center' }}>
                      Team is Full
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Team Tab */}
        {activeTab === 'create' && (
          <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '28px', maxWidth: '600px' }}>
            <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '6px' }}>➕ Create a New Team</h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>Create your team and let others join you!</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Team Name *</label>
                <input style={inputStyle} placeholder="e.g. Code Crusaders" value={newTeam.name} onChange={e => setNewTeam(p => ({ ...p, name: e.target.value }))}
                  onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              </div>

              <div>
                <label style={labelStyle}>Event *</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={newTeam.event} onChange={e => setNewTeam(p => ({ ...p, event: e.target.value }))}>
                  <option value="">Select event</option>
                  {['National Hackathon 2025', 'Robotics Competition', 'Finance Summit', 'Tech Talk: AI & Future'].map(ev => (
                    <option key={ev}>{ev}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Max Team Members *</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={newTeam.maxMembers} onChange={e => setNewTeam(p => ({ ...p, maxMembers: e.target.value }))}>
                  {['2', '3', '4', '5', '6'].map(n => <option key={n}>{n} members</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Skills Needed</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  {skillOptions.map(skill => (
                    <button key={skill} onClick={() => toggleSkill(skill)}
                      style={{
                        padding: '5px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                        background: newTeam.skills.includes(skill) ? '#1a3a6b' : '#f0f4ff',
                        color: newTeam.skills.includes(skill) ? '#fff' : '#64748b',
                        border: `1px solid ${newTeam.skills.includes(skill) ? '#1a3a6b' : '#dbeafe'}`,
                        fontWeight: newTeam.skills.includes(skill) ? '600' : '400'
                      }}>
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Team Description</label>
                <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="What are you building? What kind of teammates are you looking for?"
                  value={newTeam.desc} onChange={e => setNewTeam(p => ({ ...p, desc: e.target.value }))}
                  onFocus={e => { e.target.style.borderColor = '#1a3a6b'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.background = '#f8faff' }} />
              </div>

              <button onClick={() => { alert(`Team "${newTeam.name}" created! Others can now find and join your team.`); setActiveTab('my') }}
                style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '13px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '8px' }}>
                🚀 Create Team
              </button>
            </div>
          </div>
        )}

        {/* My Team Tab */}
        {activeTab === 'my' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>

            {/* No Team State */}
            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤝</div>
              <h3 style={{ color: '#1a3a6b', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>You're not in a team yet!</h3>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Find an open team to join or create your own.</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button onClick={() => setActiveTab('find')}
                  style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  🔍 Find a Team
                </button>
                <button onClick={() => setActiveTab('create')}
                  style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                  ➕ Create Team
                </button>
              </div>
            </div>

            {/* Pending Requests */}
            {requestSent.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>📨 Pending Join Requests</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {allTeams.filter(t => requestSent.includes(t.id)).map(t => (
                    <div key={t.id} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700' }}>{t.name}</p>
                        <p style={{ color: '#64748b', fontSize: '11px' }}>{t.event}</p>
                      </div>
                      <span style={{ background: '#fef9c3', color: '#a16207', borderRadius: '6px', fontSize: '11px', padding: '3px 8px', fontWeight: '600' }}>⏳ Pending</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <footer style={{ background: '#1a3a6b', color: '#93c5fd', textAlign: 'center', padding: '20px', fontSize: '13px', marginTop: '40px' }}>
        © 2025 CampusEvents · Vishwakarma Institute of Technology, Pune
      </footer>
    </div>
  )
}