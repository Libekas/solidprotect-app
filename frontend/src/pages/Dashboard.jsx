import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Copilot from '../components/Copilot'
import LeadsPage from './LeadsPage'
import CampaignsPage from './CampaignsPage'
import ApolloPage from './ApolloPage'
import api from '../api'
import DashboardPage from './DashboardPage'

export default function Dashboard() {
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [counts, setCounts] = useState({ new: 0, contacted: 0, replied: 0 })

  useEffect(() => {
    api.get('/leads/stats/counts').then(r => setCounts(r.data)).catch(() => {})
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar counts={counts} onCopilotOpen={() => setCopilotOpen(true)} />
      <div style={{ marginLeft: 242, flex: 1, display: 'flex', overflow: 'hidden', background: '#0d0d10' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/leads/new" />} />
          <Route path="/leads/:status" element={<LeadsPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/apollo" element={<ApolloPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
      <Copilot isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </div>
  )
}
