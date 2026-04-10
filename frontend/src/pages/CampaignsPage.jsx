import React, { useState, useEffect } from 'react'
import api from '../api'

const marketLabel = { NL: 'Netherlands', CA: 'Canada', FI: 'Finland' }
const marketColors = {
  NL: { bg: '#E6F0FB', color: '#1A5FA5' },
  CA: { bg: '#E6F2E5', color: '#2D5A27' },
  FI: { bg: '#EEEDFE', color: '#534AB7' }
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
    setGenerating(true)
    setGenResult(null)
    try {
      const res = await api.post(`/campaigns/${campaign.id}/generate`, { type })
      setGenResult(res.data)
    } catch (err) {
      setGenResult({ error: err.response?.data?.error || err.message })
    } finally {
      setGenerating(false)
    }
  }

  const variables = ['{first_name}', '{last_name}', '{full_name}', '{company}', '{role}', '{market}']

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100,
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, width: 680, maxHeight: '88vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #ECEAE2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>{campaign.name}</div>
            <div style={{ fontSize: 12.5, color: '#aaa', marginTop: 2 }}>Email templates</div>
          </div>
          <div onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: '#F2F0EB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 17, color: '#888' }}>×</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {/* Variables */}
          <div style={{ marginBottom: 16, padding: '10px 14px', background: '#F5F4EF', borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8, fontWeight: 500 }}>Available variables</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {variables.map(v => (
                <span key={v} style={{
                  fontSize: 12, padding: '3px 9px', borderRadius: 6,
                  background: '#fff', border: '1px solid #E0DED6',
                  color: '#2D5A27', fontFamily: 'DM Mono, monospace', fontWeight: 500,
                  cursor: 'pointer',
                }}
                  onClick={() => {
                    const setter = tab === 'initial' ? setInitial : setFollowup
                    setter(prev => prev + v)
                  }}
                >{v}</span>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2, marginBottom: 14, background: '#F2F0EB', borderRadius: 10, padding: 3 }}>
            {['initial', 'followup'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: '8px', borderRadius: 8, border: 'none',
                background: tab === t ? '#fff' : 'transparent',
                color: tab === t ? '#1a1a1a' : '#888',
                fontSize: 13.5, fontWeight: tab === t ? 500 : 400,
                boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
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
              width: '100%', height: 280,
              padding: '12px 14px',
              border: '1px solid #E0DED6', borderRadius: 10,
              fontSize: 13, lineHeight: 1.7,
              resize: 'vertical', outline: 'none',
              background: '#FAFAF8', color: '#333',
              fontFamily: 'DM Sans, sans-serif',
            }}
          />

          {/* Generate result */}
          {genResult && (
            <div style={{
              marginTop: 12, padding: '12px 14px',
              background: genResult.error ? '#FEF0EB' : '#E6F2E5',
              borderRadius: 10,
            }}>
              {genResult.error
                ? <div style={{ fontSize: 13, color: '#C04A20' }}>Viga: {genResult.error}</div>
                : <div style={{ fontSize: 13, color: '#2D5A27', fontWeight: 500 }}>
                    ✓ Genereeritud {genResult.generated} emaili mustandina
                    <div style={{ fontSize: 12, color: '#4A8C42', fontWeight: 400, marginTop: 2 }}>
                      Mine Dashboardi et üle vaadata ja kinnitada
                    </div>
                  </div>
              }
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #ECEAE2', display: 'flex', gap: 10, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => generate('initial')}
              disabled={generating}
              style={{
                padding: '9px 16px', borderRadius: 9, border: '1.5px solid #B8D4B6',
                background: '#fff', color: '#2D5A27', fontSize: 13, fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {generating ? 'Generating...' : '⚡ Generate initial emails'}
            </button>
            <button
              onClick={() => generate('followup')}
              disabled={generating}
              style={{
                padding: '9px 16px', borderRadius: 9, border: '1.5px solid #B8D4B6',
                background: '#fff', color: '#2D5A27', fontSize: 13, fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {generating ? '...' : '⚡ Generate follow-ups'}
            </button>
          </div>
          <button
            onClick={save}
            disabled={saving}
            style={{
              padding: '9px 22px', borderRadius: 9, border: 'none',
              background: '#2D5A27', color: '#fff', fontSize: 13.5, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
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
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#F8F7F4' }}>
      {/* Header */}
      <div style={{
        padding: '16px 28px', background: '#fff',
        borderBottom: '1px solid #ECEAE2',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 16, fontWeight: 600 }}>Campaigns</span>
        <button
          onClick={() => setShowNew(!showNew)}
          style={{
            padding: '9px 18px', background: '#2D5A27', color: '#fff',
            border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 600,
          }}
        >+ New campaign</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {/* New campaign form */}
        {showNew && (
          <div style={{
            background: '#fff', border: '1px solid #ECEAE2', borderRadius: 14,
            padding: 20, marginBottom: 20,
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: '#1a1a1a' }}>New campaign</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                value={name} onChange={e => setName(e.target.value)}
                placeholder="Campaign name..."
                autoFocus
                onKeyDown={e => e.key === 'Enter' && create()}
                style={{
                  flex: 1, padding: '10px 14px',
                  border: '1px solid #E0DED6', borderRadius: 10,
                  fontSize: 14, outline: 'none', background: '#FAFAF8',
                }}
              />
              <select
                value={market} onChange={e => setMarket(e.target.value)}
                style={{
                  padding: '10px 14px', border: '1px solid #E0DED6',
                  borderRadius: 10, fontSize: 14, background: '#FAFAF8', outline: 'none',
                }}
              >
                <option value="CA">Canada</option>
                <option value="NL">Netherlands</option>
                <option value="FI">Finland</option>
              </select>
              <button
                onClick={create}
                style={{
                  padding: '10px 20px', background: '#2D5A27', color: '#fff',
                  border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
                }}
              >Create</button>
              <button
                onClick={() => setShowNew(false)}
                style={{
                  padding: '10px 14px', background: '#F2F0EB', color: '#888',
                  border: 'none', borderRadius: 10, fontSize: 14,
                }}
              >Cancel</button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', color: '#bbb', fontSize: 14, paddingTop: 60 }}>Loading...</div>
        ) : campaigns.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#bbb', fontSize: 14, paddingTop: 60 }}>No campaigns yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {campaigns.map(c => {
              const mc = marketColors[c.market] || { bg: '#F2F0EB', color: '#666' }
              const total = parseInt(c.lead_count) || 0
              const contacted = parseInt(c.contacted_count) || 0
              const replied = parseInt(c.replied_count) || 0
              const rate = contacted > 0 ? Math.round((replied / contacted) * 100) : 0
              const hasTemplates = c.template_initial || c.template_followup

              return (
                <div key={c.id} style={{
                  background: '#fff', border: '1px solid #ECEAE2',
                  borderRadius: 14, padding: '20px 24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>{c.name}</span>
                        <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: mc.bg, color: mc.color, fontWeight: 500 }}>
                          {marketLabel[c.market] || c.market}
                        </span>
                        {hasTemplates && (
                          <span style={{ fontSize: 11.5, padding: '2px 8px', borderRadius: 6, background: '#E6F2E5', color: '#2D5A27', fontWeight: 500 }}>
                            ✓ Templates set
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setEditing(c)}
                      style={{
                        padding: '8px 16px', borderRadius: 9,
                        border: '1.5px solid #B8D4B6',
                        background: '#fff', color: '#2D5A27',
                        fontSize: 13, fontWeight: 500, cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      ✉ Edit templates
                    </button>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                    {[
                      ['Total leads', total, '#555'],
                      ['Contacted', contacted, '#1A5FA5'],
                      ['Replied', replied, '#2D5A27'],
                      ['Reply rate', `${rate}%`, rate > 0 ? '#2D5A27' : '#bbb'],
                    ].map(([label, val, color]) => (
                      <div key={label} style={{
                        flex: 1, padding: '12px 14px',
                        background: '#F8F7F4', borderRadius: 10,
                        textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
                        <div style={{ fontSize: 11.5, color: '#aaa', marginTop: 4 }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginTop: 14, height: 5, background: '#F0EEE6', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, total > 0 ? (contacted / total) * 100 : 0)}%`, background: '#6AB04C', borderRadius: 3, transition: 'width 0.4s ease' }} />
                  </div>
                  <div style={{ fontSize: 11.5, color: '#aaa', marginTop: 5 }}>
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
