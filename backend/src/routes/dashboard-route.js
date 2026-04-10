const express = require('express');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const auth = require('../middleware/auth');
const router = express.Router();

// Dashboard stats + pending queue
router.get('/', auth, async (req, res) => {
  try {
    const [stats, pending] = await Promise.all([
      // Stats
      pool.query(`
        SELECT
          COUNT(DISTINCT CASE WHEN l.status != 'new' THEN l.id END) as leads_contacted,
          COUNT(DISTINCT CASE WHEN l.status = 'replied' THEN l.id END) as leads_replied,
          COUNT(e.id) FILTER (WHERE e.status = 'sent') as emails_sent,
          COUNT(DISTINCT l.id) as total_leads
        FROM leads l
        LEFT JOIN emails e ON e.lead_id = l.id
      `),
      // Pending draft emails queue
      pool.query(`
        SELECT
          e.id as email_id,
          e.type,
          e.subject,
          e.body,
          e.status,
          e.created_at,
          l.id as lead_id,
          l.first_name,
          l.last_name,
          l.role,
          l.company_name,
          l.market,
          l.email as lead_email,
          c.name as campaign_name,
          c.id as campaign_id
        FROM emails e
        JOIN leads l ON e.lead_id = l.id
        LEFT JOIN campaigns c ON l.campaign_id = c.id
        WHERE e.status = 'draft'
        ORDER BY e.created_at DESC
        LIMIT 100
      `)
    ]);

    const s = stats.rows[0];
    const total = parseInt(s.total_leads) || 0;
    const replied = parseInt(s.leads_replied) || 0;
    const contacted = parseInt(s.leads_contacted) || 0;
    const reply_rate = contacted > 0 ? Math.round((replied / contacted) * 100) : 0;

    res.json({
      stats: {
        leads_contacted: contacted,
        reply_rate,
        emails_sent: parseInt(s.emails_sent) || 0,
        total_responses: replied,
      },
      pending: pending.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
