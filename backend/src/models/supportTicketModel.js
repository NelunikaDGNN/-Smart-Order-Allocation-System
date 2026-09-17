const pool = require('../config/db');

async function create({ orderId, customerId, message, category, confidence, flagged }) {
  const { rows } = await pool.query(
    `INSERT INTO support_tickets (order_id, customer_id, message, category, confidence, flagged)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [orderId, customerId, message, category || null, confidence || null, flagged || false]
  );
  return rows[0];
}

async function findForCustomer(customerId) {
  const { rows } = await pool.query(
    `SELECT t.*, o.id AS order_id
     FROM support_tickets t
     WHERE t.customer_id = $1
     ORDER BY t.created_at DESC`,
    [customerId]
  );
  return rows;
}

async function findAllForAdmin({ status, search, limit = 50, offset = 0 }) {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (status) {
    conditions.push(`t.status = $${idx++}`);
    params.push(status);
  }
  if (search) {
    conditions.push(`(t.message ILIKE $${idx} OR u.email ILIKE $${idx} OR u.full_name ILIKE $${idx})`);
    params.push(`%${search}%`);
    idx += 1;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit, offset);

  const { rows } = await pool.query(
    `SELECT t.*, u.email AS customer_email, u.full_name AS customer_name
     FROM support_tickets t
     JOIN users u ON u.id = t.customer_id
     ${where}
     ORDER BY t.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    params
  );
  return rows;
}

async function updateStatus(ticketId, status) {
  const { rows } = await pool.query(
    `UPDATE support_tickets SET status = $1, updated_at = now() WHERE id = $2 RETURNING *`,
    [status, ticketId]
  );
  return rows[0] || null;
}

async function findById(ticketId) {
  const { rows } = await pool.query('SELECT * FROM support_tickets WHERE id = $1', [ticketId]);
  return rows[0] || null;
}

module.exports = { create, findForCustomer, findAllForAdmin, updateStatus, findById };