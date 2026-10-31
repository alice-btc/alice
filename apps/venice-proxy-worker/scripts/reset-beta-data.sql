-- One-off reset of the private beta data before the public launch.
--
-- What goes: every anonymous account (no identity, no password, no passkey,
-- no admin role, no paid plan, no invoice, no billing contact, no account
-- email, no promo code or audit entry of its own) with everything hanging off
-- it, the installations nothing references any more, and the statistics
-- (product counters, technical errors, request history, faucet claims).
--
-- What stays: every other account and what it needs to keep working
-- (sessions, plan, quota, the request rows still in flight or from the last
-- 24 hours), invoices and billing contacts, the admin audit trail and access
-- denials, promo codes, installations flagged for review or blocked.
--
-- Run reset-beta-data-count.sql first and compare. Take a Time Travel
-- bookmark before running this against the remote database.
--
-- Safe to run twice: the second run finds nothing left to delete.

DROP TABLE IF EXISTS reset_beta_targets;

CREATE TABLE reset_beta_targets (user_id TEXT PRIMARY KEY) STRICT;

INSERT INTO reset_beta_targets (user_id)
SELECT u.id FROM users u
WHERE NOT EXISTS (SELECT 1 FROM user_identities x WHERE x.user_id = u.id)
  AND NOT EXISTS (SELECT 1 FROM password_credentials x WHERE x.user_id = u.id)
  AND NOT EXISTS (SELECT 1 FROM passkey_credentials x WHERE x.user_id = u.id)
  AND NOT EXISTS (SELECT 1 FROM admin_users x WHERE x.user_id = u.id)
  AND NOT EXISTS (SELECT 1 FROM entitlements x WHERE x.user_id = u.id AND x.plan <> 'free')
  AND NOT EXISTS (SELECT 1 FROM invoices x WHERE x.user_id = u.id)
  AND NOT EXISTS (SELECT 1 FROM billing_contacts x WHERE x.user_id = u.id)
  AND NOT EXISTS (SELECT 1 FROM billing_reminders x WHERE x.user_id = u.id)
  AND NOT EXISTS (SELECT 1 FROM account_emails x WHERE x.user_id = u.id)
  AND NOT EXISTS (SELECT 1 FROM promo_codes x WHERE x.created_by = u.id)
  AND NOT EXISTS (SELECT 1 FROM admin_audit_log x WHERE x.actor_user_id = u.id);

-- Children first, in the order adminDeleteAccount uses, so the result does
-- not depend on foreign key enforcement.
DELETE FROM auth_challenges WHERE user_id IN (SELECT user_id FROM reset_beta_targets);
DELETE FROM email_challenges WHERE link_user_id IN (SELECT user_id FROM reset_beta_targets);
DELETE FROM promo_redemptions WHERE user_id IN (SELECT user_id FROM reset_beta_targets);
DELETE FROM cloud_request_ledger WHERE user_id IN (SELECT user_id FROM reset_beta_targets);
DELETE FROM free_grants WHERE user_id IN (SELECT user_id FROM reset_beta_targets);
DELETE FROM user_installations WHERE user_id IN (SELECT user_id FROM reset_beta_targets);
DELETE FROM sessions WHERE user_id IN (SELECT user_id FROM reset_beta_targets);
DELETE FROM usage_counters WHERE user_id IN (SELECT user_id FROM reset_beta_targets);
DELETE FROM entitlements WHERE user_id IN (SELECT user_id FROM reset_beta_targets);
DELETE FROM username_history WHERE user_id IN (SELECT user_id FROM reset_beta_targets);
UPDATE admin_audit_log SET target_user_id = NULL
  WHERE target_user_id IN (SELECT user_id FROM reset_beta_targets);
UPDATE admin_access_denials SET user_id = NULL
  WHERE user_id IN (SELECT user_id FROM reset_beta_targets);
DELETE FROM technical_events;
DELETE FROM users WHERE id IN (SELECT user_id FROM reset_beta_targets);

-- Installations no remaining account or free grant points to. A flagged
-- installation stays, so a block survives the reset.
DELETE FROM installations
WHERE risk_status = 'normal'
  AND NOT EXISTS (
    SELECT 1 FROM user_installations x
    WHERE x.install_id_hash = installations.install_id_hash
  )
  AND NOT EXISTS (
    SELECT 1 FROM free_grants x
    WHERE x.install_id_hash = installations.install_id_hash
  );

-- Statistics. Request rows of the remaining accounts go too, except those
-- still reserved or from the last 24 hours, which a request in flight may
-- still confirm or refund.
DELETE FROM events_daily;
DELETE FROM cloud_request_ledger
WHERE status <> 'reserved'
  AND created_at < (CAST(strftime('%s', 'now') AS INTEGER) - 86400) * 1000;
DELETE FROM test_wallet_faucet_claims;

DROP TABLE reset_beta_targets;
