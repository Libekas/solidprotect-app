const express = require('express');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, COUNT(l.id) as lead_count,
        COUNT(CASE WHEN l.status = 'contacted' THEN 1 END) as contacted_count,
        COUNT(CASE WHEN l.status = 'replied' THEN 1 END) as replied_count
      FROM campaigns c LEFT JOIN leads l ON l.campaign_id = c.id
      GROUP BY c.id ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { name, market } = req.body;
  try {
    const result = await pool.query('INSERT INTO campaigns (name, market) VALUES ($1, $2) RETURNING *', [name, market]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
