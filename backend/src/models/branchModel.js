const pool = require('../config/db');

async function findAllActive() {
  const { rows } = await pool.query('SELECT * FROM branches WHERE is_active = true');
  return rows;
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM branches WHERE id = $1', [id]);
  return rows[0] || null;
}

/**
 * Current workload = count of orders in "active" (not yet finished) states
 */
async function getWorkloadCounts() {
  const { rows } = await pool.query(
    `SELECT branch_id, COUNT(*)::int AS active_orders
     FROM orders
     WHERE branch_id IS NOT NULL
       AND status IN ('pending', 'confirmed', 'preparing', 'dispatched')
     GROUP BY branch_id`
  );
  const map = {};
  for (const row of rows) {
    map[row.branch_id] = row.active_orders;
  }
  return map; 
}

module.exports = { findAllActive, findById, getWorkloadCounts };
