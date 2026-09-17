/**
 * Seeds reference data: branches (with static lat/long), products, initial
 * stock per branch, and one admin user + one demo customer user.
 *
 * Branch coordinates are illustrative Sri Lanka locations — replace with
 * your real branch addresses/coordinates.
 */
const bcrypt = require('bcrypt');
const pool = require('../src/config/db');
const env = require('../src/config/env');

const BRANCHES = [
  { name: 'Colombo Fort', address: 'Colombo 01', latitude: 6.9344, longitude: 79.8428 },
  { name: 'Negombo', address: 'Negombo', latitude: 7.2086, longitude: 79.8358 },
  { name: 'Kandy', address: 'Kandy City', latitude: 7.2906, longitude: 80.6337 },
  { name: 'Galle', address: 'Galle Fort', latitude: 6.0329, longitude: 80.2168 },
];

const PRODUCTS = [
  { name: 'Iced Latte', sku: 'BEV-001', price_cents: 65000 },
  { name: 'Chocolate Milk Tea', sku: 'BEV-002', price_cents: 55000 },
  { name: 'Cold Brew', sku: 'BEV-003', price_cents: 70000 },
  { name: 'Croissant', sku: 'FOOD-001', price_cents: 45000 },
  { name: 'Blueberry Muffin', sku: 'FOOD-002', price_cents: 40000 },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Branches
    const branchIds = [];
    for (const b of BRANCHES) {
      const res = await client.query(
        `INSERT INTO branches (name, address, latitude, longitude)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [b.name, b.address, b.latitude, b.longitude]
      );
      branchIds.push(res.rows[0].id);
    }

    // Products
    const productIds = [];
    for (const p of PRODUCTS) {
      const res = await client.query(
        `INSERT INTO products (name, sku, price_cents) VALUES ($1, $2, $3) RETURNING id`,
        [p.name, p.sku, p.price_cents]
      );
      productIds.push(res.rows[0].id);
    }

    // Stock: pseudo-random-ish but deterministic spread across branches so
    // allocation scenarios are interesting (some branches missing some items).
    for (const branchId of branchIds) {
      for (const productId of productIds) {
        const quantity = ((branchId * 7 + productId * 3) % 15); // 0..14, some will be 0
        await client.query(
          `INSERT INTO stock (branch_id, product_id, quantity) VALUES ($1, $2, $3)`,
          [branchId, productId, quantity]
        );
      }
    }

    // Admin user
    const adminHash = await bcrypt.hash('Admin@12345', env.bcryptSaltRounds);
    await client.query(
      `INSERT INTO users (email, password_hash, role, full_name)
       VALUES ($1, $2, 'admin', 'System Admin')
       ON CONFLICT (email) DO NOTHING`,
      ['admin@dartcodes.test', adminHash]
    );

    // Demo customer
    const customerHash = await bcrypt.hash('Customer@12345', env.bcryptSaltRounds);
    await client.query(
      `INSERT INTO users (email, password_hash, role, full_name)
       VALUES ($1, $2, 'customer', 'Demo Customer')
       ON CONFLICT (email) DO NOTHING`,
      ['customer@dartcodes.test', customerHash]
    );

    await client.query('COMMIT');
    // eslint-disable-next-line no-console
    console.log('Seed complete.');
    // eslint-disable-next-line no-console
    console.log('Admin login:    admin@dartcodes.test / Admin@12345');
    // eslint-disable-next-line no-console
    console.log('Customer login: customer@dartcodes.test / Customer@12345');
  } catch (err) {
    await client.query('ROLLBACK');
    // eslint-disable-next-line no-console
    console.error('Seed failed, rolled back:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
