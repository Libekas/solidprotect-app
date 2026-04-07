import React, { useState } from 'react'
import api from '../api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { username, password })
      localStorage.setItem('token', res.data.token)
      window.location.href = '/'
    } catch (err) {
      setError(err.response?.data?.error || 'Viga sisselogimisel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F6F3' }}>
      <div style={{ width: 360, background: '#fff', border: '0.5px solid #e8e6e0', borderRadius: 16, padding: '40px 36px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.05em', marginBottom: 4 }}>
            SOLID<span style={{ color: '#D85A30' }}>PROTECT</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 500, color: '#1a1a1a' }}>Logi sisse</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Müügi admin paneel</div>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>Kasutajanimi</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '0.5px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fafaf9' }}
              placeholder="taavi"
              autoFocus
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>Parool</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '0.5px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fafaf9' }}
              placeholder="••••••••"
            />
          </div>
          {error && <div style={{ fontSize: 13, color: '#D85A30', marginBottom: 16 }}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '11px', background: '#D85A30', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500 }}
          >
            {loading ? 'Sisselogimine...' : 'Logi sisse'}
          </button>
        </form>
      </div>
    </div>
  )
}
