-- BinQuote Postgres schema (Neon-compatible).
-- Run automatically by lib/db/postgres.ts on first connection.

CREATE TABLE IF NOT EXISTS operators (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  brand_color   TEXT NOT NULL DEFAULT '#FF5A1F',
  phone         TEXT NOT NULL DEFAULT '',
  city          TEXT NOT NULL DEFAULT '',
  state         TEXT NOT NULL DEFAULT '',
  rules         JSONB NOT NULL,
  plan          TEXT NOT NULL DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads (
  id            BIGSERIAL PRIMARY KEY,
  operator_id   TEXT NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT NOT NULL,
  address       TEXT NOT NULL,
  zip           TEXT NOT NULL,
  notes         TEXT NOT NULL DEFAULT '',
  size_id       TEXT NOT NULL,
  debris_type   TEXT NOT NULL,
  rental_days   INT NOT NULL,
  quote_total   NUMERIC(10,2) NOT NULL,
  quote_json    JSONB NOT NULL,
  source_url    TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'new',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_operator_created_idx
  ON leads(operator_id, created_at DESC);

CREATE TABLE IF NOT EXISTS magic_tokens (
  token        TEXT PRIMARY KEY,
  email        TEXT NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL,
  consumed_at  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sessions (
  id           TEXT PRIMARY KEY,
  operator_id  TEXT NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  expires_at   TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
