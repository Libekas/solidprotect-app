const express = require('express');
const axios = require('axios');
const { pool } = require('../index');
const auth = require('../middleware/auth');
const router = express.Router();

const APOLLO_KEY = process.env.APOLLO_API_KEY;

// Search people by market/role
router.post('/search', auth, async (req, res) => {
  const { market, roles, titles, company_size, limit = 25 } = req.body;

  const countryMap = { NL: 'Netherlands', CA: 'Canada', FI: 'Finland' };
  const countries = market ? [countryMap[market] || market] : [];

  try {
    const response = await axios.post('https://api.apollo.io/v1/mixed_people/search', {
      api_key: APOLLO_KEY,
      per_page: limit,
      person_titles: titles || ['Managing Director', 'CEO', 'Production Manager', 'CLT Manager', 'Procurement Manager'],
      person_locations: countries,
      organization_industry_tag_ids: [],
      contact_email_status: ['verified', 'likely to engage']
    }, {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
    });

    const people = response.data.people || [];
    res.json({ people, total: response.data.pagination?.total_entries || people.length });
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// Import Apollo results to leads
router.post('/import', auth, async (req, res) => {
  const { people, campaign_id, market } = req.body;
  const imported = [];

  for (const p of people) {
    try {
      const result = await pool.query(
        `INSERT INTO leads (first_name, last_name, email, company_name, company_domain, role, country, market, campaign_id, linkedin_url, apollo_id, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'new')
         ON CONFLICT (apollo_id) DO NOTHING RETURNING *`,
        [
          p.first_name, p.last_name,
          p.email || '',
          p.organization?.name || '',
          p.organization?.website_url || '',
          p.title || '',
          p.country || market,
          market,
          campaign_id,
          p.linkedin_url || '',
          p.id
        ]
      );
      if (result.rows[0]) imported.push(result.rows[0]);
    } catch (e) {
      console.error('Import error:', e.message);
    }
  }

  res.json({ imported: imported.length, leads: imported });
});

// Add apollo_id unique constraint if not exists
router.post('/setup-constraint', auth, async (req, res) => {
  try {
    await pool.query('ALTER TABLE leads ADD CONSTRAINT leads_apollo_id_unique UNIQUE (apollo_id)');
    res.json({ ok: true });
  } catch {
    res.json({ ok: true, note: 'Constraint already exists' });
  }
});

module.exports = router;
