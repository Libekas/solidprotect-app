import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'
import LeadDetail from '../components/LeadDetail'

const marketTag = {
  NL: { bg: '#E6F1FB', color: '#185FA5', label: 'Netherlands' },
  CA: { bg: '#EAF3DE', color: '#3B6D11', label: 'Canada' },
  FI: { bg: '#EEEDFE', color: '#534AB7', label: 'Finland' }
}

const statusTitles = { new: 'New leads', contacted: 'Contacted leads', replied: 'Replied leads' }

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
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100vh' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '0.5px solid #e8e6e0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{statusTitles[status] || 'Leads'}</span>
            <span style={{ fontSize: 12, color: '#aaa' }}>({leads.length})</span>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Otsi lead'e..."
            style={{ padding: '6px 12px', border: '0.5px solid #ddd', borderRadius: 8, fontSize: 13, background: '#fafaf9', outline: 'none', width: 200 }}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#aaa', fontSize: 13 }}>Laen...</div>
          ) : leads.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#aaa', fontSize: 13 }}>Lead'e pole. Lisa uusi Apollo kaudu.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fff', position: 'sticky', top: 0, zIndex: 1 }}>
                  {['Nimi', 'Firma', 'Kampaania', 'Roll', 'Turg', 'Samm'].map(h => (
                    <th key={h} style={{ fontSize: 11, color: '#aaa', fontWeight: 500, textAlign: 'left', padding: '8px 16px', borderBottom: '0.5px solid #e8e6e0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => {
                  const name = `${lead.first_name || ''} ${lead.last_name || ''}`.trim()
                  const tag = marketTag[lead.market]
                  const isSelected = selected?.id === lead.id
                  return (
                    <tr key={lead.id} onClick={() => fetchSelected(lead)} style={{ background: isSelected ? '#FAECE7' : 'transparent', cursor: 'pointer' }}>
                      <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 500, borderBottom: '0.5px solid #f5f3f0' }}>{name}</td>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: '#888', borderBottom: '0.5px solid #f5f3f0' }}>{lead.company_name}</td>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: '#888', borderBottom: '0.5px solid #f5f3f0', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.campaign_name || '—'}</td>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: '#888', borderBottom: '0.5px solid #f5f3f0' }}>{lead.role}</td>
                      <td style={{ padding: '10px 16px', borderBottom: '0.5px solid #f5f3f0' }}>
                        {tag ? <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: tag.bg, color: tag.color }}>{tag.label}</span> : lead.country}
                      </td>
                      <td style={{ padding: '10px 16px', fontSize: 12, color: '#aaa', fontFamily: 'DM Mono, monospace', borderBottom: '0.5px solid #f5f3f0' }}>{lead.steps_done || 0}/{lead.steps_total || 2}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <LeadDetail lead={selected} onClose={() => setSelected(null)} onUpdate={() => { fetchLeads(); if (selected) fetchSelected(selected) }} />
    </div>
  )
}
