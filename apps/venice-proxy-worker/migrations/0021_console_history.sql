-- What the admin console needs the database to remember.
--
-- Three small tables, none of them about a user. No row here carries an
-- account, an installation, an address or anything a client sent.

-- 1. The last run of each scheduled task.
--
-- A cron that stops running fails in silence: expired plans stay active, the
-- satoshi price stops moving, nobody watches the payment host. One row per
-- task, overwritten at each run, so the console can say when each one last
-- ran and whether it worked. Cloudflare keeps the last 100 invocations only,
-- which the ten-minute cron fills in a day.
CREATE TABLE cron_runs (
  job TEXT PRIMARY KEY,
  last_started_at INTEGER NOT NULL,
  last_duration_ms INTEGER NOT NULL CHECK (last_duration_ms >= 0),
  last_ok INTEGER NOT NULL CHECK (last_ok IN (0, 1)),
  -- Null until the task has succeeded once.
  last_ok_at INTEGER,
  -- A short technical line: counts, a height, an error message. Never content.
  last_detail TEXT,
  failures_in_a_row INTEGER NOT NULL DEFAULT 0 CHECK (failures_in_a_row >= 0)
) STRICT;

-- 2. GitHub's public counters, one snapshot per day.
--
-- GitHub gives a running total per release file and keeps repository traffic
-- for 14 days. Kept by day here, the console can show downloads per day and
-- traffic over months. Until now the download history lived in one browser's
-- storage and restarted with every new browser.
--
-- `item` is a release file ("v0.2.9/Alice_0.2.9.dmg") for downloads, a
-- referring host for referrer_views, and empty for the repository totals.
CREATE TABLE github_daily (
  day INTEGER NOT NULL,
  repo TEXT NOT NULL,
  metric TEXT NOT NULL CHECK (metric IN (
    'downloads', 'views', 'view_uniques', 'clones', 'clone_uniques', 'referrer_views'
  )),
  item TEXT NOT NULL DEFAULT '',
  count INTEGER NOT NULL CHECK (count >= 0),
  PRIMARY KEY (day, repo, metric, item)
) STRICT;

-- 3. The operator's own notes on the calendar.
--
-- "0.2.9 announced", "article published": a day and a few words, drawn on
-- the console's curves so a spike can be read against what caused it.
CREATE TABLE admin_annotations (
  id TEXT PRIMARY KEY,
  day INTEGER NOT NULL,
  label TEXT NOT NULL CHECK (length(label) BETWEEN 1 AND 80),
  kind TEXT NOT NULL CHECK (kind IN ('release', 'post', 'article', 'other')),
  created_at INTEGER NOT NULL
) STRICT;

CREATE INDEX admin_annotations_day_idx ON admin_annotations(day);

-- 4. Three more actions in the audit log.
--
-- Unlocking the console's write controls, and adding or removing a note. The
-- action list is a CHECK, and SQLite cannot alter a CHECK, so the table is
-- rebuilt with its rows carried over unchanged.
PRAGMA foreign_keys = OFF;

CREATE TABLE admin_audit_log_v2 (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN (
    'admin_login',
    'admin_bootstrap',
    'view_account',
    'suspend_account',
    'reactivate_account',
    'adjust_credits',
    'delete_account',
    'promote_admin',
    'demote_admin',
    'create_promo',
    'disable_promo',
    'unlock_writes',
    'create_annotation',
    'delete_annotation'
  )),
  target_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  target_support_id TEXT,
  metadata TEXT,
  created_at INTEGER NOT NULL
) STRICT;

INSERT INTO admin_audit_log_v2 (
  id, actor_user_id, action, target_user_id, target_support_id, metadata, created_at
)
SELECT id, actor_user_id, action, target_user_id, target_support_id, metadata, created_at
FROM admin_audit_log;

DROP TABLE admin_audit_log;
ALTER TABLE admin_audit_log_v2 RENAME TO admin_audit_log;

CREATE INDEX admin_audit_log_created_at_idx ON admin_audit_log(created_at);
CREATE INDEX admin_audit_log_actor_idx ON admin_audit_log(actor_user_id);

PRAGMA foreign_keys = ON;
