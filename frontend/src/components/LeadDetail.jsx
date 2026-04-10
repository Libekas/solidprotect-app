import React, { useState } from 'react'
import api from '../api'

const marketLabel = { NL: 'Netherlands', CA: 'Canada', FI: 'Finland' }

function Avatar({ name, size = 44 }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#2D5A27', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32, fontWeight: 600, flexShrink: 0,
      letterSpacing: '0.03em',
    }}>
      {initials}
    </div>
  )
}

function CompanyAvatar({ name, size = 36 }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'
  return (
    <div style={{
      width: size, height: size, borderRadius: 10,
      background: '#E6F2E5', color: '#2D5A27',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.33, fontWeight: 600, flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

export default function LeadDetail({ lead, onClose, onUpdate }) {
  const [generating, setGenerating] = useState(false)
  const [emailDraft, setEmailDraft] = useState(null)
  const [emailType, setEmailType] = useState(null)

  if (!lead) return (
    <div style={{
      width: 320, borderLeft: '1px solid #ECEAE2',
      background: '#FAFAF8',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ fontSize: 14, color: '#ccc', textAlign: 'center', padding: 32 }}>
        Select a lead to view details
      </div>
    </div>
  )

  const fullName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim()

  const generateEmail = async (type) => {
    setGenerating(true)
    setEmailType(type)
    const market = marketLabel[lead.market] || lead.market || 'Netherlands'
    const prompt = type === 'initial'
      ? `Genereeri esimene meil ${fullName}'ile, firma ${lead.company_name}, turg ${market}`
      : `Genereeri follow-up meil ${fullName}'ile, firma ${lead.company_name}`
    try {
      const res = await api.post('/copilot/chat', { messages: [{ role: 'user', content: prompt }] })
      setEmailDraft(res.data.reply)
    } catch (err) {
      setEmailDraft('Viga: ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  const saveEmail = async (status) => {
    const lines = emailDraft.split('\n')
    const subjectLine = lines.find(l => l.startsWith('Subject:'))
    const subject = subjectLine ? subjectLine.replace('Subject:', '').trim() : 'Transparent fire protection for wood applications'
    await api.post(`/leads/${lead.id}/emails`, { type: emailType, subject, body: emailDraft, status })
    onUpdate()
    setEmailDraft(null)
  }

  const statusColor = {
    new: { bg: '#FEF0EB', color: '#C04A20' },
    contacted: { bg: '#E6F0FB', color: '#1A5FA5' },
    replied: { bg: '#E6F2E5', color: '#2D5A27' },
  }[lead.status] || { bg: '#F2F0EB', color: '#888' }

  return (
    <div style={{
      width: 340, minWidth: 340,
      borderLeft: '1px solid #ECEAE2',
      background: '#fff',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: '-2px 0 12px rgba(0,0,0,0.04)',
    }}>

      {/* Header */}
      <div style={{
        padding: '18px 20px 16px',
        borderBottom: '1px solid #ECEAE2',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Avatar name={fullName} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.3 }}>{fullName}</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{lead.role}</div>
          </div>
        </div>
        <div
          onClick={onClose}
          style={{
            width: 28, height: 28, borderRadius: 8,
            background: '#F2F0EB', color: '#888',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 16, lineHeight: 1,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#E8E5DC'}
          onMouseLeave={e => e.currentTarget.style.background = '#F2F0EB'}
        >×</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* Company block */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F2F0EB' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
            <CompanyAvatar name={lead.company_name} />
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{lead.company_name}</div>
          </div>
          {lead.email && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 12.5, color: '#1A5FA5',
              background: '#EEF5FD', padding: '4px 10px',
              borderRadius: 20, marginBottom: 6,
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="2.5" width="10" height="7" rx="1.5" stroke="#1A5FA5" strokeWidth="1.1"/>
                <path d="M1 4l5 3.5L11 4" stroke="#1A5FA5" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
              {lead.email}
            </div>
          )}
          {lead.linkedin_url && (
            <div>
              <a href={lead.linkedin_url} target="_blank" rel="noreferrer" style={{
                fontSize: 12.5, color: '#2D5A27', display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="1" y="1" width="10" height="10" rx="2" stroke="#2D5A27" strokeWidth="1.1"/>
                  <path d="M3.5 5v3.5M3.5 3.5v.01M5.5 8.5V6a1 1 0 012 0v2.5M5.5 6.5h2" stroke="#2D5A27" strokeWidth="1.1" strokeLinecap="round"/>
                </svg>
                LinkedIn →
              </a>
            </div>
          )}
        </div>

        {/* Tags */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F2F0EB', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {lead.market && (
            <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: '#E6F2E5', color: '#2D5A27', fontWeight: 500 }}>
              {marketLabel[lead.market] || lead.market}
            </span>
          )}
          <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: statusColor.bg, color: statusColor.color, fontWeight: 500 }}>
            {lead.status}
          </span>
          {lead.campaign_name && (
            <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: '#F2F0EB', color: '#666' }}>
              {lead.campaign_name}
            </span>
          )}
          <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: '#F2F0EB', color: '#888', fontFamily: 'DM Mono, monospace' }}>
            {lead.steps_done || 0}/{lead.steps_total || 2} steps
          </span>
        </div>

        {/* Company description */}
        {lead.company_description && (
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F2F0EB' }}>
            <div style={{ fontSize: 11, color: '#aaa', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 500 }}>About</div>
            <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{lead.company_description}</div>
          </div>
        )}

        {/* Relevancy */}
        {lead.relevancy_score && (
          <div style={{ margin: '14px 20px', padding: '12px 14px', background: '#E6F2E5', borderRadius: 12 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#2D5A27', lineHeight: 1 }}>{lead.relevancy_score}%</div>
            <div style={{ fontSize: 11.5, color: '#4A8C42', marginTop: 2 }}>relevancy match · SPFR100</div>
            {lead.relevancy_text && <div style={{ fontSize: 12.5, color: '#3a6a34', marginTop: 8, lineHeight: 1.5 }}>{lead.relevancy_text}</div>}
          </div>
        )}

        {/* Email section */}
        {emailDraft ? (
          <div style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: '#aaa', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 500 }}>Generated email</div>
            <textarea
              value={emailDraft}
              onChange={e => setEmailDraft(e.target.value)}
              style={{
                width: '100%', height: 220,
                padding: '10px 12px',
                border: '1px solid #E0DED6', borderRadius: 10,
                fontSize: 12.5, lineHeight: 1.6,
                resize: 'vertical', outline: 'none',
                background: '#FAFAF8', color: '#333',
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button
                onClick={() => saveEmail('draft')}
                style={{
                  flex: 1, padding: '9px',
                  border: '1px solid #E0DED6', borderRadius: 9,
                  fontSize: 13, background: '#fff', color: '#555', fontWeight: 500,
                }}
              >Save draft</button>
              <button
                onClick={() => saveEmail('sent')}
                style={{
                  flex: 1, padding: '9px',
                  background: '#2D5A27', border: 'none', borderRadius: 9,
                  fontSize: 13, color: '#fff', fontWeight: 600,
                }}
              >Mark sent ✓</button>
            </div>
            <div
              onClick={() => setEmailDraft(null)}
              style={{ fontSize: 12.5, color: '#bbb', textAlign: 'center', marginTop: 10, cursor: 'pointer' }}
            >Cancel</div>
          </div>
        ) : (
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => generateEmail('initial')}
              disabled={generating}
              style={{
                padding: '11px 16px',
                background: generating && emailType === 'initial' ? '#4A8C42' : '#2D5A27',
                color: '#fff', border: 'none', borderRadius: 10,
                fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {generating && emailType === 'initial' ? 'Generating...' : '✉ Generate initial email'}
            </button>
            <button
              onClick={() => generateEmail('followup')}
              disabled={generating}
              style={{
                padding: '11px 16px',
                background: '#fff', color: '#2D5A27',
                border: '1.5px solid #B8D4B6', borderRadius: 10,
                fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {generating && emailType === 'followup' ? 'Generating...' : '↩ Generate follow-up'}
            </button>

            {lead.emails?.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 11, color: '#aaa', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 500 }}>Sent emails</div>
                {lead.emails.map(e => (
                  <div key={e.id} style={{
                    padding: '10px 12px', background: '#F5F4EF',
                    borderRadius: 10, marginBottom: 6,
                    borderLeft: '3px solid #6AB04C',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#333' }}>{e.type === 'initial' ? 'Initial email' : 'Follow-up'}</div>
                    <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                      {e.status} · {e.sent_at ? new Date(e.sent_at).toLocaleDateString('en-CA') : 'draft'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
