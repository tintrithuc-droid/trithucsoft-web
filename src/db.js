const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://trithuc:trithuc@localhost:5432/trithuc',
  max: 10,
});

async function q(text, params) {
  const r = await pool.query(text, params);
  return r.rows;
}
async function one(text, params) {
  const rows = await q(text, params);
  return rows[0] || null;
}

module.exports = { pool, q, one };
