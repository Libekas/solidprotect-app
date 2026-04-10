const express = require('express');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const auth = require('../middleware/auth');
const router = express.Router();

router.patch('/:id', auth, async (req, res) => {
  const { status, body, subject } = req.body;
  try {
    const result = await pool.query(
      `UPDATE emails SET
        status = COALESCE($1, status),
        body = COALESCE($2, body),
        subject = COALESCE($3, subject),
        sent_at = CASE WHEN $1 = 'sent' THEN NOW() ELSE sent_at END
       WHERE id = $4 RETURNING *`,
      [status, body, subject, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
