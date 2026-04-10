const express = require('express');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const auth = require('../middleware/auth');
const router = express.Router();

// Get all campaigns with lead counts
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*,
        COUNT(l.id) as lead_count,
        COUNT(CASE WHEN l.status = 'contacted' THEN 1 END) as contacted_count,
        COUNT(CASE WHEN l.status = 'replied' THEN 1 END) as replied_count
      FROM campaigns c
      LEFT JOIN leads l ON l.campaign_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create campaign
router.post('/', auth, async (req, res) => {
  const { name, market } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO campaigns (name, market) VALUES ($1, $2) RETURNING *',
      [name, market]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update campaign templates
router.patch('/:id', auth, async (req, res) => {
  const { name, template_initial, template_followup, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE campaigns SET
        name = COALESCE($1, name),
        template_initial = COALESCE($2, template_initial),
        template_followup = COALESCE($3, template_followup),
        status = COALESCE($4, status)
       WHERE id = $5 RETURNING *`,
      [name, template_initial, template_followup, status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk generate emails for all new leads in campaign
router.post('/:id/generate', auth, async (req, res) => {
  const { type = 'initial' } = req.body;
  try {
    // Get campaign with templates
    const camp = await pool.query('SELECT * FROM campaigns WHERE id = $1', [req.params.id]);
    if (!camp.rows[0]) return res.status(404).json({ error: 'Campaign not found' });
    const campaign = camp.rows[0];

    const template = type === 'initial' ? campaign.template_initial : campaign.template_followup;
    if (!template) return res.status(400).json({ error: `Template puudub (${type})` });

    // Get leads without this email type
    const leads = await pool.query(`
      SELECT l.* FROM leads l
      WHERE l.campaign_id = $1
        AND l.status = $2
        AND NOT EXISTS (
          SELECT 1 FROM emails e WHERE e.lead_id = l.id AND e.type = $3
        )
    `, [req.params.id, type === 'initial' ? 'new' : 'contacted', type]);

    const generated = [];

    for (const lead of leads.rows) {
      const marketMap = { NL: 'Netherlands', CA: 'Canada', FI: 'Finland' };
      const body = template
        .replace(/\{first_name\}/gi, lead.first_name || '')
        .replace(/\{last_name\}/gi, lead.last_name || '')
        .replace(/\{full_name\}/gi, `${lead.first_name || ''} ${lead.last_name || ''}`.trim())
        .replace(/\{company\}/gi, lead.company_name || '')
        .replace(/\{role\}/gi, lead.role || '')
        .replace(/\{market\}/gi, marketMap[lead.market] || lead.market || '');

      // Extract subject from first line if starts with Subject:
      const lines = body.split('\n');
      const subjectLine = lines.find(l => l.toLowerCase().startsWith('subject:'));
      const subject = subjectLine
        ? subjectLine.replace(/^subject:/i, '').trim()
        : 'Fire protection for wood — SPFR100';

      // Save as draft
      const email = await pool.query(
        `INSERT INTO emails (lead_id, type, subject, body, status)
         VALUES ($1, $2, $3, $4, 'draft') RETURNING *`,
        [lead.id, type, subject, body]
      );
      generated.push({ lead_id: lead.id, lead_name: `${lead.first_name} ${lead.last_name}`, email: email.rows[0] });
    }

    res.json({ generated: generated.length, items: generated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
