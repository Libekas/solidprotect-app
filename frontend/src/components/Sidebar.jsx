import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const SP_GREEN = '#2D5A27'
const SP_GREEN_LIGHT = '#4A8C42'
const SP_GREEN_ACCENT = '#6AB04C'
const SP_CREAM = '#F5F4EF'
const SP_CREAM_DARK = '#EDEBE3'

export default function Sidebar({ counts, onCopilotOpen }) {
  const navigate = useNavigate()
  const loc = useLocation()

  const navItem = (path, label, count, dot) => {
    const active = loc.pathname === path
    return (
      <div
        onClick={() => navigate(path)}
        style={{
          padding: '8px 18px',
          fontSize: 13,
          color: active ? SP_GREEN : '#555',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          borderLeft: active ? `2px solid ${SP_GREEN}` : '2px solid transparent',
          background: active ? '#E8F0E7' : 'transparent',
          fontWeight: active ? 500 : 400,
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = SP_CREAM_DARK }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
      >
        {dot && (
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: dot, display: 'inline-block', flexShrink: 0
          }} />
        )}
        <span style={{ flex: 1 }}>{label}</span>
        {count !== undefined && (
          <span style={{
            fontSize: 11,
            color: active ? SP_GREEN : '#999',
            background: active ? '#D0E4CE' : '#ECEAE2',
            padding: '1px 7px',
            borderRadius: 20,
            fontWeight: 500,
          }}>{count}</span>
        )}
      </div>
    )
  }

  return (
    <div style={{
      width: 220,
      minWidth: 220,
      background: '#fff',
      borderRight: '1px solid #E5E3DB',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 18px 16px',
        borderBottom: '1px solid #E5E3DB',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        {/* SP logo ring */}
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="9" stroke={SP_GREEN_ACCENT} strokeWidth="2.2" fill="none" />
          <circle cx="11" cy="11" r="4" stroke={SP_GREEN} strokeWidth="1.5" fill="none" />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', color: '#1a1a1a' }}>
          SOLID<span style={{ color: SP_GREEN }}>PROTECT</span>
        </span>
      </div>

      {/* Copilot button */}
      <div style={{ padding: '14px 12px 10px' }}>
        <button
          onClick={onCopilotOpen}
          style={{
            width: '100%',
            padding: '9px 14px',
            background: SP_GREEN,
            color: '#fff',
            border: 'none',
            borderRadius: 9,
            fontSize: 12.5,
            fontWeight: 500,
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            transition: 'background 0.15s ease',
            fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseEnter={e => e.currentTarget.style.background = SP_GREEN_LIGHT}
          onMouseLeave={e => e.currentTarget.style.background = SP_GREEN}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2"/>
            <path d="M5 7h4M7 5v4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Talk with copilot
        </button>
      </div>

      {/* Pipeline section */}
      <div style={{ padding: '10px 18px 6px', fontSize: 10, color: '#aaa', letterSpacing: '0.09em', textTransform: 'uppercase', fontWeight: 500 }}>
        Pipeline
      </div>
      {navItem('/leads/new', 'New leads', counts?.new, '#E05A30')}
      {navItem('/leads/contacted', 'Contacted', counts?.contacted, '#3A8AD4')}
      {navItem('/leads/replied', 'Replied', counts?.replied, SP_GREEN_ACCENT)}

      <div style={{ height: '1px', background: '#E5E3DB', margin: '10px 0' }} />

      {navItem('/campaigns', 'Campaigns')}
      {navItem('/apollo', 'Find leads')}

      <div style={{ height: '1px', background: '#E5E3DB', margin: '10px 0' }} />

      {/* Logout */}
      <div style={{ padding: '0 18px', marginTop: 'auto', paddingBottom: 18 }}>
        <div
          onClick={() => { localStorage.removeItem('token'); window.location.href = '/login' }}
          style={{
            fontSize: 12,
            color: '#bbb',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#666'}
          onMouseLeave={e => e.currentTarget.style.color = '#bbb'}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M8.5 4.5L11 6.5L8.5 8.5M11 6.5H5M5 2.5H2.5V10.5H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Logi välja
        </div>
      </div>
    </div>
  )
}
