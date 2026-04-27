import React, { useState, useEffect, useRef } from 'react'
import api from '../api'

const markets = [
  { value: 'NL', label: 'Netherlands' },
  { value: 'CA', label: 'Canada' },
  { value: 'FI', label: 'Finland' }
]

const defaultTitles = [
  'Managing Director', 'CEO', 'Production Manager',
  'CLT Manager', 'Procurement Manager', 'Technical Director',
  'Wood Processing Manager', 'Project Manager'
]

const labelStyle = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
  display: 'block', marginBottom: 6,
}

const cardStyle = {
  background: '#111116',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 12, padding: 16, marginBottom: 14,
}

const inputStyle = {
  width: '100%', padding: '8px 12px',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8, fontSize: 13,
  background: 'rgba(255,255,255,0.05)',
  color: '#e8e8ea', outline: 'none',
  fontFamily: "'DM Sans', sans-serif",
  boxSizing: 'border-box',
}

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
}

export default function ApolloPage() {
  const [market, setMarket] = useState('CA')
  const [titles, setTitles] = useState(defaultTitles)
  const [titleInput, setTitleInput] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [campaignId, setCampaignId] = useState('')
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [csvUploading, setCsvUploading] = useState(false)
  const [total, setTotal] = useState(0)
  const [newCampaign, setNewCampaign] = useState('')
  const [csvResult, setCsvResult] = useState(null)
  const fileInputRef = useRef()

  useEffect(() => {
    api.get('/campaigns').then(r => {
      setCampaigns(r.data)
      if (r.data[0]) setCampaignId(r.data[0].id)
    }).catch(() => {})
  }, [])

  const search = async () => {
    setLoading(true); setResults([]); setSelected([]); setCsvResult(null)
    try {
      const res = await api.post('/apollo/search', { market, titles, limit: 25 })
      setResults(res.data.people); setTotal(res.data.total)
    } catch (err) {
      alert('Apollo viga: ' + (err.response?.data?.error?.message || err.message))
    } finally { setLoading(false) }
  }

  const createCampaignAndImport = async () => {
    if (!newCampaign.trim()) return
    const res = await api.post('/campaigns', { name: newCampaign, market })
    setCampaigns(prev => [res.data, ...prev])
    setCampaignId(res.data.id)
    setNewCampaign('')
  }

  const importSelected = async () => {
    if (!campaignId || selected.length === 0) return alert('Vali kampaania ja vähemalt 1 kontakt')
    setImporting(true)
    try {
      const people = results.filter((_, i) => selected.includes(i))
      const res = await api.post('/apollo/import', { people, campaign_id: campaignId, market })
      alert(`Imporditud ${res.data.imported} lead'i!`)
      setSelected([])
    } catch (err) {
      alert('Import viga: ' + err.message)
    } finally { setImporting(false) }
  }

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!campaignId) { alert('Vali esmalt kampaania'); fileInputRef.current.value = ''; return }
    setCsvUploading(true); setCsvResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('campaign_id', campaignId)
      formData.append('market', market)
      const res = await api.post('/apollo/import-csv', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setCsvResult(res.data)
    } catch (err) {
      alert('CSV viga: ' + (err.response?.data?.error || err.message))
    } finally { setCsvUploading(false); fileInputRef.current.value = '' }
  }

  const toggleAll = () => setSelected(selected.length === results.length ? [] : results.map((_, i) => i))

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0d0d10', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <header style={{
        padding: '0 28px', height: 60,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
      }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: '#f0f0f2', letterSpacing: -0.4, margin: 0 }}>Find leads</h1>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontFamily: 'DM Mono, monospace' }}>Apollo.io</span>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', gap: 20 }}>

        {/* Left panel */}
        <div style={{ width: 260, flexShrink: 0 }}>

          {/* Search filters */}
          <div style={cardStyle}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#f0f0f2', marginBottom: 14 }}>Otsingufiltrid</div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Turg</label>
              <select value={market} onChange={e => setMarket(e.target.value)} style={selectStyle}>
                {markets.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Rollid</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                {titles.map(t => (
                  <span key={t} style={{
                    fontSize: 11, padding: '3px 8px',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4,
                    color: 'rgba(255,255,255,0.6)',
                  }}>
                    {t}
                    <span
                      onClick={() => setTitles(prev => prev.filter(x => x !== t))}
                      style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: 14, lineHeight: 1 }}
                    >×</span>
                  </span>
                ))}
              </div>
              <input
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && titleInput.trim()) {
                    setTitles(prev => [...prev, titleInput.trim()]); setTitleInput('')
                  }
                }}
                placeholder="Lisa roll..."
                style={{ ...inputStyle, width: '100%' }}
              />
            </div>

            <button
              onClick={search}
              disabled={loading}
              style={{
                width: '100%', padding: '9px', borderRadius: 8, border: 'none',
                background: loading ? '#1d4ed8' : '#3b82f6',
                color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#2563eb' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#3b82f6' }}
            >
              {loading ? 'Otsin...' : 'Otsi kontakte'}
            </button>
          </div>

          {/* Campaign */}
          <div style={cardStyle}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#f0f0f2', marginBottom: 14 }}>Kampaania</div>
            <select
              value={campaignId}
              onChange={e => setCampaignId(e.target.value)}
              style={{ ...selectStyle, marginBottom: 10 }}
            >
              <option value="">Vali kampaania...</option>
              {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                value={newCampaign}
                onChange={e => setNewCampaign(e.target.value)}
                placeholder="Uus kampaania..."
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={createCampaignAndImport}
                style={{
                  padding: '8px 12px', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, fontSize: 14, background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                }}
              >+</button>
            </div>
            {selected.length > 0 && (
              <button
                onClick={importSelected}
                disabled={importing}
                style={{
                  width: '100%', padding: '9px', borderRadius: 8, border: 'none',
                  background: importing ? '#1a3a1a' : 'rgba(74,222,128,0.15)',
                  border: '1px solid rgba(74,222,128,0.25)',
                  color: '#4ade80', fontSize: 13, fontWeight: 500,
                  marginTop: 12, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {importing ? 'Impordin...' : `Impordi ${selected.length} kontakti`}
              </button>
            )}
          </div>

          {/* CSV Import */}
          <div style={cardStyle}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#f0f0f2', marginBottom: 4 }}>CSV import</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginBottom: 12 }}>Apollo.io eksporditud CSV fail</div>
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCsvUpload} style={{ display: 'none' }} id="csv-upload" />
            <label
              htmlFor="csv-upload"
              style={{
                display: 'block', width: '100%', padding: '9px',
                background: csvUploading ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 8,
                fontSize: 13, fontWeight: 500, textAlign: 'center',
                cursor: campaignId ? 'pointer' : 'not-allowed',
                color: campaignId ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)',
                boxSizing: 'border-box', transition: 'background 0.15s',
              }}
            >
              {csvUploading ? 'Impordin...' : '↑ Lae CSV üles'}
            </label>
            {csvResult && (
              <div style={{
                marginTop: 10, padding: '10px 12px',
                background: 'rgba(74,222,128,0.08)',
                border: '1px solid rgba(74,222,128,0.2)',
                borderRadius: 8,
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#4ade80', marginBottom: 4 }}>Import õnnestus</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                  Imporditud: <strong style={{ color: '#4ade80' }}>{csvResult.imported}</strong> / {csvResult.total}
                  {csvResult.skipped > 0 && <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: 6 }}>· Vahele jäetud: {csvResult.skipped}</span>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div style={{ flex: 1 }}>
          {results.length === 0 && !loading && (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 14, paddingTop: 80 }}>
              Vali turg ja rollid, seejärel otsi kontakte
              <div style={{ fontSize: 12, marginTop: 8, color: 'rgba(255,255,255,0.12)' }}>või impordi Apollo CSV vasakult</div>
            </div>
          )}
          {results.length > 0 && (
            <>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 12, fontFamily: 'DM Mono, monospace' }}>
                Leitud {total} kontakti · kuvatakse {results.length}
              </div>
              <div style={{ background: '#111116', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#0d0d10' }}>
                      <th style={{ padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <input type="checkbox" checked={selected.length === results.length} onChange={toggleAll} style={{ accentColor: '#3b82f6' }} />
                      </th>
                      {['Nimi', 'Firma', 'Roll', 'Maa', 'Email'].map(h => (
                        <th key={h} style={{
                          padding: '10px 16px', textAlign: 'left',
                          fontSize: 10.5, color: 'rgba(255,255,255,0.25)', fontWeight: 600,
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((p, i) => (
                      <tr
                        key={i}
                        style={{
                          background: selected.includes(i) ? 'rgba(59,130,246,0.08)' : 'transparent',
                          borderLeft: selected.includes(i) ? '2px solid #3b82f6' : '2px solid transparent',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => { if (!selected.includes(i)) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                        onMouseLeave={e => { if (!selected.includes(i)) e.currentTarget.style.background = 'transparent' }}
                      >
                        <td style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <input
                            type="checkbox"
                            checked={selected.includes(i)}
                            onChange={() => setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                            style={{ accentColor: '#3b82f6' }}
                          />
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 500, color: '#f0f0f2', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          {p.first_name} {p.last_name}
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: 12.5, color: 'rgba(255,255,255,0.55)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          {p.organization?.name || '—'}
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: 12.5, color: 'rgba(255,255,255,0.45)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          {p.title}
                        </td>
                        <td style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          {p.country
                            ? <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }}>{p.country}</span>
                            : <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>—</span>}
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Mono, monospace', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          {p.email || <span style={{ color: 'rgba(255,255,255,0.15)' }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
