import React, { useState, useEffect } from 'react'
import api from '../api'

const marketLabel = { NL: 'Netherlands', CA: 'Canada', FI: 'Finland' }
const marketColors = {
  NL: { bg: '#E6F1FB', color: '#185FA5' },
  CA: { bg: '#EAF3DE', color: '#3B6D11' },
  FI: { bg: '#EEEDFE', color: '#534AB7' }
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [name, setName] = useState('')
  const [market, setMarket] = useState('NL')

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await api.get('/campaigns')
      setCampaigns(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  const create = async () => {
    if (!name.trim()) return
    await api.post('/campaigns', { name, market })
    setName(''); setMarket('NL'); setShowNew(false)
    fetch()
  }

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 20px', borderBottom: '0.5px solid #e8e6e0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>Campaigns</span>
        <button onClick={() => setShowNew(!showNew)} style={{ padding: '6px 14px', background: '#D85A30', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>+ Uus kampaania</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {showNew && (
          <div style={{ background: '#fff', border: '0.5px solid #e8e6e0', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Uus kampaania</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Kampaania nimi..." style={{ flex: 1, padding: '8px 12px', border: '0.5px solid #ddd', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fafaf9' }} autoFocus />
              <select value={market} onChange={e => setMarket(e.target.value)} style={{ padding: '8px 12px', border: '0.5px solid #ddd', borderRadius: 8, fontSize: 13, background: '#fafaf9', outline: 'none' }}>
                <option value="NL">Netherlands</option>
                <option value="CA">Canada</option>
                <option value="FI">Finland</option>
              </select>
              <button onClick={create} style={{ padding: '8px 16px', background: '#D85A30', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>Loo</button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', color: '#aaa', fontSize: 13, paddingTop: 40 }}>Laen...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {campaigns.map(c => {
              const mc = marketColors[c.market] || { bg: '#f5f4f1', color: '#666' }
              const total = parseInt(c.lead_count) || 0
              const contacted = parseInt(c.contacted_count) || 0
              const replied = parseInt(c.replied_count) || 0
              const rate = total > 0 ? Math.round((replied / total) * 100) : 0
              return (
                <div key={c.id} style={{ background: '#fff', border: '0.5px solid #e8e6e0', borderRadius: 12, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{c.name}</div>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: mc.bg, color: mc.color, flexShrink: 0 }}>{marketLabel[c.market] || c.market}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
                    {[['Leads', total, '#666'], ['Contacted', contacted, '#185FA5'], ['Replied', replied, '#3B6D11']].map(([label, val, color]) => (
                      <div key={label} style={{ textAlign: 'center', padding: '8px 0', background: '#fafaf9', borderRadius: 8 }}>
                        <div style={{ fontSize: 18, fontWeight: 500, color }}>{val}</div>
                        <div style={{ fontSize: 10, color: '#aaa' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 10, height: 4, background: '#f0ede8', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${rate}%`, background: '#639922', borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{rate}% reply rate</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
