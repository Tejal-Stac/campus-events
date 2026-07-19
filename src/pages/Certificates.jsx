import Navbar from '../components/Navbar'
import { useState, useEffect } from 'react'
import api from '../api/axiosConfig'

function CertificatePreview({ cert, onClose, onDownload, downloading }) {
  return (
    <div onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(26,58,107,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: '16px', padding: '48px', maxWidth: '680px', width: '100%', position: 'relative', textAlign: 'center', border: `6px solid ${cert.color}`, boxShadow: '0 24px 64px rgba(26,58,107,0.2)' }}>

        <button onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '20px', background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>

        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎓</div>
          <p style={{ color: '#94a3b8', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase' }}>CampusEvents · VIT Pune</p>
        </div>

        <h1 style={{ color: '#1a3a6b', fontFamily: 'Georgia, serif', fontSize: '26px', marginBottom: '8px' }}>
          Certificate of Participation
        </h1>

        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>This is to certify that</p>

        <h2 style={{ color: cert.color, fontFamily: 'Georgia, serif', fontSize: '34px', marginBottom: '8px', borderBottom: `2px solid ${cert.color}`, display: 'inline-block', paddingBottom: '4px' }}>
          {cert.studentName}
        </h2>

        <p style={{ color: '#475569', fontSize: '14px', margin: '16px 0' }}>
          has successfully participated in
        </p>

        <h3 style={{ color: '#1a3a6b', fontFamily: 'Georgia, serif', fontSize: '20px', marginBottom: '8px' }}>{cert.title}</h3>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '28px' }}>Organised by: {cert.organisingClub}</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ textAlign: 'left' }}>
            <p style={{ color: '#1a3a6b', fontFamily: 'Georgia, serif', fontSize: '15px', borderBottom: '1px solid #1a3a6b', paddingBottom: '4px', marginBottom: '4px' }}>Event Coordinator</p>
            <p style={{ color: '#64748b', fontSize: '11px' }}>VIT Pune</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: cert.color, borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '14px', margin: '0 auto 4px' }}>CE</div>
            <p style={{ color: '#64748b', fontSize: '10px' }}>Official Seal</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#64748b', fontSize: '11px' }}>Dean of Student Affairs</p>
            <p style={{ color: '#1a3a6b', fontSize: '12px', fontWeight: '700' }}>VIT Pune</p>
          </div>
        </div>

        <button onClick={() => onDownload(cert.eventId)}
          disabled={downloading}
          style={{ marginTop: '24px', background: downloading ? '#94a3b8' : cert.color, color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 32px', fontSize: '14px', fontWeight: '700', cursor: downloading ? 'not-allowed' : 'pointer' }}>
          {downloading ? '⏳ Downloading...' : '⬇️ Download Certificate PDF'}
        </button>
      </div>
    </div>
  )
}

const colors = ['#1d4ed8', '#db2777', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0891b2']

const mockCertificates = [
  { id: 1, eventId: 1, title: 'National Hackathon 2025', organisingClub: 'IEEE VIT', category: 'Hackathon', color: '#1d4ed8', studentName: 'Your Name' },
  { id: 2, eventId: 2, title: 'Cultural Fest – Rhythm', organisingClub: 'Cultural Committee', category: 'Cultural', color: '#db2777', studentName: 'Your Name' },
  { id: 3, eventId: 3, title: 'ML Workshop', organisingClub: 'AI Club', category: 'Workshop', color: '#059669', studentName: 'Your Name' },
]

export default function Certificates() {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('All')
  const [registeredEvents, setRegisteredEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchRegisteredEvents()
  }, [])

  const fetchRegisteredEvents = async () => {
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const response = await api.get('/events')
      const events = Array.isArray(response.data) ? response.data : []
      const approved = events.filter(e => e.status === 'approved')
      setRegisteredEvents(approved)
    } catch (err) {
      setError('Could not load events')
    }
    setLoading(false)
  }

  const downloadCertificate = async (eventId) => {
    if (!token) {
      alert('Please login to download certificates!')
      return
    }
    setDownloading(true)
    try {
      const response = await api.get(`/certificates/generate/${eventId}`, {
        responseType: 'blob'
      })

      const blob = response.data
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificate-${user.firstName || 'student'}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not generate certificate'
      alert(msg)
    }
    setDownloading(false)
  }

  const displayCerts = token
    ? registeredEvents.map((e, i) => ({
        id: e.id,
        eventId: e.id,
        title: e.title,
        organisingClub: e.organising_club || 'VIT Pune',
        category: e.category || 'Event',
        color: colors[i % colors.length],
        studentName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Student'
      }))
    : mockCertificates

  const categories = ['All', ...new Set(displayCerts.map(c => c.category))]
  const filtered = filter === 'All' ? displayCerts : displayCerts.filter(c => c.category === filter)

  return (
    <div style={{ background: '#f0f4ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />

      {selected && (
        <CertificatePreview
          cert={selected}
          onClose={() => setSelected(null)}
          onDownload={downloadCertificate}
          downloading={downloading}
        />
      )}

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a6b, #2563eb)', paddingTop: '80px', paddingBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ color: '#fff', fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: '700', marginBottom: '8px' }}>📜 My Certificates</h1>
        <p style={{ color: '#bfdbfe', fontSize: '15px' }}>All your earned certificates — view and download anytime</p>
        {!token && (
          <p style={{ color: '#fde68a', fontSize: '13px', marginTop: '8px' }}>⚠️ Login to see your real certificates</p>
        )}
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Total Earned', value: displayCerts.length, color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
            { label: 'Events Attended', value: displayCerts.length, color: '#059669', bg: '#f0fdf4', border: '#bbf7d0' },
            { label: 'Downloadable', value: displayCerts.length, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '16px', textAlign: 'center', padding: '20px' }}>
              <div style={{ color: s.color, fontSize: '32px', fontWeight: '800' }}>{s.value}</div>
              <div style={{ color: '#64748b', fontSize: '13px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
            <p style={{ color: '#dc2626', fontSize: '13px' }}>⚠️ {error}</p>
          </div>
        )}

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

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
            <p style={{ color: '#64748b' }}>Loading your certificates...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px', border: '1px solid #dbeafe' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <h3 style={{ color: '#1a3a6b', marginBottom: '8px' }}>No certificates yet!</h3>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Register for events and participate to earn certificates.</p>
          </div>
        )}

        {/* Cards */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filtered.map(cert => (
              <div key={cert.id} onClick={() => setSelected(cert)}
                style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = '#1a3a6b'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,58,107,0.1)' }}
                onMouseOut={e => { e.currentTarget.style.borderColor = '#dbeafe'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>

                <div style={{ background: `linear-gradient(135deg, ${cert.color}20, ${cert.color}08)`, borderBottom: `3px solid ${cert.color}`, padding: '28px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎓</div>
                  <p style={{ color: cert.color, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '700' }}>
                    Certificate of Participation
                  </p>
                  <h3 style={{ color: '#1a3a6b', fontFamily: 'Georgia, serif', fontSize: '15px', fontWeight: '700' }}>{cert.title}</h3>
                </div>

                <div style={{ padding: '16px' }}>
                  <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '12px' }}>🏢 {cert.organisingClub}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={e => { e.stopPropagation(); setSelected(cert) }}
                      style={{ flex: 1, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                      👁️ View
                    </button>
                    <button onClick={e => { e.stopPropagation(); downloadCertificate(cert.eventId) }}
                      disabled={downloading}
                      style={{ flex: 1, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                      ⬇️ Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer style={{ background: '#1a3a6b', color: '#93c5fd', textAlign: 'center', padding: '20px', fontSize: '13px', marginTop: '40px' }}>
        © 2025 CampusEvents · Vishwakarma Institute of Technology, Pune
      </footer>
    </div>
  )
}