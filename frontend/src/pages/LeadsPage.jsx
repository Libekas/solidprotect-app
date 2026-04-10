import React, { useState, useEffect } from 'react'
import api from '../api'

const marketColors = {
  NL: { bg: '#E6F0FB', color: '#1A5FA5', label: 'Netherlands' },
  CA: { bg: '#E6F2E5', color: '#2D5A27', label: 'Canada' },
  FI: { bg: '#EEEDFE', color: '#534AB7', label: 'Finland' },
}

function StatCard({ label, value, sub, icon }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '20px 22px',
      border: '1px solid #ECEAE2',
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      flex: 1,
    }}>
      <div style={{ fontSize: 12, color: '#aaa', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#1a1a1a', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12.5, color: '#aaa', marginTop: 6 }}>{sub}</div>}
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
      await api.patch(`/emails/${emailId}`, { status: 'sent' })
      await api.patch(`/leads/${leadId}`, { status: 'contacted', steps_done: 1 })
      fetchData()
      setSelected(null)
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
  const campaigns = [...new Set(pending.map(e => e.campaign_name))].filter(Boolean)

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F7F4' }}>
      <div style={{ fontSize: 14, color: '#bbb' }}>Loading dashboard...</div>
    </div>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#F8F7F4' }}>
      {/* Header */}
      <div style={{
        padding: '16px 28px', background: '#fff',
        borderBottom: '1px solid #ECEAE2',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 16, fontWeight: 600 }}>Dashboard</span>
        <button
          onClick={fetchData}
          style={{
            padding: '7px 14px', borderRadius: 9,
            border: '1px solid #E0DED6', background: '#fff',
            color: '#555', fontSize: 13, cursor: 'pointer',
          }}
        >↻ Refresh</button>
      </div>

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
          background: '#fff', borderRadius: 14,
          border: '1px solid #ECEAE2',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}>
          <div style={{
            padding: '16px 22px', borderBottom: '1px solid #ECEAE2',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 14.5, fontWeight: 600 }}>Ready to send</span>
              <span style={{
                fontSize: 12, padding: '2px 9px', borderRadius: 20,
                background: pending.length > 0 ? '#FEF0EB' : '#F2F0EB',
                color: pending.length > 0 ? '#C04A20' : '#aaa',
                fontWeight: 500,
              }}>{pending.length}</span>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 2, background: '#F2F0EB', borderRadius: 9, padding: 3 }}>
              {[['all', 'All'], ['initial', 'Initial'], ['followup', 'Follow-up']].map(([val, lbl]) => (
                <button key={val} onClick={() => setFilter(val)} style={{
                  padding: '6px 14px', borderRadius: 7, border: 'none',
                  background: filter === val ? '#fff' : 'transparent',
                  color: filter === val ? '#1a1a1a' : '#888',
                  fontSize: 12.5, fontWeight: filter === val ? 500 : 400,
                  cursor: 'pointer',
                  boxShadow: filter === val ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}>{lbl}</button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#bbb', fontSize: 14 }}>
              {pending.length === 0
                ? 'No pending emails. Generate emails from Campaigns.'
                : 'No emails match this filter.'}
            </div>
          ) : (
            <div style={{ display: 'flex', overflow: 'hidden' }}>
              {/* List */}
              <div style={{ width: 360, borderRight: '1px solid #ECEAE2', overflowY: 'auto', maxHeight: 560 }}>
                {filtered.map(e => {
                  const name = `${e.first_name || ''} ${e.last_name || ''}`.trim()
                  const mc = marketColors[e.market]
                  const isSelected = selected?.email_id === e.email_id
                  return (
                    <div
                      key={e.email_id}
                      onClick={() => setSelected(e)}
                      style={{
                        padding: '14px 18px',
                        borderBottom: '1px solid #F2F0EB',
                        cursor: 'pointer',
                        background: isSelected ? '#EDF4EC' : '#fff',
                        borderLeft: isSelected ? '3px solid #2D5A27' : '3px solid transparent',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e2 => { if (!isSelected) e2.currentTarget.style.background = '#F8F7F4' }}
                      onMouseLeave={e2 => { if (!isSelected) e2.currentTarget.style.background = '#fff' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1a1a1a' }}>{name}</div>
                        <span style={{
                          fontSize: 11, padding: '2px 7px', borderRadius: 5,
                          background: e.type === 'initial' ? '#FEF0EB' : '#E6F2E5',
                          color: e.type === 'initial' ? '#C04A20' : '#2D5A27',
                          fontWeight: 500, flexShrink: 0,
                        }}>{e.type}</span>
                      </div>
                      <div style={{ fontSize: 12.5, color: '#888', marginTop: 2 }}>{e.company_name}</div>
                      <div style={{ fontSize: 12, color: '#aaa', marginTop: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
                        {mc && <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 20, background: mc.bg, color: mc.color }}>{mc.label}</span>}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{e.campaign_name}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Preview */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {selected ? (
                  <>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid #F2F0EB' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 2 }}>
                        To: {`${selected.first_name} ${selected.last_name}`} — {selected.company_name}
                      </div>
                      {selected.lead_email && (
                        <div style={{ fontSize: 12.5, color: '#1A5FA5' }}>{selected.lead_email}</div>
                      )}
                      <div style={{ fontSize: 12.5, color: '#888', marginTop: 4 }}>
                        Subject: <strong>{selected.subject}</strong>
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
                          width: '100%', height: '100%', minHeight: 300,
                          padding: '12px 14px',
                          border: '1px solid #E0DED6', borderRadius: 10,
                          fontSize: 13, lineHeight: 1.7,
                          resize: 'none', outline: 'none',
                          background: '#FAFAF8', color: '#333',
                          fontFamily: 'DM Sans, sans-serif',
                        }}
                      />
                    </div>

                    <div style={{ padding: '14px 20px', borderTop: '1px solid #ECEAE2', display: 'flex', gap: 10 }}>
                      <button
                        onClick={() => discard(selected.email_id)}
                        disabled={approving === selected.email_id}
                        style={{
                          padding: '10px 18px', borderRadius: 9,
                          border: '1px solid #E0DED6', background: '#fff',
                          color: '#888', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                        }}
                      >Skip</button>
                      <button
                        onClick={() => approve(selected.email_id, selected.lead_id)}
                        disabled={approving === selected.email_id}
                        style={{
                          flex: 1, padding: '10px 18px', borderRadius: 9,
                          border: 'none', background: '#2D5A27',
                          color: '#fff', fontSize: 13.5, fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {approving === selected.email_id ? 'Saving...' : '✓ Approve & mark sent'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 14 }}>
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
