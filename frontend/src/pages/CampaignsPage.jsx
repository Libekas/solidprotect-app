import React, { useState, useEffect } from 'react'
import api from '../api'

const marketLabel = { NL: 'Netherlands', CA: 'Canada', FI: 'Finland' }
const marketColors = {
  NL: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: 'rgba(59,130,246,0.2)' },
  CA: { bg: 'rgba(74,222,128,0.1)', color: '#4ade80', border: 'rgba(74,222,128,0.2)' },
  FI: { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: 'rgba(167,139,250,0.2)' },
}

const DEFAULT_INITIAL = `Subject: Fire protection for wood — {company}

Hi {first_name},

I came across {company} and wanted to reach out about SPFR100 — our transparent, water-based fire retardant for wood that achieves EN 13501-1 B-s1,d0 classification.

It's been gaining traction with CLT manufacturers and timber processors across {market}, particularly for projects requiring certified fire protection without compromising the wood's natural appearance.

Would you be open to a brief call to explore if this could be relevant for {company}'s projects?

Best regards,
Taavi Küng
Solid Protect OÜ`

const DEFAULT_FOLLOWUP = `Subject: Following up — SPFR100 fire protection for {company}

Hi {first_name},

I wanted to follow up on my previous message about SPFR100 fire retardant treatment for wood.

In case it got buried — SPFR100 is a certified transparent treatment (EN 13501-1 B-s1,d0) that's been adopted by several {market} timber companies for both interior and exterior applications.

Happy to send over our technical datasheet or arrange a short call at your convenience.

Best,
Taavi Küng
Solid Protect OÜ`

const labelStyle = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
}

function TemplateEditor({ campaign, onSave, onClose }) {
  const [initial, setInitial] = useState(campaign.template_initial || DEFAULT_INITIAL)
  const [followup, setFollowup] = useState(campaign.template_followup || DEFAULT_FOLLOWUP)
  const [tab, setTab] = useState('initial')
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genResult, setGenResult] = useState(null)

  const save = async () => {
    setSaving(true)
    await api.patch(`/campaigns/${campaign.id}`, { template_initial: initial, template_followup: followup })
    setSaving(false)
    onSave()
  }

  const generate = async (type) => {
    setGenerating(true); setGenResult(null)
    try {
      const res = await api.post(`/campaigns/${campaign.id}/generate`, { type })
      setGenResult(res.data)
    } catch (err) {
      setGenResult({ error: err.response?.data?.error || err.message })
    } finally { setGenerating(false) }
  }

  const variables = ['{first_name}', '{last_name}', '{full_name}', '{company}', '{role}', '{market}']

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#111116', borderRadius: 16, width: 680, maxHeight: '88vh',
        display: 'flex', flexDirection: 'column',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        overflow: 'hidden',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#f0f0f2' }}>{campaign.name}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Email templates</div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 17, color: 'rgba(255,255,255,0.4)' }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {/* Variables */}
          <div style={{ marginBottom: 16, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
            <div style={{ ...labelStyle, marginBottom: 8, display: 'block' }}>Available variables</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {variables.map(v => (
                <span key={v}
                  style={{ fontSize: 12, padding: '3px 9px', borderRadius: 6, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa', fontFamily: 'DM Mono, monospace', cursor: 'pointer' }}
                  onClick={() => { const setter = tab === 'initial' ? setInitial : setFollowup; setter(prev => prev + v) }}
                >{v}</span>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2, marginBottom: 14, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 3 }}>
            {['initial', 'followup'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: '8px', borderRadius: 8, border: 'none',
                background: tab === t ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: tab === t ? '#f0f0f2' : 'rgba(255,255,255,0.4)',
                fontSize: 13.5, fontWeight: tab === t ? 500 : 400,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}>
                {t === 'initial' ? '✉ Initial email' : '↩ Follow-up email'}
              </button>
            ))}
          </div>

          {/* Editor */}
          <textarea
            value={tab === 'initial' ? initial : followup}
            onChange={e => tab === 'initial' ? setInitial(e.target.value) : setFollowup(e.target.value)}
            style={{
              width: '100%', height: 280, padding: '12px 14px',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
              fontSize: 13, lineHeight: 1.7, resize: 'vertical', outline: 'none',
              background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.75)',
              fontFamily: "'DM Sans', sans-serif",
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(96,165,250,0.4)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />

          {genResult && (
            <div style={{
              marginTop: 12, padding: '12px 14px', borderRadius: 10,
              background: genResult.error ? 'rgba(239,68,68,0.1)' : 'rgba(74,222,128,0.08)',
              border: genResult.error ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(74,222,128,0.2)',
            }}>
              {genResult.error
                ? <div style={{ fontSize: 13, color: '#f87171' }}>Viga: {genResult.error}</div>
                : <div style={{ fontSize: 13, color: '#4ade80', fontWeight: 500 }}>
                    ✓ Genereeritud {genResult.generated} emaili mustandina
                    <div style={{ fontSize: 12, color: 'rgba(74,222,128,0.7)', fontWeight: 400, marginTop: 2 }}>Mine Dashboardi et üle vaadata ja kinnitada</div>
                  </div>
              }
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => generate('initial')} disabled={generating} style={{ padding: '9px 16px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              {generating ? 'Generating...' : '⚡ Generate initial'}
            </button>
            <button onClick={() => generate('followup')} disabled={generating} style={{ padding: '9px 16px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              {generating ? '...' : '⚡ Generate follow-ups'}
            </button>
          </div>
          <button onClick={save} disabled={saving} style={{ padding: '9px 22px', borderRadius: 9, border: 'none', background: saving ? '#2563eb' : '#3b82f6', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            {saving ? 'Saving...' : 'Save templates'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [name, setName] = useState('')
  const [market, setMarket] = useState('CA')
  const [editing, setEditing] = useState(null)

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const res = await api.get('/campaigns')
      setCampaigns(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCampaigns() }, [])

  const create = async () => {
    if (!name.trim()) return
    await api.post('/campaigns', { name, market })
    setName(''); setMarket('CA'); setShowNew(false)
    fetchCampaigns()
  }

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#0d0d10', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <header style={{
        padding: '0 28px', height: 60,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: '#f0f0f2', letterSpacing: -0.4, margin: 0 }}>Campaigns</h1>
        <button
          onClick={() => setShowNew(!showNew)}
          style={{
            padding: '8px 18px', background: '#3b82f6', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500,
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
          onMouseLeave={e => e.currentTarget.style.background = '#3b82f6'}
        >+ New campaign</button>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {/* New campaign form */}
        {showNew && (
          <div style={{
            background: '#111116', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: 20, marginBottom: 20,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: '#f0f0f2' }}>New campaign</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                value={name} onChange={e => setName(e.target.value)}
                placeholder="Campaign name..."
                autoFocus
                onKeyDown={e => e.key === 'Enter' && create()}
                style={{
                  flex: 1, padding: '9px 14px',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                  fontSize: 14, outline: 'none',
                  background: 'rgba(255,255,255,0.05)', color: '#f0f0f2',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
              <select value={market} onChange={e => setMarket(e.target.value)} style={{
                padding: '9px 14px', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, fontSize: 14, background: 'rgba(255,255,255,0.05)',
                color: '#f0f0f2', outline: 'none', cursor: 'pointer',
              }}>
                <option value="CA">Canada</option>
                <option value="NL">Netherlands</option>
                <option value="FI">Finland</option>
              </select>
              <button onClick={create} style={{ padding: '9px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Create</button>
              <button onClick={() => setShowNew(false)} style={{ padding: '9px 14px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 14, paddingTop: 60 }}>Loading...</div>
        ) : campaigns.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 14, paddingTop: 60 }}>No campaigns yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {campaigns.map(c => {
              const mc = marketColors[c.market] || { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.1)' }
              const total = parseInt(c.lead_count) || 0
              const contacted = parseInt(c.contacted_count) || 0
              const replied = parseInt(c.replied_count) || 0
              const rate = contacted > 0 ? Math.round((replied / contacted) * 100) : 0
              const hasTemplates = c.template_initial || c.template_followup
              const progress = total > 0 ? Math.min(100, (contacted / total) * 100) : 0

              return (
                <div key={c.id} style={{
                  background: '#111116',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12, padding: '20px 24px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: '#f0f0f2' }}>{c.name}</span>
                        <span style={{ fontSize: 11.5, padding: '2px 9px', borderRadius: 20, background: mc.bg, color: mc.color, border: `1px solid ${mc.border}`, fontWeight: 500 }}>
                          {marketLabel[c.market] || c.market}
                        </span>
                        {hasTemplates && (
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80', fontWeight: 500 }}>
                            ✓ Templates set
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setEditing(c)}
                      style={{
                        padding: '7px 16px', borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500,
                        cursor: 'pointer', flexShrink: 0,
                        fontFamily: "'DM Sans', sans-serif",
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#f0f0f2' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
                    >✉ Edit templates</button>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    {[
                      ['Total leads', total, '#f0f0f2'],
                      ['Contacted', contacted, '#60a5fa'],
                      ['Replied', replied, '#4ade80'],
                      ['Reply rate', `${rate}%`, rate > 0 ? '#4ade80' : 'rgba(255,255,255,0.2)'],
                    ].map(([label, val, color]) => (
                      <div key={label} style={{
                        flex: 1, padding: '12px 14px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: 10, textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: '#3b82f6', borderRadius: 2, transition: 'width 0.4s ease' }} />
                  </div>
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.25)', marginTop: 6, fontFamily: 'DM Mono, monospace' }}>
                    {contacted}/{total} leads contacted
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {editing && (
        <TemplateEditor
          campaign={editing}
          onSave={() => { fetchCampaigns(); setEditing(null) }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
