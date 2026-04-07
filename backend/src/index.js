require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/copilot', require('./routes/copilot'));
app.use('/api/apollo', require('./routes/apollo'));

app.get('/', (req, res) => res.send('Solid Protect API töötab'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API pordil ${PORT}`));

module.exports = { pool };
