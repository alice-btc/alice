import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { Miniflare } from 'miniflare';

// scripts/reset-beta-data.sql is run once by hand against production with
// `wrangler d1 execute --remote --file`. These tests run it, and its
// read-only preview, against a database built from the real migrations and
// seeded with one account of every kind the reset must tell apart.

let miniflare: Miniflare;
let db: D1Database;

const DAY = 24 * 60 * 60 * 1_000;
const now = Date.now();
const old = now - 3 * DAY;
const recent = now - 60 * 60 * 1_000;

function statements(sql: string): string[] {
  return sql
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n')
    .split(/;\s*(?:\n|$)/)
    .map(statement => statement.trim())
    .filter(Boolean);
}

async function runFile(name: string) {
  const sql = await readFile(new URL(`../scripts/${name}`, import.meta.url), 'utf8');
  let last: Record<string, unknown>[] = [];
  for (const statement of statements(sql)) {
    last = (await db.prepare(statement).all<Record<string, unknown>>()).results ?? [];
  }
  return last;
}

async function ids(sql: string): Promise<string[]> {
  const rows = (await db.prepare(sql).all<{ id: string }>()).results ?? [];
  return rows.map(row => row.id).sort();
}

async function count(table: string): Promise<number> {
  const row = await db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).first<{ n: number }>();
  return row?.n ?? 0;
}

async function seed() {
  const users: Array<[string, string]> = [
    ['anon-a', 'active'],
    ['anon-b', 'suspended'],
    ['anon-c', 'active'],
    ['named', 'active'],
    ['admin', 'active'],
    ['paid', 'active'],
    ['expired-invoice', 'active'],
    ['email-only', 'active'],
  ];
  const rows: string[] = [];
  for (const [id, status] of users) {
    rows.push(`INSERT INTO users (id, status, created_at, updated_at, username)
      VALUES ('${id}', '${status}', ${old}, ${old}, '${id}')`);
    const plan = id === 'paid'
      ? `'cloud', ${now + 30 * DAY}`
      : `'free', NULL`;
    rows.push(`INSERT INTO entitlements (user_id, plan, plan_expires_at, created_at, updated_at)
      VALUES ('${id}', ${plan}, ${old}, ${old})`);
  }
  rows.push(
    `INSERT INTO password_credentials (user_id, password_hash, algorithm, iterations, salt, created_at, updated_at)
      VALUES ('named', 'h', 'pbkdf2-sha256', 100000, 's', ${old}, ${old})`,
    `INSERT INTO password_credentials (user_id, password_hash, algorithm, iterations, salt, created_at, updated_at)
      VALUES ('admin', 'h', 'pbkdf2-sha256', 100000, 's', ${old}, ${old})`,
    `INSERT INTO admin_users (user_id, role, granted_at) VALUES ('admin', 'admin', ${old})`,
    `INSERT INTO invoices (id, user_id, provider_invoice_id, plan, months, amount_cents, status, created_at, updated_at)
      VALUES ('inv-paid', 'paid', 'btcpay-1', 'cloud', 1, 500, 'paid', ${old}, ${old})`,
    `INSERT INTO invoices (id, user_id, provider_invoice_id, plan, months, amount_cents, status, created_at, updated_at)
      VALUES ('inv-expired', 'expired-invoice', 'btcpay-2', 'cloud', 1, 500, 'expired', ${old}, ${old})`,
    `INSERT INTO billing_contacts (user_id, email_ciphertext, email_masked, created_at, updated_at)
      VALUES ('paid', 'c', 'p***@example.com', ${old}, ${old})`,
    `INSERT INTO user_identities (id, user_id, provider, provider_subject, display_label, verified_at, created_at, last_used_at)
      VALUES ('ident-q', 'email-only', 'email', 'hash-q', 'q***@example.com', ${old}, ${old}, ${old})`,

    `INSERT INTO installations (install_id_hash, first_seen_at, last_seen_at, risk_status)
      VALUES ('i-a', ${old}, ${old}, 'normal')`,
    `INSERT INTO installations (install_id_hash, first_seen_at, last_seen_at, risk_status)
      VALUES ('i-b', ${old}, ${old}, 'blocked')`,
    `INSERT INTO installations (install_id_hash, first_seen_at, last_seen_at, risk_status)
      VALUES ('i-shared', ${old}, ${old}, 'normal')`,
    `INSERT INTO installations (install_id_hash, first_seen_at, last_seen_at, risk_status)
      VALUES ('i-orphan', ${old}, ${old}, 'normal')`,
    `INSERT INTO installations (install_id_hash, first_seen_at, last_seen_at, risk_status)
      VALUES ('i-paid', ${old}, ${old}, 'normal')`,
    `INSERT INTO user_installations (user_id, install_id_hash, linked_at, last_used_at)
      VALUES ('anon-a', 'i-a', ${old}, ${old})`,
    `INSERT INTO user_installations (user_id, install_id_hash, linked_at, last_used_at)
      VALUES ('anon-b', 'i-b', ${old}, ${old})`,
    `INSERT INTO user_installations (user_id, install_id_hash, linked_at, last_used_at)
      VALUES ('anon-c', 'i-shared', ${old}, ${old})`,
    `INSERT INTO user_installations (user_id, install_id_hash, linked_at, last_used_at)
      VALUES ('named', 'i-shared', ${old}, ${old})`,
    `INSERT INTO user_installations (user_id, install_id_hash, linked_at, last_used_at)
      VALUES ('paid', 'i-paid', ${old}, ${old})`,
    `INSERT INTO free_grants (id, user_id, install_id_hash, granted_at)
      VALUES ('g-a', 'anon-a', 'i-a', ${old})`,
    `INSERT INTO free_grants (id, user_id, install_id_hash, granted_at)
      VALUES ('g-named', 'named', 'i-shared', ${old})`,

    `INSERT INTO usage_counters (user_id, free_cloud_requests_used, updated_at)
      VALUES ('anon-a', 5, ${old})`,
    `INSERT INTO usage_counters (user_id, free_cloud_requests_used, updated_at)
      VALUES ('named', 3, ${old})`,
    `INSERT INTO cloud_request_ledger (id, user_id, idempotency_key, status, created_at)
      VALUES ('l-anon-old', 'anon-a', 'k1', 'confirmed', ${old})`,
    `INSERT INTO cloud_request_ledger (id, user_id, idempotency_key, status, created_at)
      VALUES ('l-named-old', 'named', 'k2', 'confirmed', ${old})`,
    `INSERT INTO cloud_request_ledger (id, user_id, idempotency_key, status, created_at)
      VALUES ('l-named-recent', 'named', 'k3', 'confirmed', ${recent})`,
    `INSERT INTO cloud_request_ledger (id, user_id, idempotency_key, status, created_at)
      VALUES ('l-named-reserved', 'named', 'k4', 'reserved', ${old})`,
    `INSERT INTO cloud_request_ledger (id, user_id, idempotency_key, status, created_at)
      VALUES ('l-paid-old', 'paid', 'k5', 'refunded', ${old})`,

    `INSERT INTO sessions (id, user_id, access_token_hash, access_expires_at, refresh_token_hash, refresh_expires_at, created_at, last_used_at)
      VALUES ('s-a', 'anon-a', 'ta', ${now + DAY}, 'ra', ${now + DAY}, ${old}, ${old})`,
    `INSERT INTO sessions (id, user_id, access_token_hash, access_expires_at, refresh_token_hash, refresh_expires_at, created_at, last_used_at)
      VALUES ('s-named', 'named', 'tn', ${now + DAY}, 'rn', ${now + DAY}, ${old}, ${old})`,
    `INSERT INTO username_history (username, user_id, reserved_until, created_at)
      VALUES ('anon-a-old', 'anon-a', ${now + DAY}, ${old})`,
    `INSERT INTO username_history (username, user_id, reserved_until, created_at)
      VALUES ('named-old', 'named', ${now + DAY}, ${old})`,
    `INSERT INTO auth_challenges (id, purpose, user_id, challenge, expires_at, created_at)
      VALUES ('ac-a', 'passkey_registration', 'anon-a', 'c', ${now + DAY}, ${old})`,
    `INSERT INTO email_challenges (email_lookup, code_hash, expires_at, created_at, updated_at, link_user_id)
      VALUES ('lookup-a', 'h', ${now + DAY}, ${old}, ${old}, 'anon-a')`,

    `INSERT INTO technical_events (id, category, code, status, user_id, created_at)
      VALUES ('t-a', 'venice', 'timeout', 504, 'anon-a', ${old})`,
    `INSERT INTO technical_events (id, category, code, status, user_id, created_at)
      VALUES ('t-none', 'email', 'bounce', 502, NULL, ${old})`,
    `INSERT INTO admin_audit_log (id, actor_user_id, action, target_user_id, target_support_id, created_at)
      VALUES ('audit-a', 'admin', 'view_account', 'anon-a', 'anon-a', ${old})`,
    `INSERT INTO admin_audit_log (id, actor_user_id, action, target_user_id, target_support_id, created_at)
      VALUES ('audit-named', 'admin', 'view_account', 'named', 'named', ${old})`,
    `INSERT INTO admin_access_denials (id, user_id, reason, path, created_at)
      VALUES ('deny-a', 'anon-a', 'not_admin', '/admin/accounts', ${old})`,
    `INSERT INTO events_daily (day, event_name, platform, app_version, count)
      VALUES (20380, 'app_opened', 'web', '0.2.5', 4)`,
    `INSERT INTO events_daily (day, event_name, platform, app_version, count)
      VALUES (20381, 'chat_opened', 'web', '0.2.5', 2)`,
    `INSERT INTO test_wallet_faucet_claims (claimer_hash, claimed_at) VALUES ('claimer-1', ${old})`,
  );
  for (const sql of rows) await db.prepare(sql).run();
}

beforeEach(async () => {
  miniflare = new Miniflare({
    modules: true,
    script: 'export default { async fetch() { return new Response("ok") } }',
    d1Databases: ['ACCOUNT_DB'],
  });
  db = await miniflare.getD1Database('ACCOUNT_DB');
  const migrationsUrl = new URL('../migrations/', import.meta.url);
  const migrationNames = (await readdir(migrationsUrl))
    .filter(name => /^\d+.*\.sql$/.test(name))
    .sort();
  for (const migrationName of migrationNames) {
    const migration = await readFile(new URL(migrationName, migrationsUrl), 'utf8');
    for (const statement of migration.split(/;\s*(?:\n|$)/).map(sql => sql.trim()).filter(Boolean)) {
      await db.prepare(statement).run();
    }
  }
  await seed();
});

afterEach(async () => {
  await miniflare.dispose();
});

describe('beta data reset', () => {
  it('previews exactly what the reset then deletes', async () => {
    const [preview] = await runFile('reset-beta-data-count.sql');
    assert.deepEqual(preview, {
      accounts_deleted: 3,
      accounts_kept: 5,
      kept_with_password: 2,
      kept_paid: 1,
      kept_admins: 1,
      installations_deleted: 2,
      installations_total: 5,
      installations_flagged: 1,
      ledger_rows_deleted: 3,
      ledger_rows_total: 5,
      event_rows_deleted: 2,
      technical_events_deleted: 2,
      faucet_claims_deleted: 1,
      invoices_kept: 2,
      audit_rows_kept: 2,
    });

    await runFile('reset-beta-data.sql');

    assert.equal(await count('users'), 5);
    assert.equal(await count('installations'), 3);
    assert.equal(await count('cloud_request_ledger'), 2);
  });

  it('deletes anonymous accounts and keeps every account with something of its own', async () => {
    await runFile('reset-beta-data.sql');

    assert.deepEqual(
      await ids('SELECT id FROM users'),
      ['admin', 'email-only', 'expired-invoice', 'named', 'paid'],
    );
    assert.deepEqual(await ids('SELECT id FROM sessions'), ['s-named']);
    assert.deepEqual(await ids('SELECT user_id AS id FROM usage_counters'), ['named']);
    assert.deepEqual(await ids('SELECT username AS id FROM username_history'), ['named-old']);
    assert.deepEqual(await ids('SELECT id FROM free_grants'), ['g-named']);
    assert.equal(await count('auth_challenges'), 0);
    assert.equal(await count('email_challenges'), 0);
    assert.equal(await count('invoices'), 2);
    assert.equal(await count('billing_contacts'), 1);
    assert.equal(await count('user_identities'), 1);
    assert.equal(
      (await db.prepare(`SELECT plan FROM entitlements WHERE user_id = 'paid'`).first<{ plan: string }>())?.plan,
      'cloud',
    );
  });

  it('keeps installations still in use or flagged, and drops the rest', async () => {
    await runFile('reset-beta-data.sql');
    assert.deepEqual(
      await ids('SELECT install_id_hash AS id FROM installations'),
      ['i-b', 'i-paid', 'i-shared'],
    );
    assert.deepEqual(
      await ids('SELECT install_id_hash AS id FROM user_installations'),
      ['i-paid', 'i-shared'],
    );
  });

  it('clears the statistics but keeps request rows a request in flight may still need', async () => {
    await runFile('reset-beta-data.sql');
    assert.equal(await count('events_daily'), 0);
    assert.equal(await count('technical_events'), 0);
    assert.equal(await count('test_wallet_faucet_claims'), 0);
    assert.deepEqual(
      await ids('SELECT id FROM cloud_request_ledger'),
      ['l-named-recent', 'l-named-reserved'],
    );
  });

  it('keeps the admin audit trail, with deleted accounts unlinked', async () => {
    await runFile('reset-beta-data.sql');
    const audit = (await db.prepare(`
      SELECT id, target_user_id, target_support_id FROM admin_audit_log ORDER BY id
    `).all()).results;
    assert.deepEqual(audit, [
      { id: 'audit-a', target_user_id: null, target_support_id: 'anon-a' },
      { id: 'audit-named', target_user_id: 'named', target_support_id: 'named' },
    ]);
    const denial = await db.prepare(`SELECT user_id FROM admin_access_denials`).first();
    assert.deepEqual(denial, { user_id: null });
  });

  it('can run twice and leaves no work table behind', async () => {
    await runFile('reset-beta-data.sql');
    await runFile('reset-beta-data.sql');
    assert.equal(await count('users'), 5);
    const leftover = await db.prepare(`
      SELECT name FROM sqlite_master WHERE name = 'reset_beta_targets'
    `).first();
    assert.equal(leftover, null);
    const [preview] = await runFile('reset-beta-data-count.sql');
    assert.equal(preview.accounts_deleted, 0);
    assert.equal(preview.installations_deleted, 0);
  });
});
