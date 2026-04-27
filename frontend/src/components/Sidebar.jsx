import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Sidebar({ counts, onCopilotOpen }) {
  const navigate = useNavigate()
  const loc = useLocation()

  const NavItem = ({ path, icon, label, count }) => {
    const active = loc.pathname === path
    const [hov, setHov] = useState(false)
    return (
      <div
        onClick={() => navigate(path)}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
          background: active ? 'rgba(96,165,250,0.12)' : hov ? 'rgba(255,255,255,0.05)' : 'transparent',
          color: active ? '#93c5fd' : 'rgba(255,255,255,0.5)',
          fontSize: 13, fontWeight: active ? 500 : 400,
          transition: 'all 0.12s',
        }}
      >
        <span style={{ fontSize: 14, opacity: active ? 1 : 0.7 }}>{icon}</span>
        <span style={{ flex: 1 }}>{label}</span>
        {count !== undefined && (
          <span style={{
            fontSize: 11, fontWeight: 600,
            padding: '1px 7px', borderRadius: 10,
            background: active ? '#3b82f6' : 'rgba(255,255,255,0.1)',
            color: active ? '#fff' : 'rgba(255,255,255,0.5)',
          }}>{count}</span>
        )}
      </div>
    )
  }

  return (
    <div style={{
      width: 220, minWidth: 220,
      background: '#111116',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'fixed', left: 0, top: 0,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 18px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>S</span>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f0f2', letterSpacing: 0.5 }}>SOLID</div>
          <div style={{ fontSize: 9, fontWeight: 500, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>PROTECT</div>
        </div>
      </div>

      {/* Copilot button */}
      <div style={{ padding: '12px 14px' }}>
        <button
          onClick={onCopilotOpen}
          style={{
            width: '100%', padding: '8px 12px', borderRadius: 8,
            border: '1px solid rgba(99,102,241,0.4)',
            background: 'rgba(99,102,241,0.08)',
            color: '#a5b4fc', fontSize: 12, fontWeight: 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: "'DM Sans', sans-serif",
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
        >
          <span style={{ fontSize: 14 }}>✦</span>
          <span style={{ flex: 1, textAlign: 'left' }}>Talk with copilot</span>
          <span style={{ fontSize: 11, opacity: 0.6 }}>⌘K</span>
        </button>
      </div>

      {/* Nav */}
      <div style={{ padding: '8px 10px', flex: 1, overflow: 'auto' }}>
        <NavItem path="/dashboard" icon="⊞" label="Dashboard" />

        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', padding: '12px 14px 6px' }}>
          Pipeline
        </div>
        <NavItem path="/leads/new" icon="○" label="New leads" count={counts?.new} />
        <NavItem path="/leads/contacted" icon="◎" label="Contacted" count={counts?.contacted} />
        <NavItem path="/leads/replied" icon="●" label="Replied" count={counts?.replied} />

        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', padding: '12px 14px 6px' }}>
          Tools
        </div>
        <NavItem path="/campaigns" icon="◈" label="Campaigns" />
        <NavItem path="/apollo" icon="⊕" label="Find leads" />
      </div>

      {/* Bottom */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600,
        }}>T</div>
        <span
          onClick={() => { localStorage.removeItem('token'); window.location.href = '/login' }}
          style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', opacity: 0.6, transition: 'opacity 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
        >Logi välja</span>
      </div>
    </div>
  )
}
