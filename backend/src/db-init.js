const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function initDb() {
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
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      email VARCHAR(255),
      linkedin_url VARCHAR(500),
      company_name VARCHAR(255),
      company_domain VARCHAR(255),
      role VARCHAR(255),
      country VARCHAR(100),
      market VARCHAR(50),
      campaign_id INTEGER REFERENCES campaigns(id),
      status VARCHAR(50) DEFAULT 'new',
      relevancy_score INTEGER,
      relevancy_text TEXT,
      company_description TEXT,
      apollo_id VARCHAR(255),
      steps_total INTEGER DEFAULT 2,
      steps_done INTEGER DEFAULT 0,
      last_activity TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS emails (
      id SERIAL PRIMARY KEY,
      lead_id INTEGER REFERENCES leads(id),
      type VARCHAR(50),
      subject VARCHAR(500),
      body TEXT,
      sent_at TIMESTAMP,
      status VARCHAR(50) DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      role VARCHAR(20),
      content TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('DB init done');
  await pool.end();
}

initDb().catch(console.error);
