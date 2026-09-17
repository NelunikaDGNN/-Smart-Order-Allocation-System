CREATE TABLE IF NOT EXISTS branches (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  address      TEXT,
  latitude     DOUBLE PRECISION NOT NULL,
  longitude    DOUBLE PRECISION NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
