import Navbar from '../components/Navbar'
import { useState } from 'react'

const certificates = [
  { id: 1, title: 'National Hackathon 2025', date: 'Mar 15, 2025', role: 'Participant', category: 'Hackathon', issueDate: 'Mar 16, 2025', certId: 'CE-2025-HAC-001', color: '#1d4ed8' },
  { id: 2, title: 'Cultural Fest – Rhythm', date: 'Oct 5, 2024', role: 'Volunteer', category: 'Cultural', issueDate: 'Oct 6, 2024', certId: 'CE-2024-CUL-089', color: '#db2777' },
  { id: 3, title: 'ML Workshop', date: 'Sep 20, 2024', role: 'Participant', category: 'Workshop', issueDate: 'Sep 21, 2024', certId: 'CE-2024-WRK-034', color: '#059669' },
  { id: 4, title: 'CodeSprint 2024', date: 'Nov 10, 2024', role: 'Winner 🏆', category: 'Hackathon', issueDate: 'Nov 11, 2024', certId: 'CE-2024-HAC-012', color: '#d97706' },
  { id: 5, title: 'Tech Talk: AI & Future', date: 'Apr 2, 2025', role: 'Participant', category: 'Seminar', issueDate: 'Apr 3, 2025', certId: 'CE-2025-SEM-007', color: '#7c3aed' },
]

function CertificatePreview({ cert, onClose }) {
  return (
    <div onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(26,58,107,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: '16px', padding: '48px', maxWidth: '680px', width: '100%', position: 'relative', textAlign: 'center', border: `6px solid ${cert.color}`, boxShadow: '0 24px 64px rgba(26,58,107,0.2)' }}>

        <button onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '20px', background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>

        {/* Top */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎓</div>
          <p style={{ color: '#94a3b8', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase' }}>CampusEvents · VIT Pune</p>
        </div>

        <h1 style={{ color: '#1a3a6b', fontFamily: 'Georgia, serif', fontSize: '26px', marginBottom: '8px' }}>
          Certificate of {cert.role.includes('Winner') ? 'Achievement' : cert.role === 'Volunteer' ? 'Appreciation' : 'Participation'}
        </h1>

        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>This is to certify that</p>

        <h2 style={{ color: cert.color, fontFamily: 'Georgia, serif', fontSize: '34px', marginBottom: '8px', borderBottom: `2px solid ${cert.color}`, display: 'inline-block', paddingBottom: '4px' }}>
          Tejal Jadhav
        </h2>

        <p style={{ color: '#475569', fontSize: '14px', margin: '16px 0' }}>
          has successfully completed the role of <strong style={{ color: '#1a3a6b' }}>{cert.role}</strong> in
        </p>

        <h3 style={{ color: '#1a3a6b', fontFamily: 'Georgia, serif', fontSize: '20px', marginBottom: '8px' }}>{cert.title}</h3>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '28px' }}>Held on {cert.date}</p>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ textAlign: 'left' }}>
            <p style={{ color: '#1a3a6b', fontFamily: 'Georgia, serif', fontSize: '15px', borderBottom: '1px solid #1a3a6b', paddingBottom: '4px', marginBottom: '4px' }}>Dr. R. Sharma</p>
            <p style={{ color: '#64748b', fontSize: '11px' }}>Event Coordinator</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: cert.color, borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '14px', margin: '0 auto 4px' }}>CE</div>
            <p style={{ color: '#64748b', fontSize: '10px' }}>Official Seal</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#64748b', fontSize: '11px' }}>Certificate ID</p>
            <p style={{ color: '#1a3a6b', fontSize: '12px', fontWeight: '700' }}>{cert.certId}</p>
            <p style={{ color: '#64748b', fontSize: '11px' }}>Issued: {cert.issueDate}</p>
          </div>
        </div>

        <button onClick={() => alert('Certificate downloaded!')}
          style={{ marginTop: '24px', background: cert.color, color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 32px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
          ⬇️ Download Certificate
        </button>
      </div>
    </div>
  )
}

export default function Certificates() {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('All')

  const categories = ['All', 'Hackathon', 'Cultural', 'Workshop', 'Seminar']
  const filtered = filter === 'All' ? certificates : certificates.filter(c => c.category === filter)

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />

      {selected && <CertificatePreview cert={selected} onClose={() => setSelected(null)} />}

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a6b, #2563eb)', paddingTop: '80px', paddingBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ color: '#fff', fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>📜 My Certificates</h1>
        <p style={{ color: '#bfdbfe', fontSize: '15px' }}>All your earned certificates in one place — view and download anytime</p>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Total Earned', value: certificates.length, color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
            { label: 'As Participant', value: certificates.filter(c => c.role === 'Participant').length, color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
            { label: 'As Volunteer/Winner', value: certificates.filter(c => c.role !== 'Participant').length, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '16px', textAlign: 'center', padding: '20px' }}>
              <div style={{ color: s.color, fontSize: '32px', fontWeight: '800' }}>{s.value}</div>
              <div style={{ color: '#64748b', fontSize: '13px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              style={{
                padding: '7px 16px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
                background: filter === c ? '#1a3a6b' : '#fff',
                color: filter === c ? '#fff' : '#64748b',
                border: `1px solid ${filter === c ? '#1a3a6b' : '#dbeafe'}`,
                fontWeight: filter === c ? '600' : '400'
              }}>
              {c}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filtered.map(cert => (
            <div key={cert.id} onClick={() => setSelected(cert)}
              style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#1a3a6b'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,58,107,0.1)' }}
              onMouseOut={e => { e.currentTarget.style.borderColor = '#dbeafe'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>

              {/* Banner */}
              <div style={{ background: `linear-gradient(135deg, ${cert.color}20, ${cert.color}08)`, borderBottom: `3px solid ${cert.color}`, padding: '28px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎓</div>
                <p style={{ color: cert.color, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '700' }}>
                  Certificate of {cert.role.includes('Winner') ? 'Achievement' : cert.role === 'Volunteer' ? 'Appreciation' : 'Participation'}
                </p>
                <h3 style={{ color: '#1a3a6b', fontFamily: 'Georgia, serif', fontSize: '15px', fontWeight: '700' }}>{cert.title}</h3>
              </div>

              {/* Body */}
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ background: cert.color + '15', color: cert.color, borderRadius: '6px', fontSize: '11px', padding: '3px 10px', fontWeight: '600' }}>{cert.role}</span>
                  <span style={{ color: '#94a3b8', fontSize: '11px' }}>{cert.issueDate}</span>
                </div>
                <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '12px' }}>🪪 {cert.certId}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={e => { e.stopPropagation(); setSelected(cert) }}
                    style={{ flex: 1, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                    👁️ View
                  </button>
                  <button onClick={e => { e.stopPropagation(); alert(`Downloading ${cert.certId}`) }}
                    style={{ flex: 1, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                    ⬇️ Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer style={{ background: '#1a3a6b', color: '#93c5fd', textAlign: 'center', padding: '20px', fontSize: '13px', marginTop: '40px' }}>
        © 2025 CampusEvents · Vishwakarma Institute of Technology, Pune
      </footer>
    </div>
  )
}