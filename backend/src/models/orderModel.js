const pool = require('../config/db');

async function createOrderWithItems(client, {
  customerId, branchId, customerLat, customerLng, note, noteCategory,
  noteConfidence, allocationScore, status, items,
}) {
  const { rows } = await client.query(
    `INSERT INTO orders
       (customer_id, branch_id, customer_lat, customer_lng, note,
        note_category, note_confidence, allocation_score, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [customerId, branchId, customerLat, customerLng, note || null,
      noteCategory || null, noteConfidence || null, allocationScore || null, status]
  );
  const order = rows[0];

  
  for (const item of items) {
    await client.query(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents)
       VALUES ($1,$2,$3,$4)`,
      [order.id, item.productId, item.quantity, item.unitPriceCents]
    );
  }

  return order;
}

async function findById(orderId) {
  const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  return rows[0] || null;
}

async function findItemsForOrder(orderId) {
  const { rows } = await pool.query(
    `SELECT oi.product_id, oi.quantity, oi.unit_price_cents, p.name AS product_name
     FROM order_items oi JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1
     ORDER BY oi.id`,
    [orderId]
  );
  return rows;
}

async function findForCustomer(customerId) {
  const { rows } = await pool.query(
    `SELECT o.*, b.name AS branch_name, b.address AS branch_address
     FROM orders o
     LEFT JOIN branches b ON b.id = o.branch_id
     WHERE o.customer_id = $1
     ORDER BY o.created_at DESC`,
    [customerId]
  );
  return rows;
}

async function findAllForAdmin({ status, branchId, search, limit = 50, offset = 0 }) {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (status) {
    conditions.push(`o.status = $${idx++}`);
    params.push(status);
  }
  if (branchId) {
    conditions.push(`o.branch_id = $${idx++}`);
    params.push(branchId);
  }
     if (search) {
    conditions.push(
      `(u.email ILIKE $${idx} OR u.full_name ILIKE $${idx} OR o.note ILIKE $${idx} OR b.name ILIKE $${idx} OR o.note_category ILIKE $${idx})`
    );
    params.push(`%${search}%`);
    idx += 1;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit, offset);

  const { rows } = await pool.query(
    `SELECT o.*, u.email AS customer_email, u.full_name AS customer_name, b.name AS branch_name
     FROM orders o
     JOIN users u ON u.id = o.customer_id
     LEFT JOIN branches b ON b.id = o.branch_id
     ${where}
     ORDER BY o.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    params
  );
  return rows;
}

async function updateStatus(orderId, status) {
  const { rows } = await pool.query(
    `UPDATE orders SET status = $1, updated_at = now() WHERE id = $2 RETURNING *`,
    [status, orderId]
  );
  return rows[0] || null;
}

async function deleteOrder(orderId) {
  const { rowCount } = await pool.query('DELETE FROM orders WHERE id = $1', [orderId]);
  return rowCount > 0;
}

module.exports = {
  createOrderWithItems,
  findById,
  findItemsForOrder,
  findForCustomer,
  findAllForAdmin,
  updateStatus,
  deleteOrder
};
