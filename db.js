// db.js
const { Pool } = require('node:pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.SUPABASE_URI,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function query(text, params) {
  // ... tu función query ...
}

module.exports = { query };