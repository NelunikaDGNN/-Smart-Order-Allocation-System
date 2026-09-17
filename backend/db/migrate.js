/**
 * Minimal migration runner: applies each .sql file in db/migrations, in
 * filename order, inside a transaction. Idempotent because every statement
 * uses IF NOT EXISTS. Good enough for a 72h assessment — a real project
 * would track applied migrations in a schema_migrations table.
 */
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function migrate() {
  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const file of files) {
      const sql = fs.readFileSync(path.join(dir, file), 'utf8');
      // eslint-disable-next-line no-console
      console.log(`Applying ${file}...`);
      await client.query(sql);
    }
    await client.query('COMMIT');
    // eslint-disable-next-line no-console
    console.log('Migrations applied successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    // eslint-disable-next-line no-console
    console.error('Migration failed, rolled back:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
