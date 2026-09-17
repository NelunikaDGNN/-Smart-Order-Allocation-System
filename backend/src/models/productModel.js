const pool = require('../config/db');

async function findAllActive() {
  const { rows } = await pool.query('SELECT * FROM products WHERE is_active = true');
  return rows;
}

async function findByIds(ids) {
  if (ids.length === 0) return [];
  const { rows } = await pool.query('SELECT * FROM products WHERE id = ANY($1::int[])', [ids]);
  return rows;
}

module.exports = { findAllActive, findByIds };
