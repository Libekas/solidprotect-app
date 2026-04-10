import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'
import LeadDetail from '../components/LeadDetail'

const marketTag = {
  NL: { bg: '#E6F0FB', color: '#1A5FA5', label: 'Netherlands' },
  CA: { bg: '#E6F2E5', color: '#2D5A27', label: 'Canada' },
  FI: { bg: '#EEEDFE', color: '#534AB7', label: 'Finland' }
}

const statusTitles = { new: 'New Leads', contacted: 'Contacted Leads', replied: 'Replied Leads' }

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

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100vh', background: '#F8F7F4' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{
          padding: '16px 28px',
          background: '#fff',
          borderBottom: '1px solid #ECEAE2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>
              {statusTitles[status] || 'Leads'}
            </span>
            <span style={{
              fontSize: 12, color: '#2D5A27',
              background: '#E6F2E5',
              padding: '2px 9px', borderRadius: 20, fontWeight: 500
            }}>
              {leads.length}
            </span>
          </div>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="#aaa" strokeWidth="1.3"/>
              <path d="M9.5 9.5L12 12" stroke="#aaa" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search leads..."
              style={{
                padding: '8px 14px 8px 32px',
                border: '1px solid #E0DED6',
                borderRadius: 10,
                fontSize: 13.5,
                background: '#FAFAF8',
                outline: 'none',
                width: 220,
                color: '#333',
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: '#bbb', fontSize: 14 }}>Loading...</div>
          ) : leads.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: '#bbb', fontSize: 14 }}>
              No leads yet. Import via Apollo.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fff', position: 'sticky', top: 0, zIndex: 1 }}>
                  {['Name', 'Company', 'Campaign', 'Role', 'Country', 'Step'].map(h => (
                    <th key={h} style={{
                      fontSize: 11.5,
                      color: '#aaa',
                      fontWeight: 500,
                      textAlign: 'left',
                      padding: '10px 20px',
                      borderBottom: '1px solid #ECEAE2',
                      letterSpacing: '0.03em',
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
                        background: isSelected ? '#EDF4EC' : '#fff',
                        cursor: 'pointer',
                        borderLeft: isSelected ? '3px solid #2D5A27' : '3px solid transparent',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#F5F4EF' }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = '#fff' }}
                    >
                      <td style={{ padding: '13px 20px', fontSize: 14, fontWeight: 600, borderBottom: '1px solid #F2F0EB', color: '#1a1a1a' }}>{name}</td>
                      <td style={{ padding: '13px 20px', fontSize: 13.5, color: '#666', borderBottom: '1px solid #F2F0EB' }}>{lead.company_name}</td>
                      <td style={{ padding: '13px 20px', fontSize: 13, color: '#888', borderBottom: '1px solid #F2F0EB', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.campaign_name || '—'}</td>
                      <td style={{ padding: '13px 20px', fontSize: 13.5, color: '#666', borderBottom: '1px solid #F2F0EB' }}>{lead.role}</td>
                      <td style={{ padding: '13px 20px', borderBottom: '1px solid #F2F0EB' }}>
                        {tag
                          ? <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: tag.bg, color: tag.color, fontWeight: 500 }}>{tag.label}</span>
                          : <span style={{ fontSize: 13, color: '#888' }}>{lead.country}</span>
                        }
                      </td>
                      <td style={{ padding: '13px 20px', borderBottom: '1px solid #F2F0EB' }}>
                        <span style={{
                          fontSize: 12,
                          fontFamily: 'DM Mono, monospace',
                          color: lead.steps_done > 0 ? '#2D5A27' : '#bbb',
                          background: lead.steps_done > 0 ? '#E6F2E5' : '#F2F0EB',
                          padding: '2px 8px', borderRadius: 6, fontWeight: 500
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
