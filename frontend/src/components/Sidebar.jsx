import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const s = {
  sidebar: { width: 200, minWidth: 200, background: '#fff', borderRight: '0.5px solid #e8e6e0', display: 'flex', flexDirection: 'column', padding: '16px 0', height: '100vh', position: 'fixed', left: 0, top: 0 },
  logo: { padding: '0 16px 20px', fontSize: 13, fontWeight: 500, letterSpacing: '0.05em', borderBottom: '0.5px solid #e8e6e0', marginBottom: 12 },
  talkBtn: { margin: '0 12px 16px', padding: '8px 12px', background: '#D85A30', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 500, textAlign: 'left', width: 'calc(100% - 24px)' },
  navLabel: { fontSize: 10, color: '#aaa', padding: '0 16px 6px', letterSpacing: '0.08em', textTransform: 'uppercase' },
  divider: { height: '0.5px', background: '#e8e6e0', margin: '10px 0' },
  chatSection: { padding: '8px 16px 4px', flex: 1, overflow: 'hidden' },
  chatLabel: { fontSize: 10, color: '#aaa', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 },
  chatItem: { padding: '5px 0', fontSize: 12, color: '#888', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
}

export default function Sidebar({ counts, onCopilotOpen }) {
  const navigate = useNavigate()
  const loc = useLocation()

  const navItem = (path, label, count, dot) => {
    const active = loc.pathname === path
    return (
      <div onClick={() => navigate(path)} style={{ padding: '7px 16px', fontSize: 13, color: active ? '#D85A30' : '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, borderLeft: active ? '2px solid #D85A30' : '2px solid transparent', background: active ? '#FAECE7' : 'transparent' }}>
        {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'inline-block' }}></span>}
        {label}
        {count !== undefined && <span style={{ marginLeft: 'auto', fontSize: 11, color: active ? '#D85A30' : '#aaa', background: active ? '#f5d5c8' : '#f0ede8', padding: '1px 6px', borderRadius: 20 }}>{count}</span>}
      </div>
    )
  }

  return (
    <div style={s.sidebar}>
      <div style={s.logo}>SOLID<span style={{ color: '#D85A30' }}>PROTECT</span></div>
      <button style={s.talkBtn} onClick={onCopilotOpen}>+ Talk with copilot</button>
      <div style={s.navLabel}>Pipeline</div>
      {navItem('/leads/new', 'New leads', counts?.new, '#D85A30')}
      {navItem('/leads/contacted', 'Contacted', counts?.contacted, '#378ADD')}
      {navItem('/leads/replied', 'Replied', counts?.replied, '#639922')}
      <div style={s.divider} />
      {navItem('/campaigns', 'Campaigns')}
      {navItem('/apollo', 'Find leads')}
      <div style={s.divider} />
      <div style={{ padding: '0 16px', marginTop: 'auto' }}>
        <div onClick={() => { localStorage.removeItem('token'); window.location.href = '/login' }} style={{ fontSize: 12, color: '#aaa', cursor: 'pointer', paddingBottom: 16 }}>Logi välja</div>
      </div>
    </div>
  )
}
