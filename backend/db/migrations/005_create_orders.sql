CREATE TABLE IF NOT EXISTS orders (
  id               SERIAL PRIMARY KEY,
  customer_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  branch_id        INTEGER REFERENCES branches(id) ON DELETE SET NULL,
  customer_lat     DOUBLE PRECISION NOT NULL,
  customer_lng     DOUBLE PRECISION NOT NULL,
  status           VARCHAR(20) NOT NULL DEFAULT 'pending'
                   CHECK (status IN (
                     'pending', 'confirmed', 'preparing',
                     'dispatched', 'delivered', 'cancelled', 'unfulfillable'
                   )),
  note             TEXT,                 -- customer's free-text order note
  note_category    VARCHAR(64),          -- ML classifier output
  note_confidence  REAL,                 -- ML classifier confidence (0..1)
  allocation_score REAL,                 -- score of the branch that was chosen, for auditability
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_branch_id ON orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
