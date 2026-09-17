CREATE TABLE IF NOT EXISTS stock (
  branch_id   INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (branch_id, product_id)
);

-- Acts as our persistent "inverted index": given a product, quickly find
-- which branches carry it and in what quantity, without a full table scan.
CREATE INDEX IF NOT EXISTS idx_stock_product_branch
  ON stock (product_id, branch_id, quantity);

-- Partial index: only rows with actual stock are ever useful for allocation,
-- so we don't waste index space/scan time on zero-stock rows.
CREATE INDEX IF NOT EXISTS idx_stock_in_stock
  ON stock (product_id, branch_id)
  WHERE quantity > 0;
