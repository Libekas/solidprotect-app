const express = require('express');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const auth = require('../middleware/auth');
const router = express.Router();

// Get all leads by status
router.get('/', auth, async (req, res) => {
  const { status, market, campaign_id, search } = req.query;
  let query = 'SELECT l.*, c.name as campaign_name FROM leads l LEFT JOIN campaigns c ON l.campaign_id = c.id WHERE 1=1';
  const params = [];
  if (status) { params.push(status); query += ` AND l.status = $${params.length}`; }
  if (market) { params.push(market); query += ` AND l.market = $${params.length}`; }
  if (campaign_id) { params.push(campaign_id); query += ` AND l.campaign_id = $${params.length}`; }
  if (search) { params.push(`%${search}%`); query += ` AND (l.first_name ILIKE $${params.length} OR l.last_name ILIKE $${params.length} OR l.company_name ILIKE $${params.length})`; }
  query += ' ORDER BY l.created_at DESC';
  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single lead
router.get('/:id', auth, async (req, res) => {
  try {
    const lead = await pool.query('SELECT l.*, c.name as campaign_name FROM leads l LEFT JOIN campaigns c ON l.campaign_id = c.id WHERE l.id = $1', [req.params.id]);
    const emails = await pool.query('SELECT * FROM emails WHERE lead_id = $1 ORDER BY created_at ASC', [req.params.id]);
    res.json({ ...lead.rows[0], emails: emails.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add lead manually
router.post('/', auth, async (req, res) => {
  const { first_name, last_name, email, company_name, role, country, market, campaign_id, linkedin_url } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO leads (first_name, last_name, email, company_name, role, country, market, campaign_id, linkedin_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [first_name, last_name, email, company_name, role, country, market, campaign_id, linkedin_url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update lead status
router.patch('/:id', auth, async (req, res) => {
  const fields = req.body;
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const set = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  try {
    const result = await pool.query(`UPDATE leads SET ${set}, last_activity = NOW() WHERE id = $${keys.length + 1} RETURNING *`, [...values, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save email for lead
router.post('/:id/emails', auth, async (req, res) => {
  const { type, subject, body, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO emails (lead_id, type, subject, body, status, sent_at) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [req.params.id, type, subject, body, status, status === 'sent' ? new Date() : null]
    );
    if (status === 'sent') {
      await pool.query('UPDATE leads SET steps_done = steps_done + 1, last_activity = NOW(), status = $1 WHERE id = $2', ['contacted', req.params.id]);
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lead counts by status
router.get('/stats/counts', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT status, COUNT(*) as count FROM leads GROUP BY status');
    const counts = { new: 0, contacted: 0, replied: 0 };
    result.rows.forEach(r => counts[r.status] = parseInt(r.count));
    res.json(counts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
