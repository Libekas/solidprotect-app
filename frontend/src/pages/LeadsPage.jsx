import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'
import LeadDetail from '../components/LeadDetail'

const marketTag = {
  NL: { bg: '#1A3A5C', color: '#6BAED6', label: 'Netherlands' },
  CA: { bg: '#1A3A1A', color: '#6FCF72', label: 'Canada' },
  FI: { bg: '#2D1A5C', color: '#A78BFA', label: 'Finland' }
}

const statusTitles = { new: 'New Leads', contacted: 'Contacted Leads', replied: 'Replied Leads' }
const statusColors = {
  new: { bg: '#2A1A0E', color: '#E8935A' },
  contacted: { bg: '#0E1A2A', color: '#6BAED6' },
  replied: { bg: '#0E1A0E', color: '#6FCF72' },
}

export default function LeadsPage() {
  const { status } = useParams()
  const [leads, setLeads] = useState([])
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

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
    const res = await api.get(`/leads/${lead.id}`)
    setSelected(res.data)
  }

  const sc = statusColors[status] || statusColors.new

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100vh', background: '#111A10' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{
          padding: '18px 32px',
          background: '#0F1A0E',
          borderBottom: '1px solid #1E2E1C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 18, fontWeight: 600, color: '#E8F0E7', letterSpacing: '-0.01em' }}>
              {statusTitles[status] || 'Leads'}
            </span>
            <span style={{
              fontSize: 12.5,
              color: sc.color,
              background: sc.bg,
              padding: '3px 10px',
              borderRadius: 20,
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}>
              {leads.length}
            </span>
          </div>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="#6A9A68" strokeWidth="1.3"/>
              <path d="M9.5 9.5L12 12" stroke="#6A9A68" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search leads..."
              style={{
                padding: '9px 16px 9px 34px',
                border: '1px solid #1E2E1C',
                borderRadius: 10,
                fontSize: 14,
                background: '#162115',
                outline: 'none',
                width: 240,
                color: '#C8D8C7',
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 80, textAlign: 'center', color: '#5A7A58', fontSize: 15 }}>Loading...</div>
          ) : leads.length === 0 ? (
            <div style={{ padding: 80, textAlign: 'center', color: '#5A7A58', fontSize: 15 }}>
              No leads yet. Import via Apollo.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0F1A0E', position: 'sticky', top: 0, zIndex: 1 }}>
                  {['Name', 'Company', 'Campaign', 'Role', 'Country', 'Step'].map(h => (
                    <th key={h} style={{
                      fontSize: 11,
                      color: '#6A9A68',
                      fontWeight: 600,
                      textAlign: 'left',
                      padding: '11px 22px',
                      borderBottom: '1px solid #1E2E1C',
                      letterSpacing: '0.09em',
                      textTransform: 'uppercase',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => {
                  const name = `${lead.first_name || ''} ${lead.last_name || ''}`.trim()
                  const tag = marketTag[lead.market]
                  const isSelected = selected?.id === lead.id
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => fetchSelected(lead)}
                      style={{
                        background: isSelected ? '#162115' : 'transparent',
                        cursor: 'pointer',
                        borderLeft: isSelected ? '3px solid #4CAF50' : '3px solid transparent',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#141F13' }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                    >
                      <td style={{ padding: '14px 22px', fontSize: 14.5, fontWeight: 600, borderBottom: '1px solid #162115', color: '#E8F4E7' }}>{name}</td>
                      <td style={{ padding: '14px 22px', fontSize: 14, color: '#A8C8A6', borderBottom: '1px solid #162115' }}>{lead.company_name}</td>
                      <td style={{ padding: '14px 22px', fontSize: 13.5, color: '#7A9A78', borderBottom: '1px solid #162115', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.campaign_name || '—'}</td>
                      <td style={{ padding: '14px 22px', fontSize: 14, color: '#A8C8A6', borderBottom: '1px solid #162115' }}>{lead.role}</td>
                      <td style={{ padding: '14px 22px', borderBottom: '1px solid #162115' }}>
                        {tag
                          ? <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: tag.bg, color: tag.color, fontWeight: 600 }}>{tag.label}</span>
                          : <span style={{ fontSize: 13.5, color: '#7A9A78' }}>{lead.country}</span>
                        }
                      </td>
                      <td style={{ padding: '14px 22px', borderBottom: '1px solid #162115' }}>
                        <span style={{
                          fontSize: 12.5,
                          fontFamily: 'DM Mono, monospace',
                          color: lead.steps_done > 0 ? '#6FCF72' : '#5A7A58',
                          background: lead.steps_done > 0 ? '#1A3A1A' : '#141F13',
                          padding: '3px 9px', borderRadius: 6, fontWeight: 600,
                          border: lead.steps_done > 0 ? '1px solid #2E5C30' : '1px solid #1E2E1C',
                        }}>
                          {lead.steps_done || 0}/{lead.steps_total || 2}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <LeadDetail
        lead={selected}
        onClose={() => setSelected(null)}
        onUpdate={() => { fetchLeads(); if (selected) fetchSelected(selected) }}
      />
    </div>
  )
}
