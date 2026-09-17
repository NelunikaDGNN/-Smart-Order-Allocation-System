const pool = require('../config/db');

async function getStockForProducts(productIds) {
  if (productIds.length === 0) return [];
  const { rows } = await pool.query(
    `SELECT branch_id, product_id, quantity
     FROM stock
     WHERE product_id = ANY($1::int[]) AND quantity > 0`,
    [productIds]
  );
  return rows;
}

/**
 * Atomically decrements stock for each order item at the chosen branch
 * can't both succeed against the same last unit of stock.
 */
async function decrementStockForOrder(client, branchId, items) {
  for (const item of items) {
    const { rows } = await client.query(
      `SELECT quantity FROM stock
       WHERE branch_id = $1 AND product_id = $2
       FOR UPDATE`,
      [branchId, item.productId]
    );
    const current = rows[0]?.quantity ?? 0;
    if (current < item.quantity) {
      const err = new Error(
        `Insufficient stock at branch ${branchId} for product ${item.productId}`
      );
      err.status = 409;
      throw err;
    }
    await client.query(
      `UPDATE stock SET quantity = quantity - $1, updated_at = now()
       WHERE branch_id = $2 AND product_id = $3`,
      [item.quantity, branchId, item.productId]
    );
  }
}

/** Reverses a stock decrement — used on order cancellation. */
async function restoreStockForOrder(client, branchId, items) {
  for (const item of items) {
    await client.query(
      `UPDATE stock SET quantity = quantity + $1, updated_at = now()
       WHERE branch_id = $2 AND product_id = $3`,
      [item.quantity, branchId, item.productId]
    );
  }
}


async function getAllStockWithDetails() {
  const { rows } = await pool.query(
    `SELECT s.branch_id, s.product_id, s.quantity, s.updated_at,
            p.name AS product_name, p.price_cents,
            b.name AS branch_name
     FROM stock s
     JOIN products p ON p.id = s.product_id
     JOIN branches b ON b.id = s.branch_id
     ORDER BY p.name, b.name`
  );
  return rows;
}
module.exports = { getStockForProducts, decrementStockForOrder, restoreStockForOrder, getAllStockWithDetails };
