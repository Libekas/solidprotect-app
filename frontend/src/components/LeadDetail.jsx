import React, { useState } from 'react'
import api from '../api'

const marketLabel = { NL: 'Netherlands', CA: 'Canada', FI: 'Finland' }

function Avatar({ name, market }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??'
  const colors = { NL: ['#E6F1FB', '#185FA5'], CA: ['#EAF3DE', '#3B6D11'], FI: ['#EEEDFE', '#534AB7'] }
  const [bg, fg] = colors[market] || ['#FAECE7', '#993C1D']
  return (
    <div style={{ width: 40, height: 40, borderRadius: '50%', background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

export default function LeadDetail({ lead, onClose, onUpdate }) {
  const [generating, setGenerating] = useState(false)
  const [emailDraft, setEmailDraft] = useState(null)
  const [emailType, setEmailType] = useState(null)

  if (!lead) return (
    <div style={{ width: 280, borderLeft: '0.5px solid #e8e6e0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 13, color: '#bbb', textAlign: 'center', padding: 24 }}>Vali lead detailide nägemiseks</div>
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
      const res = await api.post('/copilot/chat', {
        messages: [{ role: 'user', content: prompt }]
      })
      setEmailDraft(res.data.reply)
    } catch (err) {
      setEmailDraft('Viga meili genereerimisel: ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  const saveEmail = async (status) => {
    const lines = emailDraft.split('\n')
    const subjectLine = lines.find(l => l.startsWith('Subject:'))
    const subject = subjectLine ? subjectLine.replace('Subject:', '').trim() : 'Transparent fire protection for wood applications'
    await api.post(`/leads/${lead.id}/emails`, {
      type: emailType, subject, body: emailDraft, status
    })
    onUpdate()
    setEmailDraft(null)
  }

  return (
    <div style={{ width: 300, minWidth: 300, borderLeft: '0.5px solid #e8e6e0', background: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', borderBottom: '0.5px solid #e8e6e0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Avatar name={fullName} market={lead.market} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{fullName}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{lead.role}</div>
          </div>
        </div>
        <span onClick={onClose} style={{ cursor: 'pointer', color: '#bbb', fontSize: 18 }}>×</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #f0ede8' }}>
          <div style={{ fontSize: 10, color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Firma</div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{lead.company_name}</div>
          {lead.email && <div style={{ fontSize: 12, color: '#185FA5', marginTop: 4, background: '#E6F1FB', display: 'inline-block', padding: '2px 8px', borderRadius: 20 }}>{lead.email}</div>}
          {lead.linkedin_url && <div style={{ marginTop: 6 }}><a href={lead.linkedin_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#185FA5' }}>LinkedIn →</a></div>}
        </div>

        {lead.company_description && (
          <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #f0ede8' }}>
            <div style={{ fontSize: 10, color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Firma info</div>
            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>{lead.company_description}</div>
          </div>
        )}

        {lead.relevancy_score && (
          <div style={{ margin: '12px 16px', padding: '10px 12px', background: '#EAF3DE', borderRadius: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 500, color: '#3B6D11' }}>{lead.relevancy_score}%</div>
            <div style={{ fontSize: 11, color: '#639922' }}>relevancy match SPFR100</div>
            {lead.relevancy_text && <div style={{ fontSize: 12, color: '#555', marginTop: 6 }}>{lead.relevancy_text}</div>}
          </div>
        )}

        <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #f0ede8' }}>
          <div style={{ fontSize: 10, color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Seisund</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {lead.market && <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: '#E6F1FB', color: '#185FA5' }}>{marketLabel[lead.market] || lead.market}</span>}
            {lead.campaign_name && <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: '#f5f4f1', color: '#666' }}>{lead.campaign_name}</span>}
            <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: lead.status === 'replied' ? '#EAF3DE' : lead.status === 'contacted' ? '#E6F1FB' : '#FAECE7', color: lead.status === 'replied' ? '#3B6D11' : lead.status === 'contacted' ? '#185FA5' : '#D85A30' }}>{lead.status}</span>
          </div>
          <div style={{ fontSize: 12, color: '#aaa', marginTop: 8, fontFamily: 'DM Mono, monospace' }}>{lead.steps_done || 0}/{lead.steps_total || 2} sammu tehtud</div>
        </div>

        {emailDraft ? (
          <div style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 10, color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Genereeritud meil</div>
            <textarea
              value={emailDraft}
              onChange={e => setEmailDraft(e.target.value)}
              style={{ width: '100%', height: 200, padding: '8px', border: '0.5px solid #ddd', borderRadius: 8, fontSize: 12, lineHeight: 1.5, resize: 'vertical', outline: 'none', background: '#fafaf9' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={() => saveEmail('draft')} style={{ flex: 1, padding: '7px', border: '0.5px solid #ddd', borderRadius: 8, fontSize: 12, background: '#fff', color: '#666' }}>Salvesta</button>
              <button onClick={() => saveEmail('sent')} style={{ flex: 1, padding: '7px', background: '#D85A30', border: 'none', borderRadius: 8, fontSize: 12, color: '#fff', fontWeight: 500 }}>Märgi saadetud</button>
            </div>
            <div onClick={() => setEmailDraft(null)} style={{ fontSize: 12, color: '#aaa', textAlign: 'center', marginTop: 8, cursor: 'pointer' }}>Tühista</div>
          </div>
        ) : (
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => generateEmail('initial')} disabled={generating} style={{ padding: '8px 14px', background: '#D85A30', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
              {generating && emailType === 'initial' ? 'Genereerin...' : 'Genereeri esimene meil'}
            </button>
            <button onClick={() => generateEmail('followup')} disabled={generating} style={{ padding: '8px 14px', background: '#fff', color: '#666', border: '0.5px solid #ddd', borderRadius: 8, fontSize: 13 }}>
              {generating && emailType === 'followup' ? 'Genereerin...' : 'Genereeri follow-up'}
            </button>
            {lead.emails?.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 10, color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Saadetud meilid</div>
                {lead.emails.map(e => (
                  <div key={e.id} style={{ padding: '8px', background: '#f5f4f1', borderRadius: 8, marginBottom: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{e.type === 'initial' ? 'Esimene meil' : 'Follow-up'}</div>
                    <div style={{ fontSize: 11, color: '#aaa' }}>{e.status} · {e.sent_at ? new Date(e.sent_at).toLocaleDateString('et-EE') : 'mustand'}</div>
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
