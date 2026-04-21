const express = require('express');
const { Resend } = require('resend');
const { pool } = require('../index');
const router = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);

// Cron endpoint: saadab kõik 'approved' staatusega emailid
router.post('/cron', async (req, res) => {
  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { rows: emails } = await pool.query(`
      SELECT e.*, l.email as lead_email, l.first_name, l.last_name
      FROM emails e
      JOIN leads l ON e.lead_id = l.id
      WHERE e.status = 'approved'
      ORDER BY e.created_at ASC
      LIMIT 20
    `);

    const results = [];

    for (const email of emails) {
      try {
        await resend.emails.send({
          from: 'Taavi Küng <sales@solidprotect.eu>',
          to: email.lead_email,
          subject: email.subject,
          html: email.body.replace(/\n/g, '<br>'),
        });

        await pool.query(
          `UPDATE emails SET status = 'sent', sent_at = NOW() WHERE id = $1`,
          [email.id]
        );

        await pool.query(
          `UPDATE leads SET last_activity = NOW(), steps_done = steps_done + 1 WHERE id = $1`,
          [email.lead_id]
        );

        results.push({ id: email.id, email: email.lead_email, status: 'sent' });
      } catch (err) {
        await pool.query(
          `UPDATE emails SET status = 'error' WHERE id = $1`,
          [email.id]
        );
        results.push({ id: email.id, email: email.lead_email, status: 'error', error: err.message });
      }
    }

    res.json({ sent: results.filter(r => r.status === 'sent').length, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manuaalne: saada üks konkreetne email kohe
router.post('/:id', async (req, res) => {
  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { rows } = await pool.query(`
      SELECT e.*, l.email as lead_email, l.first_name, l.last_name
      FROM emails e
      JOIN leads l ON e.lead_id = l.id
      WHERE e.id = $1
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ error: 'Email not found' });

    const email = rows[0];

    await resend.emails.send({
      from: 'Taavi Küng <sales@solidprotect.eu>',
      to: email.lead_email,
      subject: email.subject,
      html: email.body.replace(/\n/g, '<br>'),
    });

    await pool.query(
      `UPDATE emails SET status = 'sent', sent_at = NOW() WHERE id = $1`,
      [email.id]
    );

    await pool.query(
      `UPDATE leads SET last_activity = NOW(), steps_done = steps_done + 1 WHERE id = $1`,
      [email.lead_id]
    );

    res.json({ success: true, email: email.lead_email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
