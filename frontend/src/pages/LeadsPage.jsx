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
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 2,
          background: done ? '#4ade80' : none ? 'rgba(255,255,255,0.2)' : '#60a5fa',
          transition: 'width 0.3s',
        }} />
      </div>
      <span style={{
        fontFamily: 'DM Mono, monospace', fontSize: 11,
        color: done ? '#4ade80' : none ? 'rgba(255,255,255,0.35)' : '#60a5fa',
        minWidth: 24,
      }}>
        {step}/{total}
      </span>
    </div>
  )
}

function CountryBadge({ country }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)',
      color: '#4ade80', fontSize: 11, fontWeight: 500, letterSpacing: 0.3,
    }}>
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

export default function LeadsPage() {
  const { status } = useParams()
  const [leads, setLeads] = useState([])
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchFocused, setSearchFocused] = useState(false)

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

  useEffect(() => { fetchLeads() }, [status, search])

  const fetchSelected = async (lead) => {
    if (selected?.id === lead.id) { setSelected(null); return }
    const res = await api.get(`/leads/${lead.id}`)
    setSelected(res.data)
  }

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100vh', background: '#0d0d10', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <header style={{
          padding: '0 28px', height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, gap: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: '#f0f0f2', letterSpacing: -0.4, margin: 0 }}>
              {statusTitles[status] || 'Leads'}
            </h1>
            <span style={{
              background: 'rgba(96,165,250,0.15)', color: '#60a5fa', borderRadius: 6,
              fontSize: 12, fontWeight: 600, padding: '2px 9px',
              border: '1px solid rgba(96,165,250,0.2)',
            }}>{leads.length}</span>
          </div>
          <div style={{ position: 'relative', maxWidth: 280, flex: 1 }}>
            <span style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.25)', fontSize: 13, pointerEvents: 'none',
            }}>⌕</span>
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
                  <tr>
                    <td colSpan={5} style={{ height: 1, background: 'rgba(255,255,255,0.06)', padding: 0 }} />
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: '60px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>
                      No leads found
                    </td></tr>
                  )}
                  {leads.map(lead => {
                    const name = `${lead.first_name || ''} ${lead.last_name || ''}`.trim()
                    const isSelected = selected?.id === lead.id
                    return (
                      <React.Fragment key={lead.id}>
                        <LeadRow
                          lead={{ ...lead, name }}
                          selected={isSelected}
                          onClick={() => fetchSelected(lead)}
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

          {/* Detail panel */}
          {selected && (
            <LeadDetail
              lead={selected}
              onClose={() => setSelected(null)}
              onUpdate={() => {
                fetchLeads()
                if (selected) {
                  api.get(`/leads/${selected.id}`).then(r => setSelected(r.data)).catch(() => {})
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function LeadRow({ lead, selected, onClick }) {
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
        </div>
      </td>
      <td style={{ padding: '12px 16px', fontSize: 13, color: 'rgba(255,255,255,0.6)', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {lead.company_name}
      </td>
      <td style={{ padding: '12px 16px', fontSize: 12, color: 'rgba(255,255,255,0.45)', fontFamily: 'DM Mono, monospace' }}>
        {lead.campaign_name || '—'}
      </td>
      <td style={{ padding: '12px 16px' }}>
        <CountryBadge country={lead.country || lead.market} />
      </td>
      <td style={{ padding: '12px 20px 12px 16px' }}>
        <StepBadge step={lead.steps_done || 0} total={lead.steps_total || 2} />
      </td>
    </tr>
  )
}
