import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'
import LeadDetail from '../components/LeadDetail'

const statusTitles = { new: 'New Leads', contacted: 'Contacted Leads', replied: 'Replied Leads' }

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

function Avatar({ name, size = 32 }) {
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

function StepBadge({ step, total }) {
  const pct = total === 0 ? 0 : (step / total) * 100
  const done = step === total && total > 0
  const none = step === 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: done ? '#4ade80' : none ? 'rgba(255,255,255,0.2)' : '#60a5fa', transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: done ? '#4ade80' : none ? 'rgba(255,255,255,0.35)' : '#60a5fa', minWidth: 24 }}>
        {step}/{total}
      </span>
    </div>
  )
}

function CountryBadge({ country }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80', fontSize: 11, fontWeight: 500 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
      {country}
    </span>
  )
}

const thStyle = {
  padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600,
  letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
  background: '#0d0d10',
}

const labelStyle = {
  fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
}

// ── Conversation View ────────────────────────────────────────────────────────
function ConversationView({ lead, onClose, onUpdate }) {
  const [expandedEmail, setExpandedEmail] = useState(null)
  const fullName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim()
  const emails = lead.emails || []

  useEffect(() => {
    // Auto-expand last email
    if (emails.length > 0) setExpandedEmail(emails[emails.length - 1].id)
  }, [lead.id])

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  const statusColor = (status) => {
    if (status === 'sent') return { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.2)' }
    if (status === 'draft') return { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)' }
    return { color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' }
  }

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100vh', background: '#0d0d10', fontFamily: "'DM Sans', sans-serif", animation: 'fadeIn 0.15s ease' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>

      {/* Header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60, display: 'flex', alignItems: 'center', padding: '0 28px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0d0d10', zIndex: 10, gap: 16 }}>
        <button
          onClick={onClose}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >← Back</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={fullName} size={28} />
          <span style={{ fontSize: 15, fontWeight: 600, color: '#f0f0f2' }}>{fullName}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{lead.company_name}</span>
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', flex: 1, paddingTop: 60, overflow: 'hidden' }}>

        {/* Email thread — center */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px', maxWidth: 760 }}>
          {emails.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 14, paddingTop: 80 }}>No emails yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {emails.map((email, i) => {
                const isExpanded = expandedEmail === email.id
                const sc = statusColor(email.status)
                const typeLabel = email.type === 'initial' ? 'Initial Email' : email.type === 'followup' ? 'Follow-up Email' : email.type
                const lines = (email.body || '').split('\n')
                const subjectLine = lines.find(l => l.toLowerCase().startsWith('subject:'))
                const subject = subjectLine ? subjectLine.replace(/^subject:\s*/i, '') : email.subject || '(no subject)'
                const bodyText = lines.filter(l => !l.toLowerCase().startsWith('subject:')).join('\n').trim()
                const preview = bodyText.slice(0, 120) + (bodyText.length > 120 ? '...' : '')

                return (
                  <div key={email.id} style={{ background: '#111116', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
                    {/* Email header */}
                    <div
                      onClick={() => setExpandedEmail(isExpanded ? null : email.id)}
                      style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 14, transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                        ✉
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f2' }}>{typeLabel}</span>
                          <span style={{ fontSize: 10.5, padding: '2px 7px', borderRadius: 20, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontWeight: 500 }}>{email.status}</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>{subject}</div>
                        {!isExpanded && (
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{preview}</div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', fontFamily: 'DM Mono, monospace' }}>
                          {email.sent_at ? formatDate(email.sent_at) : email.status === 'draft' ? 'Draft' : ''}
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>{isExpanded ? '▲' : '▼'}</div>
                      </div>
                    </div>

                    {/* Email body */}
                    {isExpanded && (
                      <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ paddingTop: 16, fontSize: 13.5, lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', whiteSpace: 'pre-wrap', fontFamily: "'DM Sans', sans-serif" }}>
                          {bodyText}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right panel — lead info */}
        <div style={{ width: 300, flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', padding: 24, background: '#111116' }}>
          {/* Avatar + name */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24, textAlign: 'center' }}>
            <Avatar name={fullName} size={56} />
            <div style={{ fontSize: 16, fontWeight: 600, color: '#f0f0f2', marginTop: 12 }}>{fullName}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>{lead.role}</div>
          </div>

          {/* Company */}
          <div style={{ marginBottom: 20, padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#f0f0f2', marginBottom: 6 }}>{lead.company_name}</div>
            {lead.email && (
              <div style={{ fontSize: 12.5, color: '#60a5fa', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>✉</span> {lead.email}
              </div>
            )}
            {lead.linkedin_url && (
              <a href={lead.linkedin_url} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                <span>in</span> LinkedIn →
              </a>
            )}
          </div>

          {/* Fields */}
          {[
            ['Campaign', lead.campaign_name],
            ['Country', lead.country || lead.market],
            ['Status', lead.status],
          ].filter(([,v]) => v).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 14 }}>
              <div style={{ ...labelStyle, marginBottom: 4 }}>{k}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{v}</div>
            </div>
          ))}

          {/* Company description */}
          {lead.company_description && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ ...labelStyle, marginBottom: 6 }}>About</div>
              <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{lead.company_description}</div>
            </div>
          )}

          {/* Sequence progress */}
          <div style={{ marginTop: 20, padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ ...labelStyle, marginBottom: 10, display: 'block' }}>Sequence progress</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {Array.from({ length: lead.steps_total || 2 }).map((_, i) => (
                <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < (lead.steps_done || 0) ? '#3b82f6' : i === (lead.steps_done || 0) ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)' }} />
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
              Step {lead.steps_done || 0} of {lead.steps_total || 2}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main LeadsPage ────────────────────────────────────────────────────────────
export default function LeadsPage() {
  const { status } = useParams()
  const [leads, setLeads] = useState([])
  const [selected, setSelected] = useState(null)
  const [conversation, setConversation] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchFocused, setSearchFocused] = useState(false)

  const isConversationStatus = status === 'contacted' || status === 'replied'

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const res = await api.get('/leads', { params: { status: status || 'new', search: search || undefined } })
      setLeads(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
    setSelected(null)
    setConversation(null)
  }, [status, search])

  const handleRowClick = async (lead) => {
    if (isConversationStatus) {
      const res = await api.get(`/leads/${lead.id}`)
      setConversation(res.data)
    } else {
      if (selected?.id === lead.id) { setSelected(null); return }
      const res = await api.get(`/leads/${lead.id}`)
      setSelected(res.data)
    }
  }

  // Show conversation view
  if (conversation) {
    return (
      <ConversationView
        lead={conversation}
        onClose={() => setConversation(null)}
        onUpdate={async () => {
          const res = await api.get(`/leads/${conversation.id}`)
          setConversation(res.data)
          fetchLeads()
        }}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100vh', background: '#0d0d10', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <header style={{ padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: '#f0f0f2', letterSpacing: -0.4, margin: 0 }}>
              {statusTitles[status] || 'Leads'}
            </h1>
            <span style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa', borderRadius: 6, fontSize: 12, fontWeight: 600, padding: '2px 9px', border: '1px solid rgba(96,165,250,0.2)' }}>{leads.length}</span>
          </div>
          <div style={{ position: 'relative', maxWidth: 280, flex: 1 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', fontSize: 13, pointerEvents: 'none' }}>⌕</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search leads…"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: '100%', padding: '8px 14px 8px 34px', borderRadius: 9,
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${searchFocused ? 'rgba(96,165,250,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: '#e8e8ea', fontSize: 13, outline: 'none',
                transition: 'border-color 0.15s', fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </div>
        </header>

        {/* Table */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 80, textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>Loading...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '26%' }} />
                  <col style={{ width: '24%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '14%' }} />
                  <col style={{ width: '16%' }} />
                </colgroup>
                <thead>
                  <tr style={{ position: 'sticky', top: 0, zIndex: 10, background: '#0d0d10' }}>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Company</th>
                    <th style={thStyle}>Campaign</th>
                    <th style={thStyle}>Country</th>
                    <th style={thStyle}>Step</th>
                  </tr>
                  <tr><td colSpan={5} style={{ height: 1, background: 'rgba(255,255,255,0.06)', padding: 0 }} /></tr>
                </thead>
                <tbody>
                  {leads.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: '60px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>No leads found</td></tr>
                  )}
                  {leads.map(lead => {
                    const name = `${lead.first_name || ''} ${lead.last_name || ''}`.trim()
                    const isSelected = selected?.id === lead.id
                    return (
                      <React.Fragment key={lead.id}>
                        <LeadRow
                          lead={{ ...lead, name }}
                          selected={isSelected}
                          isConversation={isConversationStatus}
                          onClick={() => handleRowClick(lead)}
                        />
                        <tr style={{ height: 1 }}>
                          <td colSpan={5} style={{ background: 'rgba(255,255,255,0.04)', padding: 0 }} />
                        </tr>
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Detail panel for new leads */}
          {selected && !isConversationStatus && (
            <LeadDetail
              lead={selected}
              onClose={() => setSelected(null)}
              onUpdate={() => {
                fetchLeads()
                if (selected) api.get(`/leads/${selected.id}`).then(r => setSelected(r.data)).catch(() => {})
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function LeadRow({ lead, selected, onClick, isConversation }) {
  const [hovered, setHovered] = useState(false)
  return (
    <tr
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer', transition: 'background 0.12s',
        background: selected ? 'rgba(96,165,250,0.07)' : hovered ? 'rgba(255,255,255,0.035)' : 'transparent',
        borderLeft: selected ? '2px solid #60a5fa' : '2px solid transparent',
      }}
    >
      <td style={{ padding: '12px 20px 12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={lead.name} />
          <div>
            <div style={{ fontWeight: 500, fontSize: 13.5, color: '#f0f0f2', letterSpacing: -0.1 }}>{lead.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{lead.role}</div>
          </div>
          {isConversation && (
            <span style={{ marginLeft: 4, fontSize: 11, color: 'rgba(255,255,255,0.2)', opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }}>→</span>
          )}
        </div>
      </td>
      <td style={{ padding: '12px 16px', fontSize: 13, color: 'rgba(255,255,255,0.6)', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.company_name}</td>
      <td style={{ padding: '12px 16px', fontSize: 12, color: 'rgba(255,255,255,0.45)', fontFamily: 'DM Mono, monospace' }}>{lead.campaign_name || '—'}</td>
      <td style={{ padding: '12px 16px' }}><CountryBadge country={lead.country || lead.market} /></td>
      <td style={{ padding: '12px 20px 12px 16px' }}><StepBadge step={lead.steps_done || 0} total={lead.steps_total || 2} /></td>
    </tr>
  )
}
