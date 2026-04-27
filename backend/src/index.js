require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://solidprotect-app-1.onrender.com',
  credentials: true
}));
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS campaigns (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        market VARCHAR(50),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100), last_name VARCHAR(100),
        email VARCHAR(255), linkedin_url VARCHAR(500),
        company_name VARCHAR(255), company_domain VARCHAR(255),
        role VARCHAR(255), country VARCHAR(100), market VARCHAR(50),
        campaign_id INTEGER REFERENCES campaigns(id),
        status VARCHAR(50) DEFAULT 'new',
        relevancy_score INTEGER, relevancy_text TEXT,
        company_description TEXT, apollo_id VARCHAR(255),
        steps_total INTEGER DEFAULT 2, steps_done INTEGER DEFAULT 0,
        last_activity TIMESTAMP, created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS emails (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER REFERENCES leads(id),
        type VARCHAR(50), subject VARCHAR(500), body TEXT,
        sent_at TIMESTAMP, status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        role VARCHAR(20), content TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS template_initial TEXT;
      ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS template_followup TEXT;
    `).catch(() => {});
    await pool.query(`
      ALTER TABLE emails ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP;
    `).catch(() => {});
    console.log('DB init done');
  } catch (err) {
    console.error('DB init error:', err.message);
  }
}
initDb();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/copilot', require('./routes/copilot'));
app.use('/api/apollo', require('./routes/apollo'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/emails', require('./routes/emails'));
app.use('/api/send', require('./routes/send'));
app.use('/api/analyze', require('./routes/analyze'));

app.get('/', (req, res) => res.send('Solid Protect API töötab'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API pordil ${PORT}`));

module.exports = { pool };
