-- Homes
CREATE TABLE IF NOT EXISTS homes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Members
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  home_id TEXT NOT NULL,
  name TEXT NOT NULL,
  order_idx INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  CONSTRAINT fk_members_home_id FOREIGN KEY (home_id) REFERENCES homes(id) ON DELETE CASCADE
);

-- Bills
CREATE TABLE IF NOT EXISTS bills (
  id TEXT PRIMARY KEY,
  home_id TEXT NOT NULL,
  title TEXT NOT NULL,
  total_cents INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  CONSTRAINT fk_bills_home_id FOREIGN KEY (home_id) REFERENCES homes(id) ON DELETE CASCADE,
  CONSTRAINT chk_bills_total_cents_positive CHECK (total_cents > 0)
);

-- Shares
CREATE TABLE IF NOT EXISTS shares (
  id TEXT PRIMARY KEY,
  bill_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  paid_at TEXT DEFAULT NULL,
  idempotency_key TEXT DEFAULT NULL,
  order_idx INTEGER NOT NULL,
  CONSTRAINT fk_shares_bill_id FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
  CONSTRAINT fk_shares_member_id FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  CONSTRAINT chk_shares_amount_cents_positive CHECK (amount_cents > 0),
  CONSTRAINT uq_shares_idempotency_key UNIQUE (idempotency_key)
);
