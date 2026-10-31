-- Read-only preview of reset-beta-data.sql: what it would delete and keep.
-- The target rule must stay identical to the one in reset-beta-data.sql,
-- and reset-beta-data.test.ts checks that the two agree.
WITH targets AS (
  SELECT u.id AS user_id FROM users u
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
    AND NOT EXISTS (SELECT 1 FROM admin_audit_log x WHERE x.actor_user_id = u.id)
)
SELECT
  (SELECT COUNT(*) FROM targets) AS accounts_deleted,
  (SELECT COUNT(*) FROM users WHERE id NOT IN (SELECT user_id FROM targets)) AS accounts_kept,
  (SELECT COUNT(*) FROM users
    WHERE id NOT IN (SELECT user_id FROM targets)
      AND id IN (SELECT user_id FROM password_credentials)) AS kept_with_password,
  (SELECT COUNT(*) FROM users
    WHERE id NOT IN (SELECT user_id FROM targets)
      AND id IN (SELECT user_id FROM entitlements WHERE plan <> 'free')) AS kept_paid,
  (SELECT COUNT(*) FROM admin_users) AS kept_admins,
  (SELECT COUNT(*) FROM installations i
    WHERE i.risk_status = 'normal'
      AND NOT EXISTS (
        SELECT 1 FROM user_installations x
        WHERE x.install_id_hash = i.install_id_hash
          AND x.user_id NOT IN (SELECT user_id FROM targets)
      )
      AND NOT EXISTS (
        SELECT 1 FROM free_grants x
        WHERE x.install_id_hash = i.install_id_hash
          AND x.user_id NOT IN (SELECT user_id FROM targets)
      )) AS installations_deleted,
  (SELECT COUNT(*) FROM installations) AS installations_total,
  (SELECT COUNT(*) FROM installations WHERE risk_status <> 'normal') AS installations_flagged,
  (SELECT COUNT(*) FROM cloud_request_ledger
    WHERE user_id IN (SELECT user_id FROM targets)
      OR (status <> 'reserved'
        AND created_at < (CAST(strftime('%s', 'now') AS INTEGER) - 86400) * 1000)) AS ledger_rows_deleted,
  (SELECT COUNT(*) FROM cloud_request_ledger) AS ledger_rows_total,
  (SELECT COUNT(*) FROM events_daily) AS event_rows_deleted,
  (SELECT COUNT(*) FROM technical_events) AS technical_events_deleted,
  (SELECT COUNT(*) FROM test_wallet_faucet_claims) AS faucet_claims_deleted,
  (SELECT COUNT(*) FROM invoices) AS invoices_kept,
  (SELECT COUNT(*) FROM admin_audit_log) AS audit_rows_kept;
