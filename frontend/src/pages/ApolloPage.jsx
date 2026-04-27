// v2
import React, { useState, useEffect } from 'react'
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

function StatCard({ label, value, sub }) {
  return (
    <div style={{
      background: '#111116',
      borderRadius: 12,
      padding: '20px 24px',
      border: '1px solid rgba(255,255,255,0.06)',
      flex: 1,
    }}>
      <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.25)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 700, color: '#f0f0f2', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [approving, setApproving] = useState(null)
  const [filter, setFilter] = useState('all')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.get('/dashboard')
      setData(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const approve = async (emailId, leadId) => {
    setApproving(emailId)
    try {
      await api.patch(`/emails/${emailId}`, { status: 'approved' })
      await api.post(`/send/${emailId}`, {}, { headers: { 'x-cron-secret': 'sp-cron-2026' } })
      await api.patch(`/leads/${leadId}`, { status: 'contacted', steps_done: 1 })
      fetchData()
      setSelected(null)
    } catch (e) {
      alert('Saatmine ebaõnnestus: ' + (e.response?.data?.error || e.message))
    } finally {
      setApproving(null)
    }
  }

  const discard = async (emailId) => {
    setApproving(emailId)
    try {
      await api.patch(`/emails/${emailId}`, { status: 'discarded' })
      fetchData()
      setSelected(null)
    } finally {
      setApproving(null)
    }
  }

  const updateBody = (emailId, body) => {
    setData(prev => ({
      ...prev,
      pending: prev.pending.map(e => e.email_id === emailId ? { ...e, body } : e)
    }))
  }

  const pending = data?.pending || []
  const filtered = filter === 'all' ? pending : pending.filter(e => e.type === filter)

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d10' }}>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.2)' }}>Loading dashboard...</div>
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0d0d10', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <header style={{
        padding: '0 28px', height: 60,
        background: '#0d0d10',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: '#f0f0f2', letterSpacing: -0.4, margin: 0 }}>Dashboard</h1>
        <button
          onClick={fetchData}
          style={{
            padding: '7px 16px', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >↻ Refresh</button>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        {/* Stats row */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
          <StatCard label="Leads Contacted" value={data?.stats?.leads_contacted ?? 0} sub="total across all campaigns" />
          <StatCard label="Reply Rate" value={`${data?.stats?.reply_rate ?? 0}%`} sub="of contacted leads" />
          <StatCard label="Emails Sent" value={data?.stats?.emails_sent ?? 0} sub="approved & sent" />
          <StatCard label="Total Responses" value={data?.stats?.total_responses ?? 0} sub="replied leads" />
        </div>

        {/* Pending queue */}
        <div style={{
          background: '#111116',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}>
          {/* Queue header */}
          <div style={{
            padding: '16px 22px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 14.5, fontWeight: 600, color: '#f0f0f2' }}>Ready to send</span>
              <span style={{
                fontSize: 12, padding: '2px 9px', borderRadius: 20, fontWeight: 600,
                background: pending.length > 0 ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.06)',
                color: pending.length > 0 ? '#60a5fa' : 'rgba(255,255,255,0.3)',
                border: pending.length > 0 ? '1px solid rgba(96,165,250,0.2)' : '1px solid rgba(255,255,255,0.08)',
              }}>{pending.length}</span>
            </div>
            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 3 }}>
              {[['all', 'All'], ['initial', 'Initial'], ['followup', 'Follow-up']].map(([val, lbl]) => (
                <button key={val} onClick={() => setFilter(val)} style={{
                  padding: '5px 14px', borderRadius: 6, border: 'none',
                  background: filter === val ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: filter === val ? '#f0f0f2' : 'rgba(255,255,255,0.4)',
                  fontSize: 12.5, fontWeight: filter === val ? 500 : 400,
                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                }}>{lbl}</button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '52px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>
              {pending.length === 0 ? 'No pending emails. Generate emails from Campaigns.' : 'No emails match this filter.'}
            </div>
          ) : (
            <div style={{ display: 'flex', overflow: 'hidden' }}>
              {/* List */}
              <div style={{ width: 340, borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', maxHeight: 560 }}>
                {filtered.map(e => {
                  const name = `${e.first_name || ''} ${e.last_name || ''}`.trim()
                  const isSelected = selected?.email_id === e.email_id
                  return (
                    <div
                      key={e.email_id}
                      onClick={() => setSelected(e)}
                      style={{
                        padding: '14px 18px',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(96,165,250,0.07)' : 'transparent',
                        borderLeft: isSelected ? '2px solid #60a5fa' : '2px solid transparent',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e2 => { if (!isSelected) e2.currentTarget.style.background = 'rgba(255,255,255,0.035)' }}
                      onMouseLeave={e2 => { if (!isSelected) e2.currentTarget.style.background = 'transparent' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <Avatar name={name} size={28} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 500, color: '#f0f0f2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{e.company_name}</div>
                        </div>
                        <span style={{
                          fontSize: 10.5, padding: '2px 7px', borderRadius: 5, fontWeight: 500, flexShrink: 0,
                          background: e.type === 'initial' ? 'rgba(251,146,60,0.15)' : 'rgba(74,222,128,0.1)',
                          color: e.type === 'initial' ? '#fb923c' : '#4ade80',
                          border: e.type === 'initial' ? '1px solid rgba(251,146,60,0.25)' : '1px solid rgba(74,222,128,0.2)',
                        }}>{e.type}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.25)', fontFamily: 'DM Mono, monospace' }}>{e.campaign_name}</div>
                    </div>
                  )
                })}
              </div>

              {/* Preview */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {selected ? (
                  <>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#f0f0f2', marginBottom: 4 }}>
                        To: {`${selected.first_name} ${selected.last_name}`} — {selected.company_name}
                      </div>
                      {selected.lead_email && (
                        <div style={{ fontSize: 12.5, color: '#60a5fa' }}>{selected.lead_email}</div>
                      )}
                      <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                        Subject: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{selected.subject}</span>
                      </div>
                    </div>

                    <div style={{ flex: 1, padding: '14px 20px', overflowY: 'auto' }}>
                      <textarea
                        value={selected.body}
                        onChange={e => {
                          const updated = { ...selected, body: e.target.value }
                          setSelected(updated)
                          updateBody(selected.email_id, e.target.value)
                        }}
                        style={{
                          width: '100%', height: '100%', minHeight: 280,
                          padding: '12px 14px',
                          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
                          fontSize: 13, lineHeight: 1.7,
                          resize: 'none', outline: 'none',
                          background: 'rgba(255,255,255,0.04)',
                          color: 'rgba(255,255,255,0.75)',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                        onFocus={e => e.target.style.borderColor = 'rgba(96,165,250,0.4)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                      />
                    </div>

                    <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10 }}>
                      <button
                        onClick={() => discard(selected.email_id)}
                        disabled={approving === selected.email_id}
                        style={{
                          padding: '9px 18px', borderRadius: 8,
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.05)',
                          color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >Skip</button>
                      <button
                        onClick={() => approve(selected.email_id, selected.lead_id)}
                        disabled={approving === selected.email_id}
                        style={{
                          flex: 1, padding: '9px 18px', borderRadius: 8,
                          border: 'none',
                          background: approving === selected.email_id ? '#2563eb' : '#3b82f6',
                          color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                          fontFamily: "'DM Sans', sans-serif",
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { if (!approving) e.currentTarget.style.background = '#2563eb' }}
                        onMouseLeave={e => { if (!approving) e.currentTarget.style.background = '#3b82f6' }}
                      >
                        {approving === selected.email_id ? 'Saadan...' : '✓ Saada email'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 14 }}>
                    Select an email to preview
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
