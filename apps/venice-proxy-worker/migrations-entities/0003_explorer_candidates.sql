-- Commitments the Worker heard announced on the Arkade operator's live
-- stream (src/explorer-anchors.ts, listenArkadeStream) and has not yet seen
-- confirmed on the chain. A row waits here until the transaction confirms,
-- when it becomes the anchor if it is the newest, or until it goes stale.
-- Public data about a public wallet, no user involved, in the entity
-- database like the anchors.

CREATE TABLE IF NOT EXISTS explorer_candidates (
  network TEXT NOT NULL,
  txid    TEXT NOT NULL,
  seen_at INTEGER NOT NULL,
  PRIMARY KEY (network, txid)
);
