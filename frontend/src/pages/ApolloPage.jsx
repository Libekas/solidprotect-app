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
    api.get('/campaigns').then(r => { setCampaigns(r.data); if (r.data[0]) setCampaignId(r.data[0].id) }).catch(() => {})
  }, [])

  const search = async () => {
    setLoading(true)
    setResults([])
    setSelected([])
    setCsvResult(null)
    try {
      const res = await api.post('/apollo/search', { market, titles, limit: 25 })
      setResults(res.data.people)
      setTotal(res.data.total)
    } catch (err) {
      alert('Apollo viga: ' + (err.response?.data?.error?.message || err.message))
    } finally {
      setLoading(false)
    }
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
    } finally {
      setImporting(false)
    }
  }

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!campaignId) { alert('Vali esmalt kampaania'); fileInputRef.current.value = ''; return }
    setCsvUploading(true)
    setCsvResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('campaign_id', campaignId)
      formData.append('market', market)
      const res = await api.post('/apollo/import-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setCsvResult(res.data)
    } catch (err) {
      alert('CSV viga: ' + (err.response?.data?.error || err.message))
    } finally {
      setCsvUploading(false)
      fileInputRef.current.value = ''
    }
  }

  const toggleAll = () => setSelected(selected.length === results.length ? [] : results.map((_, i) => i))

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '12px 20px', borderBottom: '0.5px solid #e8e6e0', background: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>Find leads</span>
        <span style={{ fontSize: 12, color: '#aaa' }}>Apollo.io</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', gap: 20 }}>
        {/* Left panel */}
        <div style={{ width: 260, flexShrink: 0 }}>

          {/* Search filters */}
          <div style={{ background: '#fff', border: '0.5px solid #e8e6e0', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 12 }}>Otsingufiltrid</div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: '#aaa', display: 'block', marginBottom: 4 }}>TURG</label>
              <select value={market} onChange={e => setMarket(e.target.value)} style={{ width: '100%', padding: '7px 10px', border: '0.5px solid #ddd', borderRadius: 8, fontSize: 13, background: '#fafaf9', outline: 'none' }}>
                {markets.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: '#aaa', display: 'block', marginBottom: 4 }}>ROLLID</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                {titles.map(t => (
                  <span key={t} style={{ fontSize: 11, padding: '2px 8px', background: '#f0ede8', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {t}
                    <span onClick={() => setTitles(prev => prev.filter(x => x !== t))} style={{ cursor: 'pointer', color: '#aaa', fontSize: 14, lineHeight: 1 }}>×</span>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input value={titleInput} onChange={e => setTitleInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && titleInput.trim()) { setTitles(prev => [...prev, titleInput.trim()]); setTitleInput('') } }}
                  placeholder="Lisa roll..." style={{ flex: 1, padding: '6px 8px', border: '0.5px solid #ddd', borderRadius: 8, fontSize: 12, outline: 'none', background: '#fafaf9' }} />
              </div>
            </div>

            <button onClick={search} disabled={loading} style={{ width: '100%', padding: '9px', background: '#D85A30', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              {loading ? 'Otsin...' : 'Otsi kontakte'}
            </button>
          </div>

          {/* Campaign */}
          <div style={{ background: '#fff', border: '0.5px solid #e8e6e0', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 12 }}>Kampaania</div>
            <select value={campaignId} onChange={e => setCampaignId(e.target.value)} style={{ width: '100%', padding: '7px 10px', border: '0.5px solid #ddd', borderRadius: 8, fontSize: 13, background: '#fafaf9', outline: 'none', marginBottom: 8 }}>
              <option value="">Vali kampaania...</option>
              {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 6 }}>
              <input value={newCampaign} onChange={e => setNewCampaign(e.target.value)} placeholder="Uus kampaania..." style={{ flex: 1, padding: '6px 8px', border: '0.5px solid #ddd', borderRadius: 8, fontSize: 12, outline: 'none', background: '#fafaf9' }} />
              <button onClick={createCampaignAndImport} style={{ padding: '6px 10px', border: '0.5px solid #ddd', borderRadius: 8, fontSize: 12, background: '#fff', cursor: 'pointer' }}>+</button>
            </div>
            {selected.length > 0 && (
              <button onClick={importSelected} disabled={importing} style={{ width: '100%', padding: '9px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, marginTop: 12, cursor: 'pointer' }}>
                {importing ? 'Impordin...' : `Impordi ${selected.length} kontakti`}
              </button>
            )}
          </div>

          {/* CSV Import */}
          <div style={{ background: '#fff', border: '0.5px solid #e8e6e0', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>CSV import</div>
            <div style={{ fontSize: 11, color: '#aaa', marginBottom: 12 }}>Apollo.io eksporditud CSV fail</div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              style={{ display: 'none' }}
              id="csv-upload"
            />
            <label htmlFor="csv-upload" style={{
              display: 'block', width: '100%', padding: '9px', background: csvUploading ? '#f0ede8' : '#fafaf9',
              border: '0.5px dashed #ccc', borderRadius: 8, fontSize: 13, fontWeight: 500,
              textAlign: 'center', cursor: campaignId ? 'pointer' : 'not-allowed',
              color: campaignId ? '#1a1a1a' : '#aaa', boxSizing: 'border-box'
            }}>
              {csvUploading ? 'Impordin...' : '↑ Lae CSV üles'}
            </label>

            {csvResult && (
              <div style={{ marginTop: 10, padding: '10px 12px', background: '#EAF3DE', borderRadius: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#3B6D11', marginBottom: 2 }}>Import õnnestus</div>
                <div style={{ fontSize: 11, color: '#555' }}>
                  Imporditud: <strong>{csvResult.imported}</strong> / {csvResult.total}<br/>
                  {csvResult.skipped > 0 && <span style={{ color: '#aaa' }}>Vahele jäetud: {csvResult.skipped}</span>}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Results table */}
        <div style={{ flex: 1 }}>
          {results.length === 0 && !loading && (
            <div style={{ textAlign: 'center', color: '#aaa', fontSize: 13, paddingTop: 60 }}>
              Vali turg ja rollid, seejärel otsi kontakte<br/>
              <span style={{ fontSize: 11, marginTop: 8, display: 'block' }}>või impordi Apollo CSV vasakult</span>
            </div>
          )}
          {results.length > 0 && (
            <>
              <div style={{ fontSize: 12, color: '#aaa', marginBottom: 12 }}>Leitud {total} kontakti · kuvatakse {results.length}</div>
              <div style={{ background: '#fff', border: '0.5px solid #e8e6e0', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px 16px', textAlign: 'left', fontSize: 11, color: '#aaa', fontWeight: 500, borderBottom: '0.5px solid #e8e6e0' }}>
                        <input type="checkbox" checked={selected.length === results.length} onChange={toggleAll} />
                      </th>
                      {['Nimi', 'Firma', 'Roll', 'Maa', 'Email'].map(h => (
                        <th key={h} style={{ padding: '8px 16px', textAlign: 'left', fontSize: 11, color: '#aaa', fontWeight: 500, borderBottom: '0.5px solid #e8e6e0' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((p, i) => (
                      <tr key={i} style={{ background: selected.includes(i) ? '#FAECE7' : 'transparent' }}>
                        <td style={{ padding: '9px 16px', borderBottom: '0.5px solid #f5f3f0' }}>
                          <input type="checkbox" checked={selected.includes(i)} onChange={() => setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])} />
                        </td>
                        <td style={{ padding: '9px 16px', fontSize: 13, fontWeight: 500, borderBottom: '0.5px solid #f5f3f0' }}>{p.first_name} {p.last_name}</td>
                        <td style={{ padding: '9px 16px', fontSize: 12, color: '#888', borderBottom: '0.5px solid #f5f3f0' }}>{p.organization?.name || '—'}</td>
                        <td style={{ padding: '9px 16px', fontSize: 12, color: '#888', borderBottom: '0.5px solid #f5f3f0' }}>{p.title}</td>
                        <td style={{ padding: '9px 16px', fontSize: 12, color: '#888', borderBottom: '0.5px solid #f5f3f0' }}>{p.country || '—'}</td>
                        <td style={{ padding: '9px 16px', fontSize: 12, color: '#888', borderBottom: '0.5px solid #f5f3f0' }}>{p.email || <span style={{ color: '#ddd' }}>—</span>}</td>
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
