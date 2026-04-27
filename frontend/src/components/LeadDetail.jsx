import React, { useState } from 'react'
import api from '../api'

const AVATAR_COLORS = [
  ['#3b4a6b','#7b93d4'],['#4a3b6b','#9b7bd4'],['#3b6b4a','#7bd48c'],
  ['#6b4a3b','#d4937b'],['#3b6b6a','#7bd4d3'],['#6b5a3b','#d4b87b'],
]
function avatarColor(name) {
  let h = 0
  for (let c of (name || '?')) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}
function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
}

function Avatar({ name, size = 44 }) {
  const [bg, fg] = avatarColor(name || '?')
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg, color: fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.34, fontWeight: 600, letterSpacing: 0.5, flexShrink: 0,
    }}>
      {initials(name || '?')}
    </div>
  )
}

const labelStyle = {
  fontSize: 10, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.25)', marginBottom: 4,
}

export default function LeadDetail({ lead, onClose, onUpdate }) {
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)
  const [emailDraft, setEmailDraft] = useState(null)
  const [emailType, setEmailType] = useState(null)

  if (!lead) return null

  const fullName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim()

  const generateEmail = async (type) => {
    setGenerating(true)
    setEmailType(type)
    const marketLabel = { NL: 'Netherlands', CA: 'Canada', FI: 'Finland' }
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

  const saveEmail = async (send) => {
    const lines = emailDraft.split('\n')
    const subjectLine = lines.find(l => l.startsWith('Subject:'))
    const subject = subjectLine ? subjectLine.replace('Subject:', '').trim() : 'Transparent fire protection for wood applications'
    const res = await api.post(`/leads/${lead.id}/emails`, { type: emailType, subject, body: emailDraft, status: send ? 'approved' : 'draft' })
    if (send) {
      setSending(true)
      try {
        await api.post(`/send/${res.data.id}`, {}, { headers: { 'x-cron-secret': 'sp-cron-2026' } })
      } catch (err) {
        alert('Saatmine ebaõnnestus: ' + (err.response?.data?.error || err.message))
      } finally {
        setSending(false)
      }
    }
    onUpdate()
    setEmailDraft(null)
  }

  return (
    <aside style={{
      width: 320, flexShrink: 0,
      borderLeft: '1px solid rgba(255,255,255,0.06)',
      background: '#111116',
      padding: 24, overflowY: 'auto',
      animation: 'slideIn 0.18s ease',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(12px); } to { opacity:1; transform:translateX(0); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <Avatar name={fullName} size={44} />
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 18, padding: 2, lineHeight: 1 }}
        >✕</button>
      </div>

      <div style={{ fontSize: 17, fontWeight: 600, color: '#f0f0f2', marginBottom: 4 }}>{fullName}</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 20 }}>{lead.role}</div>

      {/* Fields */}
      {[
        ['Company', lead.company_name],
        ['Campaign', lead.campaign_name],
        ['Country', lead.country || lead.market],
        ['Email', lead.email],
      ].filter(([, v]) => v).map(([k, v]) => (
        <div key={k} style={{ marginBottom: 14 }}>
          <div style={labelStyle}>{k}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{v}</div>
        </div>
      ))}

      {/* Sequence progress */}
      <div style={{
        marginTop: 20, padding: 14, borderRadius: 10,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{ ...labelStyle, marginBottom: 10 }}>Sequence progress</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {Array.from({ length: lead.steps_total || 2 }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 6, borderRadius: 3,
              background: i < (lead.steps_done || 0) ? '#3b82f6'
                : i === (lead.steps_done || 0) ? 'rgba(59,130,246,0.3)'
                : 'rgba(255,255,255,0.08)',
            }} />
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          Step {lead.steps_done || 0} of {lead.steps_total || 2}
        </div>
      </div>

      {/* Sent emails */}
      {lead.emails?.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={labelStyle}>Sent emails</div>
          {lead.emails.map(e => (
            <div key={e.id} style={{
              padding: '10px 12px', background: 'rgba(255,255,255,0.04)',
              borderRadius: 8, marginBottom: 6,
              border: '1px solid rgba(255,255,255,0.07)',
              borderLeft: '2px solid #3b82f6',
            }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
                {e.type === 'initial' ? 'Initial email' : 'Follow-up'}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                {e.status} · {e.sent_at ? new Date(e.sent_at).toLocaleDateString('en-CA') : 'draft'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Email draft */}
      {emailDraft ? (
        <div style={{ marginTop: 20 }}>
          <div style={labelStyle}>Generated email</div>
          <textarea
            value={emailDraft}
            onChange={e => setEmailDraft(e.target.value)}
            style={{
              width: '100%', height: 200, padding: '10px 12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, fontSize: 12.5, lineHeight: 1.6,
              resize: 'vertical', outline: 'none',
              color: 'rgba(255,255,255,0.7)',
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              onClick={() => saveEmail(false)}
              style={{
                flex: 1, padding: '9px', borderRadius: 8,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}
            >Save draft</button>
            <button
              onClick={() => saveEmail(true)}
              disabled={sending}
              style={{
                flex: 1, padding: '9px', borderRadius: 8,
                background: sending ? '#2563eb' : '#3b82f6',
                border: 'none', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!sending) e.currentTarget.style.background = '#2563eb' }}
              onMouseLeave={e => { if (!sending) e.currentTarget.style.background = '#3b82f6' }}
            >{sending ? 'Saadan...' : 'Saada email ✓'}</button>
          </div>
          <div
            onClick={() => setEmailDraft(null)}
            style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 10, cursor: 'pointer' }}
          >Cancel</div>
        </div>
      ) : (
        /* Action buttons */
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={() => generateEmail('initial')}
            disabled={generating}
            style={{
              padding: '9px 16px', borderRadius: 8,
              background: generating && emailType === 'initial' ? '#2563eb' : '#3b82f6',
              border: 'none', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!generating) e.currentTarget.style.background = '#2563eb' }}
            onMouseLeave={e => { if (!generating) e.currentTarget.style.background = '#3b82f6' }}
          >
            {generating && emailType === 'initial' ? 'Generating...' : '✉ Generate initial email'}
          </button>
          <button
            onClick={() => generateEmail('followup')}
            disabled={generating}
            style={{
              padding: '9px 16px', borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >
            {generating && emailType === 'followup' ? 'Generating...' : '↩ Generate follow-up'}
          </button>
        </div>
      )}
    </aside>
  )
}
