import { useState, useRef } from 'react'
import Navbar from '../components/Navbar'
import axios from '../api/axiosConfig'

const pendingEvents = [
  { id: 1, title: 'Robotics Competition', coordinator: 'Prof. Mehta', dept: 'MECH', date: 'May 3, 2025', seats: 60, category: 'Hackathon' },
  { id: 2, title: 'Finance Summit', coordinator: 'Prof. Kulkarni', dept: 'MBA', date: 'May 10, 2025', seats: 200, category: 'Seminar' },
  { id: 3, title: 'Drama Fest', coordinator: 'Prof. Joshi', dept: 'Arts', date: 'May 18, 2025', seats: 250, category: 'Cultural' },
]

const allUsers = [
  { id: 1, name: 'Tejal Jadhav', email: 'tejal@vit.edu', role: 'Student', branch: 'CSE', year: '3rd', status: 'Active' },
  { id: 2, name: 'Rahul Coordinator', email: 'rahul@vit.edu', role: 'Coordinator', branch: 'CSE', year: '-', status: 'Active' },
  { id: 3, name: 'Priya Mehta', email: 'priya@vit.edu', role: 'Student', branch: 'IT', year: '2nd', status: 'Active' },
  { id: 4, name: 'Prof. Kulkarni', email: 'kulkarni@vit.edu', role: 'Coordinator', branch: 'MBA', year: '-', status: 'Pending' },
  { id: 5, name: 'Aman Verma', email: 'aman@vit.edu', role: 'Student', branch: 'MECH', year: '3rd', status: 'Active' },
  { id: 6, name: 'Prof. Joshi', email: 'joshi@vit.edu', role: 'Coordinator', branch: 'Arts', year: '-', status: 'Pending' },
]

const recentActivity = [
  { id: 1, action: 'New registration', detail: 'Tejal Jadhav registered for National Hackathon', time: '2 mins ago', icon: '📝' },
  { id: 2, action: 'Event submitted', detail: 'Prof. Mehta submitted Robotics Competition for approval', time: '15 mins ago', icon: '📅' },
  { id: 3, action: 'Certificate issued', detail: '45 certificates issued for CodeSprint 2024', time: '1 hour ago', icon: '📜' },
  { id: 4, action: 'New coordinator', detail: 'Prof. Kulkarni registered as coordinator', time: '2 hours ago', icon: '👤' },
  { id: 5, action: 'Event completed', detail: 'Tech Talk: AI & Future marked as completed', time: '5 hours ago', icon: '✅' },
]

const endpointMap = {
  'students':     '/import/students',
  'events':       '/import/events',
  'students-xml': '/import/students/xml',
  'events-xml':   '/import/events/xml',
}
const importOptions = [
  { value: 'students',     label: '👩‍🎓 Students (Excel)', format: 'Excel', accept: '.xlsx,.xls', desc: 'name, email, password, department, year' },
  { value: 'events',       label: '📅 Events (Excel)',    format: 'Excel', accept: '.xlsx,.xls', desc: 'title, description, date, location, category' },
  { value: 'students-xml', label: '👩‍🎓 Students (XML)',   format: 'XML',   accept: '.xml',       desc: '<students><student>...</student></students>' },
  { value: 'events-xml',   label: '📅 Events (XML)',      format: 'XML',   accept: '.xml',       desc: '<events><event>...</event></events>' },
]

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview')
  const [events, setEvents] = useState(pendingEvents)
  const [users, setUsers] = useState(allUsers)
  const [userFilter, setUserFilter] = useState('All')

  const [importFile, setImportFile] = useState(null)
  const [importType, setImportType] = useState('students')
  const [importStatus, setImportStatus] = useState(null)
  const [importMsg, setImportMsg] = useState('')
  const [importResult, setImportResult] = useState(null)
  const fileInputRef = useRef(null)

  const approveEvent = (id) => setEvents(prev => prev.filter(e => e.id !== id))
  const rejectEvent = (id) => setEvents(prev => prev.filter(e => e.id !== id))
  const toggleUserStatus = (id) => setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u))
  const filteredUsers = userFilter === 'All' ? users : users.filter(u => u.role === userFilter)
  const selectedOption = importOptions.find(o => o.value === importType)

  const handleFileChange = (e) => {
    setImportFile(e.target.files[0] || null)
    setImportStatus(null)
    setImportMsg('')
    setImportResult(null)
  }

  const handleReset = () => {
    setImportFile(null)
    setImportStatus(null)
    setImportMsg('')
    setImportResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleTypeChange = (value) => {
    setImportType(value)
    handleReset()
  }

  const handleImport = async () => {
    if (!importFile) { setImportStatus('error'); setImportMsg('Please select a file first.'); return }
    setImportStatus('loading')
    setImportMsg('')
    setImportResult(null)
    const formData = new FormData()
    formData.append('file', importFile)
    try {
      const res = await axios.post(endpointMap[importType], formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setImportStatus('success')
      setImportMsg(res.data.message)
      setImportResult({ imported: res.data.imported, skipped: res.data.skipped })
      setImportFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      setImportStatus('error')
      setImportMsg(err.response?.data?.message || 'Import failed. Please check your file format.')
    }
  }

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'approvals', label: `📋 Approvals ${events.length > 0 ? `(${events.length})` : ''}` },
    { id: 'users', label: '👥 Users' },
    { id: 'import', label: '📥 Import' },
    { id: 'analytics', label: '📈 Analytics' },
  ]

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />

      <div style={{ background: 'linear-gradient(135deg, #1a3a6b, #1e40af)', paddingTop: '56px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: '#fff', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a3a6b', fontWeight: '800', fontSize: '18px' }}>AD</div>
              <div>
                <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '700' }}>Admin Panel ⚙️</h1>
                <p style={{ color: '#bfdbfe', fontSize: '13px' }}>Super Admin · VIT Pune · Full Access</p>
              </div>
            </div>
            <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: '700' }}>🔴 Admin Access</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Users', value: '5,240', icon: '👥', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
            { label: 'Total Events', value: '200', icon: '📅', color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
            { label: 'Pending Approvals', value: events.length, icon: '⏳', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
            { label: 'Certificates Issued', value: '3,000+', icon: '📜', color: '#7c3aed', bg: '#fdf4ff', border: '#e9d5ff' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '16px', textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>{s.icon}</div>
              <div style={{ color: s.color, fontSize: '26px', fontWeight: '800' }}>{s.value}</div>
              <div style={{ color: '#64748b', fontSize: '12px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '4px', display: 'inline-flex', gap: '4px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', border: 'none', cursor: 'pointer', background: activeTab === tab.id ? '#1a3a6b' : 'transparent', color: activeTab === tab.id ? '#fff' : '#64748b' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>⚡ Recent Activity</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentActivity.map(a => (
                  <div key={a.id} style={{ background: '#f8faff', borderRadius: '12px', border: '1px solid #dbeafe', padding: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>{a.icon}</span>
                    <div>
                      <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700' }}>{a.action}</p>
                      <p style={{ color: '#64748b', fontSize: '12px' }}>{a.detail}</p>
                      <p style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ color: '#1a3a6b', fontWeight: '700' }}>⏳ Pending Approvals</h2>
                <button onClick={() => setActiveTab('approvals')} style={{ color: '#2563eb', fontSize: '12px', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '600' }}>View all →</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {events.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                    <p>All caught up! No pending approvals.</p>
                  </div>
                ) : events.map(e => (
                  <div key={e.id} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700' }}>{e.title}</p>
                        <p style={{ color: '#64748b', fontSize: '11px' }}>{e.coordinator} · {e.dept} · {e.date}</p>
                      </div>
                      <span style={{ background: '#fef9c3', color: '#a16207', borderRadius: '6px', fontSize: '11px', padding: '2px 8px', fontWeight: '600', height: 'fit-content' }}>{e.category}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => approveEvent(e.id)} style={{ flex: 1, background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>✅ Approve</button>
                      <button onClick={() => rejectEvent(e.id)} style={{ flex: 1, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>❌ Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '20px' }}>📋 Event Approval Requests</h2>
            {events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                <p style={{ fontSize: '16px', fontWeight: '600' }}>All events reviewed! No pending approvals.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {events.map(e => (
                  <div key={e.id} style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ background: '#fffbeb', color: '#d97706', borderRadius: '6px', fontSize: '12px', padding: '3px 10px', fontWeight: '600' }}>{e.category}</span>
                        <span style={{ background: '#fef2f2', color: '#dc2626', borderRadius: '6px', fontSize: '11px', padding: '2px 8px', fontWeight: '600' }}>Pending Review</span>
                      </div>
                      <h3 style={{ color: '#1a3a6b', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>{e.title}</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                        <p style={{ color: '#64748b', fontSize: '13px' }}>👤 {e.coordinator}</p>
                        <p style={{ color: '#64748b', fontSize: '13px' }}>🏫 {e.dept}</p>
                        <p style={{ color: '#64748b', fontSize: '13px' }}>📅 {e.date}</p>
                        <p style={{ color: '#64748b', fontSize: '13px' }}>💺 {e.seats} seats</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '120px' }}>
                      <button onClick={() => approveEvent(e.id)} style={{ background: '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>✅ Approve</button>
                      <button onClick={() => rejectEvent(e.id)} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>❌ Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700' }}>👥 User Management</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['All', 'Student', 'Coordinator'].map(f => (
                  <button key={f} onClick={() => setUserFilter(f)}
                    style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', background: userFilter === f ? '#1a3a6b' : '#f0f4ff', color: userFilter === f ? '#fff' : '#64748b', border: `1px solid ${userFilter === f ? '#1a3a6b' : '#dbeafe'}`, fontWeight: userFilter === f ? '600' : '400' }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8faff', borderBottom: '2px solid #dbeafe' }}>
                    {['User', 'Role', 'Branch', 'Year', 'Status', 'Action'].map(h => (
                      <th key={h} style={{ color: '#1a3a6b', fontSize: '12px', fontWeight: '700', padding: '12px', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #dbeafe' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ background: '#dbeafe', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a3a6b', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
                            {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '700' }}>{u.name}</p>
                            <p style={{ color: '#64748b', fontSize: '11px' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: u.role === 'Coordinator' ? '#f0fdf4' : '#eff6ff', color: u.role === 'Coordinator' ? '#15803d' : '#1d4ed8', borderRadius: '6px', fontSize: '11px', padding: '3px 8px', fontWeight: '600' }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>{u.branch}</td>
                      <td style={{ padding: '12px', color: '#64748b', fontSize: '13px' }}>{u.year}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: u.status === 'Active' ? '#dcfce7' : u.status === 'Pending' ? '#fef9c3' : '#fef2f2', color: u.status === 'Active' ? '#16a34a' : u.status === 'Pending' ? '#a16207' : '#dc2626', borderRadius: '6px', fontSize: '11px', padding: '3px 8px', fontWeight: '600' }}>
                          {u.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button onClick={() => toggleUserStatus(u.id)}
                          style={{ background: u.status === 'Active' ? '#fef2f2' : '#f0fdf4', color: u.status === 'Active' ? '#dc2626' : '#16a34a', border: `1px solid ${u.status === 'Active' ? '#fecaca' : '#bbf7d0'}`, borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                          {u.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== IMPORT TAB ===================== */}
        {activeTab === 'import' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '28px' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '6px' }}>📥 Bulk Import</h2>
              <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>Upload an Excel (.xlsx) or XML (.xml) file to bulk-import students or events.</p>

              {/* Format Toggle */}
              <div style={{ marginBottom: '16px' }}>
                <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '600', marginBottom: '10px' }}>Select file format:</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['Excel', 'XML'].map(fmt => {
                    const isActive = selectedOption?.format === fmt
                    return (
                      <button key={fmt} onClick={() => handleTypeChange(fmt === 'Excel' ? 'students' : 'students-xml')}
                        style={{ padding: '7px 20px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', fontWeight: '600', background: isActive ? '#1a3a6b' : '#f0f4ff', color: isActive ? '#fff' : '#64748b', border: `1px solid ${isActive ? '#1a3a6b' : '#dbeafe'}` }}>
                        {fmt === 'Excel' ? '📊 Excel' : '📄 XML'}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Type Selector */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '600', marginBottom: '10px' }}>What do you want to import?</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {importOptions.filter(o => o.format === selectedOption?.format).map(opt => (
                    <button key={opt.value} onClick={() => handleTypeChange(opt.value)}
                      style={{ flex: 1, padding: '14px 16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', border: importType === opt.value ? '2px solid #1a3a6b' : '2px solid #e2e8f0', background: importType === opt.value ? '#eff6ff' : '#f8faff' }}>
                      <p style={{ color: '#1a3a6b', fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>{opt.label}</p>
                      <p style={{ color: '#64748b', fontSize: '11px' }}>{opt.format === 'Excel' ? 'Columns: ' : 'Format: '}{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* File Drop Zone */}
              <div onClick={() => fileInputRef.current?.click()}
                style={{ border: '2px dashed #bfdbfe', borderRadius: '12px', padding: '32px', textAlign: 'center', cursor: 'pointer', background: '#f8faff', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#1a3a6b'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#bfdbfe'}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>{selectedOption?.format === 'XML' ? '📄' : '📂'}</div>
                <p style={{ color: '#1a3a6b', fontWeight: '600', fontSize: '14px' }}>
                  {importFile ? `✅ ${importFile.name}` : `Click to select a ${selectedOption?.format} file`}
                </p>
                <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>
                  {selectedOption?.format === 'XML' ? 'Supported: .xml' : 'Supported: .xlsx, .xls'}
                </p>
                <input ref={fileInputRef} type="file" accept={selectedOption?.accept} onChange={handleFileChange} style={{ display: 'none' }} />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button onClick={handleImport} disabled={importStatus === 'loading'}
                  style={{ flex: 1, background: importStatus === 'loading' ? '#93c5fd' : '#1a3a6b', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '700', cursor: importStatus === 'loading' ? 'not-allowed' : 'pointer' }}>
                  {importStatus === 'loading' ? '⏳ Importing...' : `📤 Import via ${selectedOption?.format}`}
                </button>
                {importFile && (
                  <button onClick={handleReset}
                    style={{ padding: '12px 20px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    Clear
                  </button>
                )}
              </div>

              {/* Result */}
              {importStatus === 'success' && importResult && (
                <div style={{ marginTop: '16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px' }}>
                  <p style={{ color: '#15803d', fontWeight: '700', fontSize: '14px', marginBottom: '8px' }}>✅ {importMsg}</p>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ background: '#dcfce7', borderRadius: '8px', padding: '8px 16px', textAlign: 'center' }}>
                      <p style={{ color: '#15803d', fontSize: '20px', fontWeight: '800' }}>{importResult.imported}</p>
                      <p style={{ color: '#16a34a', fontSize: '11px' }}>Imported</p>
                    </div>
                    <div style={{ background: '#fef9c3', borderRadius: '8px', padding: '8px 16px', textAlign: 'center' }}>
                      <p style={{ color: '#a16207', fontSize: '20px', fontWeight: '800' }}>{importResult.skipped}</p>
                      <p style={{ color: '#92400e', fontSize: '11px' }}>Skipped</p>
                    </div>
                  </div>
                </div>
              )}
              {importStatus === 'error' && (
                <div style={{ marginTop: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px' }}>
                  <p style={{ color: '#dc2626', fontWeight: '600', fontSize: '13px' }}>❌ {importMsg}</p>
                </div>
              )}
            </div>

            {/* Template Guide */}
            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '28px' }}>
              <h3 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '16px' }}>📋 File Format Guide</h3>

              <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>📊 Excel Format</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px' }}>
                  <p style={{ color: '#1d4ed8', fontWeight: '700', fontSize: '13px', marginBottom: '10px' }}>👩‍🎓 Students.xlsx</p>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead><tr style={{ background: '#dbeafe' }}>{['name','email','password','department','year'].map(c => <th key={c} style={{ padding: '6px 8px', color: '#1e40af', fontWeight: '700', textAlign: 'left', border: '1px solid #bfdbfe' }}>{c}</th>)}</tr></thead>
                    <tbody><tr style={{ background: '#fff' }}>{['Tejal','tejal@vit.edu','pass123','CSE','3'].map((v,i) => <td key={i} style={{ padding: '6px 8px', color: '#374151', border: '1px solid #bfdbfe' }}>{v}</td>)}</tr></tbody>
                  </table>
                  <p style={{ color: '#3b82f6', fontSize: '11px', marginTop: '8px' }}>* name, email, password required</p>
                </div>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px' }}>
                  <p style={{ color: '#15803d', fontWeight: '700', fontSize: '13px', marginBottom: '10px' }}>📅 Events.xlsx</p>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead><tr style={{ background: '#dcfce7' }}>{['title','description','date','location','category'].map(c => <th key={c} style={{ padding: '6px 8px', color: '#15803d', fontWeight: '700', textAlign: 'left', border: '1px solid #bbf7d0' }}>{c}</th>)}</tr></thead>
                    <tbody><tr style={{ background: '#fff' }}>{['Tech Fest','Annual','2025-05-10','Hall A','technical'].map((v,i) => <td key={i} style={{ padding: '6px 8px', color: '#374151', border: '1px solid #bbf7d0' }}>{v}</td>)}</tr></tbody>
                  </table>
                  <p style={{ color: '#16a34a', fontSize: '11px', marginTop: '8px' }}>* title and date required</p>
                </div>
              </div>

              <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>📄 XML Format</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: '#fdf4ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '16px' }}>
                  <p style={{ color: '#7c3aed', fontWeight: '700', fontSize: '13px', marginBottom: '10px' }}>👩‍🎓 Students.xml</p>
                  <pre style={{ background: '#f3e8ff', borderRadius: '8px', padding: '10px', fontSize: '10px', color: '#4c1d95', overflowX: 'auto', margin: 0 }}>{`<students>\n  <student>\n    <name>Tejal</name>\n    <email>t@vit.edu</email>\n    <password>pass123</password>\n    <department>CSE</department>\n    <year>3</year>\n  </student>\n</students>`}</pre>
                </div>
                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '16px' }}>
                  <p style={{ color: '#c2410c', fontWeight: '700', fontSize: '13px', marginBottom: '10px' }}>📅 Events.xml</p>
                  <pre style={{ background: '#ffedd5', borderRadius: '8px', padding: '10px', fontSize: '10px', color: '#7c2d12', overflowX: 'auto', margin: 0 }}>{`<events>\n  <event>\n    <title>Tech Fest</title>\n    <description>Annual</description>\n    <date>2025-05-10</date>\n    <location>Hall A</location>\n    <category>technical</category>\n  </event>\n</events>`}</pre>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* ===================== END IMPORT TAB ===================== */}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '20px' }}>📊 Events by Category</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'Hackathon', count: 45, total: 200, color: '#1d4ed8' },
                  { label: 'Cultural', count: 60, total: 200, color: '#db2777' },
                  { label: 'Seminar', count: 38, total: 200, color: '#059669' },
                  { label: 'Sports', count: 30, total: 200, color: '#d97706' },
                  { label: 'Workshop', count: 27, total: 200, color: '#7c3aed' },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#1a3a6b', fontSize: '13px', fontWeight: '600' }}>{item.label}</span>
                      <span style={{ color: '#64748b', fontSize: '12px' }}>{item.count} events</span>
                    </div>
                    <div style={{ background: '#f0f4ff', borderRadius: '4px', height: '8px' }}>
                      <div style={{ width: `${(item.count / item.total) * 100}%`, background: item.color, borderRadius: '4px', height: '8px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', padding: '24px' }}>
              <h2 style={{ color: '#1a3a6b', fontWeight: '700', marginBottom: '20px' }}>📈 Platform Statistics</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Active Students', value: '4,890', change: '+12%' },
                  { label: 'Active Coordinators', value: '78', change: '+5%' },
                  { label: 'Events This Month', value: '24', change: '+8%' },
                  { label: 'Certificates This Month', value: '340', change: '+22%' },
                  { label: 'Avg. Event Attendance', value: '87%', change: '+3%' },
                ].map(s => (
                  <div key={s.label} style={{ background: '#f8faff', border: '1px solid #dbeafe', borderRadius: '10px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>{s.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#1a3a6b', fontSize: '14px', fontWeight: '700' }}>{s.value}</span>
                      <span style={{ color: '#16a34a', fontSize: '11px', background: '#dcfce7', borderRadius: '4px', padding: '2px 6px', fontWeight: '600' }}>{s.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <footer style={{ background: '#1a3a6b', color: '#93c5fd', textAlign: 'center', padding: '20px', fontSize: '13px', marginTop: '40px' }}>
        © 2025 CampusEvents · Vishwakarma Institute of Technology, Pune
      </footer>
    </div>
  )
}