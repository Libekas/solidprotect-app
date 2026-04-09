const express = require('express');
const axios = require('axios');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const auth = require('../middleware/auth');
const router = express.Router();
const APOLLO_KEY = process.env.APOLLO_API_KEY;

// Multer — memory storage (no disk needed)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

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

// Import Apollo results to leads (from API search)
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

// CSV import — Apollo exported CSV
router.post('/import-csv', auth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'CSV fail puudub' });
  const { campaign_id, market } = req.body;
  if (!campaign_id) return res.status(400).json({ error: 'campaign_id puudub' });

  let records;
  try {
    records = parse(req.file.buffer.toString('utf8'), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true // handle Excel BOM
    });
  } catch (e) {
    return res.status(400).json({ error: 'CSV parse viga: ' + e.message });
  }

  // Apollo CSV column name mapping — case-insensitive, strips non-alpha
  const col = (row, ...keys) => {
    for (const k of keys) {
      const needle = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      const found = Object.keys(row).find(r => r.toLowerCase().replace(/[^a-z0-9]/g, '') === needle);
      if (found && row[found] && row[found].trim()) return row[found].trim();
    }
    return '';
  };

  // Debug: log first row keys to help diagnose mapping issues
  if (records.length > 0) {
    console.log('CSV columns:', Object.keys(records[0]));
  }

  const imported = [];
  const skipped = [];

  for (const row of records) {
    // Apollo export uses these exact column names (verified from export)
    const first_name   = col(row, 'First Name');
    const last_name    = col(row, 'Last Name');
    // Apollo email column variations
    const email        = col(row, 'Email', 'Work Email', 'Primary Email', 'Email Address',
                              'Primary Email Address', 'Work Direct Email');
    const title        = col(row, 'Title', 'Job Title', 'Person Title');
    const company      = col(row, 'Company', 'Company Name', 'Account Name', 'Organization Name');
    const domain       = col(row, 'Website', 'Company Website', 'Company Domain', 'Company Linkedin Url');
    const linkedin     = col(row, 'LinkedIn Url', 'Person Linkedin Url', 'LinkedIn URL', 'Linkedin');
    const country      = col(row, 'Country', 'Person Country', 'Location Country');
    const city         = col(row, 'City', 'Person City', 'Location City');
    const state        = col(row, 'State', 'Person State', 'Location State');
    const phone        = col(row, 'Work Direct Phone', 'Mobile Phone', 'Phone', 'Corporate Phone');
    const industry     = col(row, 'Industry', 'Company Industry', 'Keywords');
    const employees    = col(row, '# Employees', 'Employees', 'Company Headcount', 'Number of Employees');
    const apollo_id    = col(row, 'Person ID', 'Apollo ID', 'ID', 'Contact ID') || null;

    if (!first_name && !last_name) { skipped.push(row); continue; }

    try {
      const result = await pool.query(
        `INSERT INTO leads (
          first_name, last_name, email, company_name, company_domain,
          role, country, market, campaign_id, linkedin_url, apollo_id,
          status, company_description
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'new',$12)
        ON CONFLICT (apollo_id) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          email = COALESCE(NULLIF(EXCLUDED.email,''), leads.email),
          company_name = EXCLUDED.company_name,
          role = EXCLUDED.role,
          country = EXCLUDED.country
        RETURNING *`,
        [
          first_name, last_name, email, company, domain,
          title, country || market, market, campaign_id, linkedin,
          apollo_id,
          [city, state, industry, employees ? `${employees} employees` : ''].filter(Boolean).join(' | ') || null
        ]
      );
      if (result.rows[0]) imported.push(result.rows[0]);
    } catch (e) {
      console.error('CSV row error:', e.message, row);
      skipped.push({ row, error: e.message });
    }
  }

  res.json({
    imported: imported.length,
    skipped: skipped.length,
    total: records.length,
    leads: imported
  });
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
