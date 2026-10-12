-- The newest settlement of each off-chain operator, as the Worker's own walk
-- of that operator's wallet last found it (src/explorer-anchors.ts). Public
-- data about a public wallet, no user involved: it sits in the entity
-- database, whose handle the public Explorer routes already hold, and never in
-- the account database.
--
-- One row per network. `frontier` is the walk's resume point: the unspent
-- outputs it last reached, as JSON.

CREATE TABLE IF NOT EXISTS explorer_anchors (
  network    TEXT PRIMARY KEY,
  txid       TEXT NOT NULL,
  height     INTEGER NOT NULL,
  timestamp  INTEGER NOT NULL,
  frontier   TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
