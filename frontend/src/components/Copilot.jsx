import React, { useState, useRef, useEffect } from 'react'
import api from '../api'

export default function Copilot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Tere, Taavi! Millest täna alustame?\n\n· Analüüsin lead\'e\n· Koostan meile\n· Otsin uusi kontakte\n· Arutame strateegiat' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input }
    const newMsgs = [...messages, userMsg]
    setMessages(newMsgs)
    setInput('')
    setLoading(true)
    try {
      const apiMsgs = newMsgs.filter(m => typeof m.content === 'string').map(m => ({ role: m.role, content: m.content }))
      const res = await api.post('/copilot/chat', { messages: apiMsgs })
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Viga: ' + (err.response?.data?.error || err.message) }])
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', bottom: 0, right: 24, width: 360, height: 500, background: '#fff', border: '0.5px solid #ddd', borderRadius: '12px 12px 0 0', display: 'flex', flexDirection: 'column', zIndex: 1000, boxShadow: '0 -4px 24px rgba(0,0,0,0.08)' }}>
      <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #e8e6e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Copilot</div>
          <div style={{ fontSize: 11, color: '#aaa' }}>Solid Protect müügi-assistent</div>
        </div>
        <span onClick={onClose} style={{ cursor: 'pointer', color: '#aaa', fontSize: 18, lineHeight: 1 }}>×</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ maxWidth: '85%', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              padding: '8px 12px', borderRadius: 10, fontSize: 13, lineHeight: 1.6,
              background: m.role === 'user' ? '#D85A30' : '#f5f4f1',
              color: m.role === 'user' ? '#fff' : '#1a1a1a',
              whiteSpace: 'pre-wrap'
            }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start' }}>
            <div style={{ padding: '8px 12px', borderRadius: 10, fontSize: 13, background: '#f5f4f1', color: '#aaa' }}>Mõtlen...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '10px 12px', borderTop: '0.5px solid #e8e6e0', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Küsi midagi..."
          style={{ flex: 1, padding: '8px 10px', border: '0.5px solid #ddd', borderRadius: 8, fontSize: 13, background: '#fafaf9', outline: 'none' }}
          autoFocus={isOpen}
        />
        <button onClick={send} disabled={loading} style={{ padding: '8px 14px', background: '#D85A30', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>→</button>
      </div>
    </div>
  )
}
