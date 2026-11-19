import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { Miniflare } from 'miniflare';
import worker, { type Env } from './index.ts';

// The console's reading pages and its write lock. Every figure is checked
// against rows put in a database built from the real migrations: a chain of
// aggregations that is only ever run against an empty table proves nothing.

let miniflare: Miniflare;
let db: D1Database;
let env: Env;
let sentCode = '';
let realFetch: typeof fetch;
/** What the stubbed network was asked, so a test can check nothing leaked. */
let outbound: string[] = [];

const AUTH_SECRET = 'alice-test-hmac-secret-with-more-than-thirty-two-bytes';
const BOOTSTRAP_SECRET = 'alice-test-bootstrap-secret-with-more-than-32-bytes';
const ADMIN_PASSWORD = 'a-very-strong-and-long-password-1';
const DAY = 24 * 60 * 60 * 1_000;

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
  sentCode = '';
  env = {
    ACCOUNT_DB: db,
    EMAIL: {
      async send(message: { subject: string; text: string }) {
        sentCode = message.text.match(/\b(\d{6})\b/)?.[1] ?? '';
        return { messageId: 'message-test' };
      },
    },
    AUTH_EMAIL_FROM: 'login@alice.example',
    AUTH_HMAC_KEY: AUTH_SECRET,
    ADMIN_BOOTSTRAP_SECRET: BOOTSTRAP_SECRET,
    ADMIN_CONSOLE_ENABLED: 'true',
    VENICE_API_KEY: 'venice-test',
    ALLOWED_ORIGINS: 'https://alice.example',
    FREE_CLOUD_MODELS: 'e2ee-gpt-oss-120b-p',
    FREE_CLOUD_MAX_TOKENS: '2048',
  } as unknown as Env;

  // No test may reach the network. By default every outside service is down,
  // which is also the case the health page has to survive.
  realFetch = globalThis.fetch;
  outbound = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    outbound.push(String(input));
    throw new Error('network is off in tests');
  }) as typeof fetch;
});

afterEach(async () => {
  globalThis.fetch = realFetch;
  await miniflare.dispose();
});

function jsonRequest(path: string, body: unknown, headers: Record<string, string> = {}, method = 'POST') {
  return new Request(`https://proxy.test${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      'cf-connecting-ip': '203.0.113.8',
      'x-alice-install-id': 'install-test-00000000000001',
      ...headers,
    },
    body: method === 'GET' ? undefined : JSON.stringify(body),
  });
}

async function registerAccount(prefix: string) {
  const headers = { 'x-alice-install-id': `install-${prefix}-000000000000` };
  const email = `${prefix}@example.com`;
  const anonymous = await worker.fetch(jsonRequest('/auth/anonymous', {}, headers), env);
  assert.equal(anonymous.status, 200);
  const { access_token } = await anonymous.json() as { access_token: string };
  const authed = { ...headers, authorization: `Bearer ${access_token}` };
  assert.equal(
    (await worker.fetch(jsonRequest('/account/identities/email/start', { email }, authed), env)).status,
    200,
  );
  assert.equal(
    (await worker.fetch(
      jsonRequest('/account/identities/email/verify', { email, code: sentCode }, authed),
      env,
    )).status,
    200,
  );
  const named = await worker.fetch(
    jsonRequest('/account/password', { password: ADMIN_PASSWORD, prefix, suffix: 'wonderland' }, authed, 'PUT'),
    env,
  );
  assert.equal(named.status, 200);
  const { account } = await named.json() as { account: { user_id: string; username: string } };
  return { access_token, account };
}

async function bootstrapAdmin(prefix: string) {
  const account = await registerAccount(prefix);
  const res = await worker.fetch(
    jsonRequest('/admin/api/bootstrap', {}, {
      authorization: `Bearer ${account.access_token}`,
      'x-admin-bootstrap-secret': BOOTSTRAP_SECRET,
    }),
    env,
  );
  assert.equal(res.status, 200);
  return account;
}

function bearer(token: string, extra: Record<string, string> = {}) {
  return { authorization: `Bearer ${token}`, ...extra };
}

async function get<T>(path: string, token: string): Promise<T> {
  const res = await worker.fetch(jsonRequest(path, {}, bearer(token), 'GET'), env);
  assert.equal(res.status, 200, `${path} answered ${res.status}`);
  return await res.json() as T;
}

async function unlock(token: string): Promise<string> {
  const res = await worker.fetch(
    jsonRequest('/admin/api/unlock', { admin_password: ADMIN_PASSWORD }, bearer(token)),
    env,
  );
  assert.equal(res.status, 200);
  return (await res.json() as { unlock_token: string }).unlock_token;
}

describe('the write lock', () => {
  it('refuses to unlock on a wrong password', async () => {
    const admin = await bootstrapAdmin('lock-one');
    const res = await worker.fetch(
      jsonRequest('/admin/api/unlock', { admin_password: 'not-the-password' }, bearer(admin.access_token)),
      env,
    );
    assert.equal(res.status, 403);
  });

  it('refuses a write with neither a password nor an unlock', async () => {
    const admin = await bootstrapAdmin('lock-two');
    const target = await registerAccount('lock-two-target');
    const res = await worker.fetch(
      jsonRequest(`/admin/api/accounts/${encodeURIComponent(target.account.username)}/suspend`,
        { reason: 'test' }, bearer(admin.access_token)),
      env,
    );
    assert.equal(res.status, 403);
  });

  it('lets an unlocked console write without retyping the password', async () => {
    const admin = await bootstrapAdmin('lock-three');
    const target = await registerAccount('lock-three-target');
    const token = await unlock(admin.access_token);
    const res = await worker.fetch(
      jsonRequest(`/admin/api/accounts/${encodeURIComponent(target.account.username)}/suspend`,
        { reason: 'test' }, bearer(admin.access_token, { 'x-admin-unlock': token })),
      env,
    );
    assert.equal(res.status, 200);
    const promo = await worker.fetch(
      jsonRequest('/admin/api/promo-codes', { code: 'ALICE-LOCK', credits: 5 },
        bearer(admin.access_token, { 'x-admin-unlock': token })),
      env,
    );
    assert.equal(promo.status, 200);
  });

  it('never lets the unlock stand in for the password on a deletion or a role change', async () => {
    const admin = await bootstrapAdmin('lock-four');
    const target = await registerAccount('lock-four-target');
    const token = await unlock(admin.access_token);
    const headers = bearer(admin.access_token, { 'x-admin-unlock': token });
    const supportId = encodeURIComponent(target.account.username);

    const deleted = await worker.fetch(
      jsonRequest(`/admin/api/accounts/${supportId}`, { confirm: target.account.username }, headers, 'DELETE'),
      env,
    );
    assert.equal(deleted.status, 403);
    const promoted = await worker.fetch(
      jsonRequest('/admin/api/admins', { account: target.account.username, role: 'support' }, headers),
      env,
    );
    assert.equal(promoted.status, 403);
  });

  it('refuses a forged, an expired and a borrowed unlock', async () => {
    const admin = await bootstrapAdmin('lock-five');
    const target = await registerAccount('lock-five-target');
    const path = `/admin/api/accounts/${encodeURIComponent(target.account.username)}/suspend`;
    const token = await unlock(admin.access_token);
    const [, signature] = token.split('.');

    const attempts = [
      `${Date.now() + 5 * 60_000}.${signature}`,   // a real signature on another expiry
      `${Date.now() - 1_000}.${signature}`,          // already expired
      `${Date.now() + 60 * 60_000}.${signature}`,   // further out than an unlock ever lasts
      'not-a-token',
    ];
    for (const forged of attempts) {
      const res = await worker.fetch(
        jsonRequest(path, { reason: 'test' }, bearer(admin.access_token, { 'x-admin-unlock': forged })),
        env,
      );
      assert.equal(res.status, 403, `unlock "${forged.slice(0, 12)}…" must be refused`);
    }

    // A second admin cannot use the first one's unlock.
    await worker.fetch(
      jsonRequest('/admin/api/admins',
        { account: target.account.username, role: 'admin', admin_password: ADMIN_PASSWORD },
        bearer(admin.access_token)),
      env,
    );
    const third = await registerAccount('lock-five-other');
    const borrowed = await worker.fetch(
      jsonRequest(`/admin/api/accounts/${encodeURIComponent(third.account.username)}/suspend`,
        { reason: 'test' }, bearer(target.access_token, { 'x-admin-unlock': token })),
      env,
    );
    assert.equal(borrowed.status, 403);
  });

  it('does not let a read-only operator unlock anything', async () => {
    const admin = await bootstrapAdmin('lock-six');
    const support = await registerAccount('lock-six-support');
    await worker.fetch(
      jsonRequest('/admin/api/admins',
        { account: support.account.username, role: 'support', admin_password: ADMIN_PASSWORD },
        bearer(admin.access_token)),
      env,
    );
    const res = await worker.fetch(
      jsonRequest('/admin/api/unlock', { admin_password: ADMIN_PASSWORD }, bearer(support.access_token)),
      env,
    );
    assert.equal(res.status, 403);
  });
});

describe('account filters', () => {
  it('filters by plan and status and ignores anything outside the closed lists', async () => {
    const admin = await bootstrapAdmin('filter-admin');
    const payer = await registerAccount('filter-payer');
    const now = Date.now();
    await db.prepare(`
      UPDATE entitlements SET plan = 'cloud', plan_expires_at = ? WHERE user_id = ?
    `).bind(now + 10 * DAY, payer.account.user_id).run();

    type List = { accounts: { support_id: string; plan_expires_at: number | null }[] };
    const cloud = await get<List>('/admin/api/accounts?plan=cloud', admin.access_token);
    assert.deepEqual(cloud.accounts.map(a => a.support_id), [payer.account.username]);
    assert.equal(cloud.accounts[0].plan_expires_at, now + 10 * DAY);

    const free = await get<List>('/admin/api/accounts?plan=free', admin.access_token);
    assert.deepEqual(free.accounts.map(a => a.support_id), [admin.account.username]);

    const suspended = await get<List>('/admin/api/accounts?status=suspended', admin.access_token);
    assert.equal(suspended.accounts.length, 0);

    // Not on the list, so it is not a filter, and certainly not SQL.
    const injected = await get<List>(
      `/admin/api/accounts?plan=${encodeURIComponent("cloud' OR '1'='1")}&status=x`,
      admin.access_token,
    );
    assert.equal(injected.accounts.length, 2);
  });
});

describe('money', () => {
  it('adds up invoices, subscriptions and bytes without naming anyone', async () => {
    const admin = await bootstrapAdmin('money-admin');
    const payer = await registerAccount('money-payer');
    const now = Date.now();
    const invoice = (id: string, status: string, sats: number | null, at: number, months = 1) =>
      db.prepare(`
        INSERT INTO invoices (id, user_id, provider, provider_invoice_id, plan, months,
          amount_cents, amount_sats, currency, status, credited_at, created_at, updated_at)
        VALUES (?, ?, 'btcpay', ?, 'cloud', ?, 900, ?, 'BTC', ?, ?, ?, ?)
      `).bind(id, payer.account.user_id, `btcpay-${id}`, months, sats, status,
        status === 'paid' ? at : null, at, at).run();
    await invoice('inv-1', 'paid', 10_000, now - 2 * DAY);
    await invoice('inv-2', 'paid', 12_000, now - 3 * DAY, 3);
    await invoice('inv-3', 'expired', null, now - 4 * DAY);
    await invoice('inv-4', 'paid', 9_000, now - 40 * DAY);
    await db.prepare(`
      UPDATE entitlements SET plan = 'cloud', plan_expires_at = ?,
        input_bytes_limit = 1000, output_bytes_limit = 1000 WHERE user_id = ?
    `).bind(now + 5 * DAY, payer.account.user_id).run();
    await db.prepare(`
      UPDATE usage_counters SET input_bytes_used = 100, output_bytes_used = 900 WHERE user_id = ?
    `).bind(payer.account.user_id).run();
    await db.prepare(`
      INSERT INTO billing_reminders (user_id, plan_expires_at, kind, sent_at) VALUES (?, ?, 't_minus_3', ?)
    `).bind(payer.account.user_id, now + 5 * DAY, now - DAY).run();
    await db.prepare(`
      INSERT INTO cloud_request_ledger (id, user_id, idempotency_key, request_type, status, units,
        input_bytes, reserved_output_bytes, output_bytes, created_at, confirmed_at)
      VALUES ('led-1', ?, 'key-1', 'standard', 'confirmed', 1, 200, 0, 700, ?, ?)
    `).bind(payer.account.user_id, now - DAY, now - DAY).run();

    const money = await get<{
      revenue: {
        current: { count: number; cents: number; sats: number };
        previous: { count: number };
        series: { sats: number }[];
        monthly: { count: number }[];
        months_mix: { months: number; count: number }[];
      };
      invoices: { created: number; paid: number; paid_percent: number };
      subscriptions: { active: number; expiring_7d: number; expiring_30d: number; next_expiries: number[]; reminders: { kind: string; count: number }[] };
      usage: {
        series: { count: number; output_bytes: number }[];
        by_plan: { plan: string; count: number; output_bytes: number }[];
        allowance: { accounts: number; near_limit: number; output_used: number };
      };
    }>('/admin/api/money?days=7', admin.access_token);

    assert.deepEqual(money.revenue.current, { count: 2, cents: 1800, sats: 22_000 });
    // The invoices above settle in BTC; the cents stay in the anchor currency.
    assert.equal(money.fiat_currency, 'EUR');
    assert.equal(money.revenue.previous.count, 0);
    assert.equal(money.revenue.series.length, 7);
    assert.equal(money.revenue.series.reduce((sum, point) => sum + point.sats, 0), 22_000);
    assert.equal(money.revenue.monthly.reduce((sum, row) => sum + row.count, 0), 3);
    assert.deepEqual(money.revenue.months_mix, [{ months: 1, count: 2 }, { months: 3, count: 1 }]);
    assert.deepEqual(
      { created: money.invoices.created, paid: money.invoices.paid, percent: money.invoices.paid_percent },
      { created: 3, paid: 2, percent: 66.7 },
    );
    assert.equal(money.subscriptions.active, 1);
    assert.equal(money.subscriptions.expiring_7d, 1);
    assert.deepEqual(money.subscriptions.next_expiries, [now + 5 * DAY]);
    assert.deepEqual(money.subscriptions.reminders, [{ kind: 't_minus_3', count: 1 }]);
    assert.equal(money.usage.series.reduce((sum, point) => sum + point.output_bytes, 0), 700);
    assert.deepEqual(money.usage.by_plan, [{ plan: 'cloud', count: 1, input_bytes: 200, output_bytes: 700 }]);
    assert.deepEqual(
      { accounts: money.usage.allowance.accounts, near: money.usage.allowance.near_limit },
      { accounts: 1, near: 1 },
    );

    // Totals only: no account, no invoice id, no provider reference.
    const raw = JSON.stringify(money);
    for (const secret of [payer.account.user_id, payer.account.username, 'inv-1', 'btcpay-inv-1']) {
      assert.ok(!raw.includes(secret), `the money page must not carry ${secret}`);
    }
  });

  it('falls back to 30 days on a period it does not offer', async () => {
    const admin = await bootstrapAdmin('money-period');
    const money = await get<{ period_days: number; revenue: { series: unknown[] } }>(
      '/admin/api/money?days=12', admin.access_token,
    );
    assert.equal(money.period_days, 30);
    assert.equal(money.revenue.series.length, 30);
    const day = await get<{ period_days: number; bucket_ms: number; revenue: { series: unknown[] } }>(
      '/admin/api/money?days=1', admin.access_token,
    );
    assert.deepEqual([day.period_days, day.bucket_ms, day.revenue.series.length], [1, 3_600_000, 24]);
  });
});

describe('growth', () => {
  it('counts the period against the one before and groups retention by week', async () => {
    const admin = await bootstrapAdmin('growth-admin');
    const now = Date.now();
    const install = (id: string, first: number, last: number, platform: string | null) =>
      db.prepare(`
        INSERT INTO installations (install_id_hash, first_seen_at, last_seen_at, platform, app_version)
        VALUES (?, ?, ?, ?, '0.2.9')
      `).bind(id, first, last, platform).run();
    await install('i-new-1', now - 2 * DAY, now - DAY / 2, 'web');
    await install('i-new-2', now - 3 * DAY, now - 3 * DAY, 'android');
    await install('i-old-1', now - 10 * DAY, now - DAY, 'web');
    await install('i-old-2', now - 40 * DAY, now - 39 * DAY - DAY / 2, null);

    const growth = await get<{
      installations: { current: number; previous: number };
      series: {
        installations: { count: number }[];
        installations_by_platform: { key: string; count: number }[];
      };
      retention_by_week: { size: number; d1: number; d7: number }[];
      active_versions_30d: { platform: string; count: number }[];
    }>('/admin/api/growth?days=7', admin.access_token);

    // The two accounts registered above each brought an installation too.
    const created = growth.installations.current;
    assert.ok(created >= 2, 'the two recent installations are in the current period');
    assert.equal(growth.installations.previous, 1);
    assert.equal(growth.series.installations.reduce((sum, p) => sum + p.count, 0), created);
    const android = growth.series.installations_by_platform.filter(row => row.key === 'android');
    assert.equal(android.reduce((sum, row) => sum + row.count, 0), 1);
    // Of the four planted, only the 10-day-old one was seen a week later.
    const cohorts = growth.retention_by_week;
    assert.equal(cohorts.reduce((sum, week) => sum + week.d7, 0), 1);
    assert.ok(cohorts.reduce((sum, week) => sum + week.size, 0) >= 4);
    assert.ok(growth.active_versions_30d.some(row => row.platform === 'web'));
  });
});

describe('errors', () => {
  it('keeps BTCPay news out of the error counts and tells failures from refusals', async () => {
    const admin = await bootstrapAdmin('errors-admin');
    const now = Date.now();
    const event = (id: string, category: string, code: string, status: number, at: number) =>
      db.prepare(`
        INSERT INTO technical_events (id, category, code, status, user_id, created_at)
        VALUES (?, ?, ?, ?, NULL, ?)
      `).bind(id, category, code, status, at).run();
    await db.prepare('DELETE FROM technical_events').run();
    await event('e1', 'auth', 'invalid_password', 400, now - DAY);
    await event('e2', 'auth', 'invalid_password', 400, now - 2 * DAY);
    await event('e3', 'venice', 'upstream_http_502', 502, now - DAY);
    await event('e4', 'venice', 'btcpay_down', 503, now - 3 * DAY);
    await event('e5', 'venice', 'btcpay_up', 200, now - 3 * DAY + 3_600_000);
    await event('e6', 'auth', 'invalid_password', 400, now - 10 * DAY);

    const errors = await get<{
      total: { current: number; previous: number };
      server: { current: number };
      codes: { code: string; count: number; previous: number }[];
      series: { key: string; count: number }[];
      btcpay_events: { code: string }[];
    }>('/admin/api/errors?days=7', admin.access_token);

    assert.deepEqual(errors.total, { current: 3, previous: 1 });
    assert.equal(errors.server.current, 1);
    assert.deepEqual(
      errors.codes.map(row => [row.code, row.count, row.previous]),
      [['invalid_password', 2, 1], ['upstream_http_502', 1, 0]],
    );
    assert.ok(errors.series.every(row => row.key === 'auth' || row.key === 'venice'));
    assert.equal(errors.series.reduce((sum, row) => sum + row.count, 0), 3);
    assert.deepEqual(errors.btcpay_events.map(row => row.code), ['btcpay_up', 'btcpay_down']);
  });
});

describe('health', () => {
  it('still answers, and says what it could not read, when every outside service is down', async () => {
    const admin = await bootstrapAdmin('health-admin');
    Object.assign(env, { CF_ANALYTICS_API_TOKEN: 'cf-token-test', CF_ACCOUNT_ID: 'account-test' });
    const health = await get<{
      checks: { key: string; level: string; summary: string }[];
      alerts: { key: string }[];
    }>('/admin/api/health', admin.access_token);
    const level = (key: string) => health.checks.find(check => check.key === key)?.level;

    assert.equal(level('database'), 'ok');
    assert.equal(level('payments'), 'ok');
    // Unreachable is "unknown", never a false "fine" and never an alarm.
    assert.equal(level('worker'), 'unknown');
    assert.equal(level('venice_balance'), 'unknown');
    assert.deepEqual(health.alerts, []);
  });

  it('turns red while BTCPay is down and green again once it is back', async () => {
    const admin = await bootstrapAdmin('health-btcpay');
    const now = Date.now();
    await db.prepare(`
      INSERT INTO technical_events (id, category, code, status, user_id, created_at)
      VALUES ('down', 'venice', 'btcpay_down', 503, NULL, ?)
    `).bind(now - 3_600_000).run();
    type Health = { checks: { key: string; level: string }[]; alerts: { key: string; level: string }[] };
    const down = await get<Health>('/admin/api/health', admin.access_token);
    assert.deepEqual(down.alerts.map(alert => [alert.key, alert.level]), [['payments', 'bad']]);

    await db.prepare(`
      INSERT INTO technical_events (id, category, code, status, user_id, created_at)
      VALUES ('up', 'venice', 'btcpay_up', 200, NULL, ?)
    `).bind(now - 60_000).run();
    const back = await get<Health>('/admin/api/health', admin.access_token);
    assert.deepEqual(back.alerts, []);
  });

  it('warns when Private Cloud refunds more than a tenth of its requests', async () => {
    const admin = await bootstrapAdmin('health-venice');
    const now = Date.now();
    for (let index = 0; index < 10; index += 1) {
      await db.prepare(`
        INSERT INTO cloud_request_ledger (id, user_id, idempotency_key, request_type, status, units, created_at)
        VALUES (?, ?, ?, 'standard', ?, 1, ?)
      `).bind(`h-${index}`, admin.account.user_id, `key-${index}`, index < 4 ? 'refunded' : 'confirmed', now - 60_000)
        .run();
    }
    const health = await get<{ checks: { key: string; level: string; summary: string }[] }>(
      '/admin/api/health', admin.access_token,
    );
    const ai = health.checks.find(check => check.key === 'ai')!;
    assert.equal(ai.level, 'bad');
    assert.match(ai.summary, /40% failed/);
  });

  it('reports what happened since the previous visit', async () => {
    const admin = await bootstrapAdmin('health-visit');
    const now = Date.now();
    // Two sign-ins on record: the current one and one two days ago.
    await db.prepare(`
      INSERT INTO admin_audit_log (id, actor_user_id, action, metadata, created_at)
      VALUES ('visit-now', ?, 'admin_login', '{}', ?), ('visit-before', ?, 'admin_login', '{}', ?)
    `).bind(admin.account.user_id, now - 1_000, admin.account.user_id, now - 2 * DAY).run();
    await db.prepare(`
      INSERT INTO installations (install_id_hash, first_seen_at, last_seen_at) VALUES ('since-1', ?, ?), ('before-1', ?, ?)
    `).bind(now - DAY, now - DAY, now - 5 * DAY, now - 5 * DAY).run();
    const health = await get<{ since_last_visit: { since: number; installations: number } | null }>(
      '/admin/api/health', admin.access_token,
    );
    assert.equal(health.since_last_visit?.since, now - 2 * DAY);
    // The one planted a day ago and the admin's own, created by this test.
    assert.equal(health.since_last_visit?.installations, 2);
  });
});

describe('Venice cost', () => {
  it('adds the per-request lines up and lets none of them through', async () => {
    const admin = await bootstrapAdmin('venice-admin');
    Object.assign(env, { VENICE_BILLING_API_KEY: 'venice-billing-test' });
    const now = Date.now();
    const calls: { url: string; auth: string | null }[] = [];
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      calls.push({ url, auth: new Headers(init?.headers).get('authorization') });
      if (url.includes('/api_keys/rate_limits')) {
        return Response.json({ data: {
          apiTier: { id: 'paid', isCharged: true },
          balances: { USD: 40, DIEM: 0, BUNDLED_CREDITS: 2 },
          keyExpiration: null,
          nextEpochBegins: '2026-11-18T00:00:00.000Z',
        } });
      }
      const line = (requestId: string, sku: string, units: number, price: number, at: number, amount = -1) => ({
        amount, currency: 'USD', sku, units, pricePerUnitUsd: price,
        timestamp: new Date(at).toISOString(), apiKeyId: 'key-uuid', notes: 'API Inference',
        inferenceDetails: { requestId, promptTokens: 12, completionTokens: 34, inferenceExecutionTime: 5 },
      });
      if (url.includes('cursor=page-two')) {
        return Response.json({
          data: [line('req-secret-3', 'model-a-llm-output-mtoken', 1, 3, now - 2 * DAY)],
          nextCursor: null,
        });
      }
      return Response.json({
        data: [
          line('req-secret-1', 'model-a-llm-output-mtoken', 0.5, 2, now - DAY),
          line('req-secret-2', 'model-a-llm-input-mtoken', 2, 0.5, now - DAY),
          // A credit purchase is not spending.
          line('req-topup', 'credit-purchase', 1, 50, now - DAY, 50),
        ],
        nextCursor: 'page-two',
      });
    }) as typeof fetch;

    const venice = await get<{
      configured: boolean;
      balances: { USD: number };
      total_usd: number;
      per_day_usd: number;
      runway_days: number;
      by_sku: { sku: string; usd: number; lines: number }[];
      series: { usd: number }[];
    }>('/admin/api/venice?days=7', admin.access_token);

    assert.equal(venice.configured, true);
    assert.equal(venice.balances.USD, 40);
    assert.equal(venice.total_usd, 5);          // 0.5*2 + 2*0.5 + 1*3
    assert.deepEqual(venice.by_sku.map(row => [row.sku, row.usd, row.lines]), [
      ['model-a-llm-output-mtoken', 4, 2],
      ['model-a-llm-input-mtoken', 1, 1],
    ]);
    assert.equal(venice.series.length, 7);
    assert.equal(Math.round(venice.series.reduce((sum, point) => sum + point.usd, 0) * 100) / 100, 5);
    assert.equal(venice.runway_days, Math.floor(42 / (5 / 7)));

    // The billing key, not the inference one, and the second page by cursor alone.
    assert.ok(calls.every(call => call.auth === 'Bearer venice-billing-test'));
    assert.ok(calls.some(call => call.url.endsWith('/billing/usage-history?cursor=page-two')));
    const raw = JSON.stringify(venice);
    for (const leaked of ['req-secret', 'key-uuid', 'promptTokens', 'completionTokens']) {
      assert.ok(!raw.includes(leaked), `the Venice page must not carry ${leaked}`);
    }
  });

  it('says so when Venice refuses the key', async () => {
    const admin = await bootstrapAdmin('venice-refused');
    globalThis.fetch = (async () =>
      Response.json({ error: 'Authentication failed' }, { status: 401 })) as typeof fetch;
    const venice = await get<{ configured: boolean; error: string }>('/admin/api/venice', admin.access_token);
    assert.equal(venice.configured, true);
    assert.match(venice.error, /401: Authentication failed/);
  });
});

describe('infrastructure and versions', () => {
  it('asks for nothing when Cloudflare is not connected', async () => {
    const admin = await bootstrapAdmin('infra-off');
    const platform = await get<{ configured: boolean }>('/admin/api/platform', admin.access_token);
    assert.deepEqual(platform, { configured: false });
    assert.deepEqual(outbound, []);
  });

  it('maps Cloudflare rows to buckets and never sends more than a clean name upstream', async () => {
    const admin = await bootstrapAdmin('infra-on');
    Object.assign(env, {
      CF_ANALYTICS_API_TOKEN: 'cf-token-test',
      CF_ACCOUNT_ID: 'account-test',
      CF_WORKER_SCRIPT_NAME: 'alice"} evil { x',
      CF_D1_DATABASE_ID: 'db-123',
    });
    const today = new Date().toISOString().slice(0, 10);
    const bodies: string[] = [];
    globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      const body = String(init?.body ?? '');
      bodies.push(body);
      if (body.includes('workersInvocationsAdaptive')) {
        return Response.json({ data: { viewer: { accounts: [{
          w0: [
            { sum: { requests: 90, errors: 0, subrequests: 10 }, quantiles: { cpuTimeP50: 2_000, cpuTimeP99: 40_000 }, dimensions: { date: today, status: 'success' } },
            { sum: { requests: 10, errors: 10, subrequests: 0 }, quantiles: { cpuTimeP50: 9_000, cpuTimeP99: 50_000 }, dimensions: { date: today, status: 'scriptThrewException' } },
          ],
        }] } } });
      }
      return Response.json({ data: { viewer: { accounts: [{
        activity: [{ sum: { readQueries: 5, writeQueries: 2, rowsRead: 300, rowsWritten: 7 }, quantiles: { queryBatchTimeMsP50: 0.4, queryBatchTimeMsP99: 2.5 }, dimensions: { date: today } }],
        storage: [{ max: { databaseSizeBytes: 1_081_344 }, dimensions: { datetime: `${today}T10:00:00Z` } }],
        slowest: [{ count: 9, avg: { queryDurationMs: 0.45 }, sum: { queryDurationMs: 4.1, rowsRead: 90, rowsWritten: 0 }, dimensions: { query: '\n  SELECT 1\n   FROM users WHERE id = ?' } }],
      }] } } });
    }) as typeof fetch;

    const platform = await get<{
      worker: { requests: number; errors: number; error_percent: number; series: { cpu_p50_ms: number; cpu_p99_ms: number }[]; by_status: { status: string }[] };
      database: { scoped_to_database: boolean; size_bytes: number; rows_read: number; slowest_queries: { query: string; runs: number }[] };
    }>('/admin/api/platform?days=7', admin.access_token);

    assert.deepEqual(
      [platform.worker.requests, platform.worker.errors, platform.worker.error_percent],
      [100, 10, 10],
    );
    const last = platform.worker.series.at(-1)!;
    assert.deepEqual([last.cpu_p50_ms, last.cpu_p99_ms], [2, 50]);
    assert.equal(platform.worker.by_status[0].status, 'success');
    assert.equal(platform.database.scoped_to_database, true);
    assert.equal(platform.database.size_bytes, 1_081_344);
    assert.equal(platform.database.rows_read, 300);
    assert.deepEqual(platform.database.slowest_queries[0], {
      query: 'SELECT 1 FROM users WHERE id = ?', runs: 9, avg_ms: 0.45, total_ms: 4, rows_read: 90, rows_written: 0,
    });
    // The script name goes into a GraphQL string: nothing in it may close it.
    assert.ok(bodies.some(body => body.includes('scriptName: \\"aliceevilx\\"')));
    assert.ok(bodies.every(body => !body.includes('evil {')));
  });

  it('lists the migrations the checkout holds and the database does not', async () => {
    const admin = await bootstrapAdmin('versions-admin');
    await db.prepare(`
      CREATE TABLE d1_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, applied_at TEXT)
    `).run();
    await db.prepare(`
      INSERT INTO d1_migrations (name, applied_at) VALUES ('0001_accounts.sql', '2026-07-31 10:00:00')
    `).run();
    Object.assign(env, {
      CONSOLE_GIT_BRANCH: 'main',
      CONSOLE_GIT_COMMIT: 'abc1234',
      CONSOLE_MIGRATION_FILES: '0002_free_grants.sql,0001_accounts.sql',
    });
    const versions = await get<{
      console: { branch: string; commit: string };
      migrations: { applied: { name: string }[]; pending: string[]; checkout_count: number };
      site: { configured: boolean };
    }>('/admin/api/versions', admin.access_token);
    assert.deepEqual(versions.console, { branch: 'main', commit: 'abc1234' });
    assert.deepEqual(versions.migrations.pending, ['0002_free_grants.sql']);
    assert.equal(versions.migrations.checkout_count, 2);
    assert.deepEqual(versions.site, { configured: false });
  });

  it('does not guess when the database has no migration table', async () => {
    const admin = await bootstrapAdmin('versions-bare');
    Object.assign(env, { CONSOLE_MIGRATION_FILES: '0001_accounts.sql' });
    const versions = await get<{ migrations: { pending: string[] | null; applied_error: string | null } }>(
      '/admin/api/versions', admin.access_token,
    );
    assert.equal(versions.migrations.pending, null);
    assert.match(versions.migrations.applied_error ?? '', /no d1_migrations table/);
  });
});

describe('every new page is admin-only', () => {
  it('refuses a signed-in account that is not an admin', async () => {
    await bootstrapAdmin('gate-admin');
    const visitor = await registerAccount('gate-visitor');
    for (const path of ['health', 'growth', 'money', 'venice', 'platform', 'errors', 'versions']) {
      const res = await worker.fetch(
        jsonRequest(`/admin/api/${path}`, {}, bearer(visitor.access_token), 'GET'),
        env,
      );
      assert.equal(res.status, 403, `${path} must refuse a non-admin`);
    }
    assert.deepEqual(outbound, []);
  });
});

describe('scheduled tasks', () => {
  it('records a run that worked, one that failed, and resets the count on recovery', async () => {
    const { trackCron, cronStatuses } = await import('./cron-runs.ts');
    await trackCron(env, 'sat_price', async () => {});
    await assert.rejects(trackCron(env, 'billing_cleanup', async () => { throw new Error('table is locked'); }));
    await assert.rejects(trackCron(env, 'billing_cleanup', async () => { throw new Error('table is locked'); }));
    // A task that reports failure in its result rather than by throwing.
    const sent = await trackCron(env, 'expiry_reminders', async () => 3, count => ({ ok: true, detail: `${count} sent` }));
    assert.equal(sent, 3);

    let statuses = (await cronStatuses(env))!;
    const of = (job: string) => statuses.find(status => status.job === job)!;
    assert.deepEqual([of('sat_price').last_ok, of('sat_price').failures_in_a_row], [true, 0]);
    assert.deepEqual(
      [of('billing_cleanup').last_ok, of('billing_cleanup').failures_in_a_row, of('billing_cleanup').last_detail, of('billing_cleanup').last_ok_at],
      [false, 2, 'table is locked', null],
    );
    assert.equal(of('expiry_reminders').last_detail, '3 sent');
    assert.equal(of('explorer_anchors').last_started_at, null);

    await trackCron(env, 'billing_cleanup', async () => {});
    statuses = (await cronStatuses(env))!;
    assert.deepEqual([of('billing_cleanup').last_ok, of('billing_cleanup').failures_in_a_row], [true, 0]);
  });

  it('never lets the recording break the task it wraps', async () => {
    const { trackCron, cronStatuses } = await import('./cron-runs.ts');
    await db.prepare('DROP TABLE cron_runs').run();
    assert.equal(await trackCron(env, 'sat_price', async () => 'done'), 'done');
    assert.equal(await cronStatuses(env), null);
  });

  it('turns the light red for a task that stopped running', async () => {
    const admin = await bootstrapAdmin('cron-health');
    const now = Date.now();
    type Health = { checks: { key: string; level: string; summary: string }[]; crons: { job: string; late: boolean }[] };
    const before = await get<Health>('/admin/api/health', admin.access_token);
    assert.equal(before.checks.find(check => check.key === 'crons')?.level, 'unknown');

    const run = (job: string, startedAt: number, ok: number) => db.prepare(`
      INSERT INTO cron_runs (job, last_started_at, last_duration_ms, last_ok, last_ok_at, failures_in_a_row)
      VALUES (?, ?, 40, ?, ?, ?)
    `).bind(job, startedAt, ok, ok ? startedAt : null, ok ? 0 : 1).run();
    for (const job of ['account_cleanup', 'billing_cleanup', 'expiry_reminders', 'sat_price', 'btcpay_probe']) {
      await run(job, now - 20 * 60_000, 1);
    }
    await run('explorer_anchors', now - 5 * 60_000, 1);
    const fine = await get<Health>('/admin/api/health', admin.access_token);
    assert.equal(fine.checks.find(check => check.key === 'crons')?.level, 'ok');

    // The ten-minute task last ran 40 minutes ago.
    await db.prepare(`UPDATE cron_runs SET last_started_at = ? WHERE job = 'explorer_anchors'`)
      .bind(now - 40 * 60_000).run();
    const late = await get<Health>('/admin/api/health', admin.access_token);
    const check = late.checks.find(item => item.key === 'crons')!;
    assert.equal(check.level, 'bad');
    assert.match(check.summary, /Explorer settlement anchors/);
    assert.equal(late.crons.find(cron => cron.job === 'explorer_anchors')?.late, true);
  });
});

describe('GitHub downloads and traffic', () => {
  function githubStub(counts: Record<string, number>, traffic = false) {
    const calls: { url: string; auth: string | null; agent: string | null }[] = [];
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const headers = new Headers(init?.headers);
      calls.push({ url, auth: headers.get('authorization'), agent: headers.get('user-agent') });
      if (url.includes('/traffic/views')) {
        return Response.json({ views: [{ timestamp: new Date(Date.now() - DAY).toISOString(), count: 30, uniques: 12 }] });
      }
      if (url.includes('/traffic/clones')) {
        return Response.json({ clones: [{ timestamp: new Date(Date.now() - DAY).toISOString(), count: 4, uniques: 3 }] });
      }
      if (url.includes('/traffic/popular/referrers')) {
        return Response.json([{ referrer: 'x.com', count: 9, uniques: 5 }]);
      }
      if (url.includes('/repos/alice-btc/alice/releases')) {
        return Response.json([
          { tag_name: 'v0.2.9', published_at: '2026-11-13T10:12:58Z', assets: Object.entries(counts).map(
            ([name, download_count]) => ({ name, download_count }),
          ).concat([{ name: 'SHA256SUMS.txt', download_count: 999 }]) },
          { tag_name: 'v0.3.0-draft', draft: true, assets: [{ name: 'Alice.dmg', download_count: 5 }] },
        ]);
      }
      return Response.json([]);
    }) as typeof fetch;
    if (!traffic) return calls;
    Object.assign(env, { GITHUB_TRAFFIC_TOKEN: 'github-token-test' });
    return calls;
  }

  type Github = {
    assets: { file: string; platform: string; count: number; added: number | null }[];
    base_day: string | null;
    snapshot_days: number;
    downloads_by_day: { key: string; count: number }[];
    releases: { product: string; version: string }[];
    traffic: { configured: boolean; views: { key: string; count: number }[]; referrers: { referrer: string; views: number }[] };
    history_error: string | null;
  };

  it('files the totals by day and turns two snapshots into downloads per day', async () => {
    const admin = await bootstrapAdmin('github-admin');
    const today = Math.floor(Date.now() / DAY);
    // Yesterday's snapshot, as an earlier console session left it.
    await db.prepare(`
      INSERT INTO github_daily (day, repo, metric, item, count)
      VALUES (?, 'alice-btc/alice', 'downloads', 'v0.2.9/Alice.dmg', 100)
    `).bind(today - 1).run();

    const calls = githubStub({ 'Alice.dmg': 130, 'Alice.apk': 8 });
    const github = await get<Github>('/admin/api/github?days=7', admin.access_token);

    // The checksum file and the draft release are not installers people got.
    assert.deepEqual(github.assets.map(asset => [asset.file, asset.platform, asset.count, asset.added]), [
      ['Alice.dmg', 'Mac', 130, 30],
      // New since the repository was first tracked: every download is new.
      ['Alice.apk', 'Android', 8, 8],
    ]);
    assert.equal(github.snapshot_days, 2);
    assert.deepEqual(
      github.downloads_by_day.map(row => [row.key, row.count]).sort(),
      [['Android', 8], ['Mac', 30]],
    );
    assert.deepEqual(github.releases, [{ product: 'Alice', version: 'v0.2.9', published_at: Date.parse('2026-11-13T10:12:58Z') }]);
    assert.equal(github.traffic.configured, false);
    // The public counters need no token, and no traffic route is asked without one.
    assert.ok(calls.every(call => call.auth === null && call.agent === 'alice-admin-console'));
    assert.ok(calls.every(call => !call.url.includes('/traffic/')));

    // Reading twice in a day overwrites the day, it does not count twice.
    githubStub({ 'Alice.dmg': 135, 'Alice.apk': 8 });
    const again = await get<Github>('/admin/api/github?days=7', admin.access_token);
    assert.equal(again.assets.find(asset => asset.file === 'Alice.dmg')?.added, 35);
    const stored = await db.prepare(`
      SELECT COUNT(*) AS rows FROM github_daily WHERE metric = 'downloads' AND day = ?
    `).bind(today).first<{ rows: number }>();
    assert.equal(stored?.rows, 2);
  });

  it('counts nothing as new on the very first day', async () => {
    const admin = await bootstrapAdmin('github-first');
    githubStub({ 'Alice.dmg': 130 });
    const github = await get<Github>('/admin/api/github', admin.access_token);
    assert.deepEqual([github.base_day, github.assets[0].added, github.downloads_by_day.length], [null, null, 0]);
  });

  it('keeps repository traffic by day when a token is set', async () => {
    const admin = await bootstrapAdmin('github-traffic');
    const calls = githubStub({ 'Alice.dmg': 1 }, true);
    const github = await get<Github>('/admin/api/github?days=7', admin.access_token);
    assert.equal(github.traffic.configured, true);
    assert.deepEqual(github.traffic.views.filter(row => row.key === 'Alice').map(row => row.count), [30]);
    assert.deepEqual(github.traffic.referrers.filter(row => row.views > 0).map(row => row.referrer), ['x.com', 'x.com']);
    assert.ok(calls.every(call => call.auth === 'Bearer github-token-test'));
    assert.ok(calls.every(call => call.url.startsWith('https://api.github.com/')));
  });

  it('still gives the totals when the history table is missing', async () => {
    const admin = await bootstrapAdmin('github-bare');
    await db.prepare('DROP TABLE github_daily').run();
    githubStub({ 'Alice.dmg': 130 });
    const github = await get<Github>('/admin/api/github', admin.access_token);
    assert.equal(github.assets[0].count, 130);
    assert.match(github.history_error ?? '', /migration 0021/);
  });
});

describe('notes on the calendar', () => {
  it('adds, lists and removes a note behind the write lock, and audits each', async () => {
    const admin = await bootstrapAdmin('notes-admin');
    const locked = await worker.fetch(
      jsonRequest('/admin/api/annotations', { date: '2026-11-16', label: 'Announcement posted', kind: 'post' },
        bearer(admin.access_token)),
      env,
    );
    assert.equal(locked.status, 403);

    const token = await unlock(admin.access_token);
    const headers = bearer(admin.access_token, { 'x-admin-unlock': token });
    const created = await worker.fetch(
      jsonRequest('/admin/api/annotations', { date: '2026-11-16', label: '  Announcement\n posted ', kind: 'post' }, headers),
      env,
    );
    assert.equal(created.status, 200);
    const note = await created.json() as { id: string; day: number; label: string };
    assert.deepEqual([note.label, note.day], ['Announcement posted', Date.parse('2026-11-16T00:00:00Z') / DAY]);

    for (const bad of [
      { date: '16/11/2026', label: 'x', kind: 'post' },
      { date: '2026-11-16', label: '', kind: 'post' },
      { date: '2026-11-16', label: 'x'.repeat(81), kind: 'post' },
    ]) {
      const res = await worker.fetch(jsonRequest('/admin/api/annotations', bad, headers), env);
      assert.equal(res.status, 400);
    }
    // An unknown kind is filed as "other", never stored as sent.
    const odd = await worker.fetch(
      jsonRequest('/admin/api/annotations', { date: '2026-11-17', label: 'Odd', kind: 'anything' }, headers),
      env,
    );
    assert.equal((await odd.json() as { kind: string }).kind, 'other');

    const list = await get<{ annotations: { label: string }[] }>('/admin/api/annotations', admin.access_token);
    assert.deepEqual(list.annotations.map(item => item.label), ['Odd', 'Announcement posted']);

    const removed = await worker.fetch(
      jsonRequest(`/admin/api/annotations/${note.id}`, {}, headers, 'DELETE'),
      env,
    );
    assert.equal(removed.status, 200);
    const audit = await db.prepare(`
      SELECT action FROM admin_audit_log WHERE action IN ('unlock_writes', 'create_annotation', 'delete_annotation')
      ORDER BY created_at ASC
    `).all<{ action: string }>();
    assert.deepEqual(
      audit.results.map(row => row.action),
      ['unlock_writes', 'create_annotation', 'create_annotation', 'delete_annotation'],
    );
  });

  it('carried the audit log over when the table was rebuilt', async () => {
    const admin = await bootstrapAdmin('notes-audit');
    const rows = await db.prepare(`
      SELECT action FROM admin_audit_log WHERE actor_user_id = ?
    `).bind(admin.account.user_id).all<{ action: string }>();
    assert.ok(rows.results.some(row => row.action === 'admin_bootstrap'));
    const indexes = await db.prepare(`
      SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'admin_audit_log' AND name LIKE 'admin_audit_log%'
    `).all<{ name: string }>();
    assert.deepEqual(indexes.results.map(row => row.name).sort(), ['admin_audit_log_actor_idx', 'admin_audit_log_created_at_idx']);
  });
});

describe('usage counters', () => {
  it('keeps nothing an app posts to the old counters route', async () => {
    const account = await registerAccount('events-discarded');
    for (const headers of [{ ...bearer(account.access_token), 'x-alice-platform': 'web', 'x-alice-app-version': '0.2.9' }, {}]) {
      const res = await worker.fetch(
        jsonRequest('/account/events', { events: ['app_opened', 'learn_opened', 'answer_private'] }, headers),
        env,
      );
      // Apps up to 0.2.9 still post: they get an answer, with or without a session.
      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), { accepted: 0 });
    }
    const stored = await db.prepare('SELECT COUNT(*) AS rows FROM events_daily').first<{ rows: number }>();
    assert.equal(stored?.rows, 0);
  });

  it('counts a click on a site Download button by platform, without a session', async () => {
    const click = (body: unknown, ip = '198.51.100.7') => worker.fetch(new Request('https://proxy.test/site/events', {
      method: 'POST',
      // What the site sends: a simple request, no credentials of any kind.
      headers: { 'content-type': 'text/plain', origin: 'https://alice.example', 'cf-connecting-ip': ip },
      body: JSON.stringify(body),
    }), env);

    assert.deepEqual(await (await click({ platform: 'desktop-macos' })).json(), { accepted: 1 });
    assert.deepEqual(await (await click({ platform: 'desktop-macos' })).json(), { accepted: 1 });
    assert.deepEqual(await (await click({ platform: 'android' })).json(), { accepted: 1 });
    // Not a platform the site has a button for: nothing is stored.
    for (const body of [{ platform: 'web' }, { platform: 'my-phone-model' }, { event: 'answer_private' }, {}]) {
      assert.deepEqual(await (await click(body)).json(), { accepted: 0 });
    }

    const rows = await db.prepare(`
      SELECT event_name, platform, app_version, count FROM events_daily ORDER BY platform
    `).all<{ event_name: string; platform: string; app_version: string; count: number }>();
    assert.deepEqual(rows.results, [
      { event_name: 'site_download_clicked', platform: 'android', app_version: '', count: 1 },
      { event_name: 'site_download_clicked', platform: 'desktop-macos', app_version: '', count: 2 },
    ]);
  });

  it('stops a script from inflating the site counter', async () => {
    let limited = false;
    for (let attempt = 0; attempt < 70; attempt += 1) {
      const res = await worker.fetch(new Request('https://proxy.test/site/events', {
        method: 'POST',
        headers: { 'content-type': 'text/plain', 'cf-connecting-ip': '198.51.100.9' },
        body: JSON.stringify({ platform: 'ios' }),
      }), env);
      if (res.status === 429) { limited = true; break; }
    }
    assert.ok(limited, 'one network cannot click without end');
    const stored = await db.prepare(`
      SELECT count FROM events_daily WHERE event_name = 'site_download_clicked'
    `).first<{ count: number }>();
    assert.ok((stored?.count ?? 0) <= 60);
  });
});
