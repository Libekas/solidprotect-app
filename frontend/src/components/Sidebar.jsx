import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const DARK = '#0F1A0E'
const DARK_3 = '#1E2E1C'
const GREEN = '#4CAF50'
const GREEN_BRIGHT = '#6FCF72'
const GREEN_DIM = '#2E5C30'
const TEXT_PRIMARY = '#E8F0E7'
const TEXT_MUTED = '#6B8A69'
const BORDER = '#1E2E1C'

export default function Sidebar({ counts, onCopilotOpen }) {
  const navigate = useNavigate()
  const loc = useLocation()

  const navItem = (path, label, count, dot, icon) => {
    const active = loc.pathname === path
    return (
      <div
        onClick={() => navigate(path)}
        style={{
          padding: '10px 18px',
          fontSize: 14.5,
          color: active ? TEXT_PRIMARY : TEXT_MUTED,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderRadius: 9,
          margin: '2px 9px',
          background: active ? DARK_3 : 'transparent',
          fontWeight: active ? 500 : 400,
          transition: 'all 0.12s ease',
          position: 'relative',
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = DARK_3 }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
      >
        {active && (
          <div style={{
            position: 'absolute',
            left: 0,
            top: '20%',
            height: '60%',
            width: 3,
            borderRadius: '0 3px 3px 0',
            background: GREEN,
          }} />
        )}
        {dot && (
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: dot, display: 'inline-block', flexShrink: 0,
            boxShadow: `0 0 6px ${dot}88`,
          }} />
        )}
        {icon && !dot && (
          <span style={{ opacity: active ? 1 : 0.5, display: 'flex', alignItems: 'center' }}>
            {icon}
          </span>
        )}
        <span style={{ flex: 1, letterSpacing: '0.01em' }}>{label}</span>
        {count !== undefined && (
          <span style={{
            fontSize: 11.5,
            color: active ? GREEN_BRIGHT : TEXT_MUTED,
            background: active ? GREEN_DIM : '#1A2819',
            padding: '2px 8px',
            borderRadius: 20,
            fontWeight: 600,
          }}>{count}</span>
        )}
      </div>
    )
  }

  return (
    <div style={{
      width: 242,
      minWidth: 242,
      background: DARK,
      borderRight: `1px solid ${BORDER}`,
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
        padding: '22px 20px 20px',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex',
        alignItems: 'center',
        gap: 11,
      }}>
        <div style={{
          width: 32, height: 32,
          background: GREEN_DIM,
          borderRadius: 9,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${GREEN}33`,
          flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path d="M2 12L7 2L12 12" stroke={GREEN_BRIGHT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 8.5H10" stroke={GREEN_BRIGHT} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <span style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: '0.08em', color: TEXT_PRIMARY }}>
          SOLID<span style={{ color: GREEN }}>PROTECT</span>
        </span>
      </div>

      {/* Copilot button */}
      <div style={{ padding: '16px 13px 10px' }}>
        <button
          onClick={onCopilotOpen}
          style={{
            width: '100%',
            padding: '11px 16px',
            background: `linear-gradient(135deg, ${GREEN_DIM} 0%, #2A4A2A 100%)`,
            color: TEXT_PRIMARY,
            border: `1px solid ${GREEN}33`,
            borderRadius: 11,
            fontSize: 13.5,
            fontWeight: 500,
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            transition: 'all 0.15s ease',
            fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = `linear-gradient(135deg, #3A6C3A 0%, #335533 100%)`
            e.currentTarget.style.borderColor = `${GREEN}66`
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = `linear-gradient(135deg, ${GREEN_DIM} 0%, #2A4A2A 100%)`
            e.currentTarget.style.borderColor = `${GREEN}33`
          }}
        >
          <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke={GREEN} strokeWidth="1.2"/>
            <path d="M4.5 7C4.5 5.619 5.619 4.5 7 4.5S9.5 5.619 9.5 7 8.381 9.5 7 9.5" stroke={GREEN} strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="7" cy="7" r="1.2" fill={GREEN}/>
          </svg>
          <span>Talk with copilot</span>
          <span style={{
            marginLeft: 'auto',
            fontSize: 10.5,
            color: GREEN,
            background: `${GREEN}22`,
            padding: '2px 7px',
            borderRadius: 4,
            fontWeight: 600,
          }}>AI</span>
        </button>
      </div>

      {/* Dashboard */}
      <div style={{ padding: '6px 0 2px' }}>
        {navItem('/dashboard', 'Dashboard', undefined, undefined,
          <svg width="15" height="15" viewBox="0 0 13 13" fill="none">
            <rect x="1.5" y="1.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <rect x="7.5" y="1.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <rect x="1.5" y="7.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <rect x="7.5" y="7.5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
        )}
      </div>

      <div style={{ height: 1, background: BORDER, margin: '10px 18px' }} />

      <div style={{ padding: '4px 20px 8px', fontSize: 10.5, color: TEXT_MUTED, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
        Pipeline
      </div>
      {navItem('/leads/new', 'New leads', counts?.new, '#E05A30')}
      {navItem('/leads/contacted', 'Contacted', counts?.contacted, '#3A8AD4')}
      {navItem('/leads/replied', 'Replied', counts?.replied, GREEN)}

      <div style={{ height: 1, background: BORDER, margin: '10px 18px' }} />

      {navItem('/campaigns', 'Campaigns', undefined, undefined,
        <svg width="15" height="15" viewBox="0 0 13 13" fill="none">
          <path d="M2 10V4.5L6.5 2L11 4.5V10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="4.5" y="7" width="4" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
        </svg>
      )}
      {navItem('/apollo', 'Find leads', undefined, undefined,
        <svg width="15" height="15" viewBox="0 0 13 13" fill="none">
          <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M8.5 8.5L11 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      )}

      <div style={{ padding: '0 18px', marginTop: 'auto', paddingBottom: 22 }}>
        <div style={{ height: 1, background: BORDER, marginBottom: 16 }} />
        <div
          onClick={() => { localStorage.removeItem('token'); window.location.href = '/login' }}
          style={{
            fontSize: 13.5,
            color: TEXT_MUTED,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'color 0.15s',
            padding: '7px 4px',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#E05A30'}
          onMouseLeave={e => e.currentTarget.style.color = TEXT_MUTED}
        >
          <svg width="14" height="14" viewBox="0 0 13 13" fill="none">
            <path d="M8.5 4.5L11 6.5L8.5 8.5M11 6.5H5M5 2.5H2.5V10.5H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Logi välja
        </div>
      </div>
    </div>
  )
}
