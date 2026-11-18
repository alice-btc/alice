// The admin console on a throwaway database filled with made-up data.
//
//   node apps/venice-proxy-worker/scripts/console-preview.ts
//   open http://localhost:8799/admin
//
// For looking at the console while changing it, without touching production:
// the real console reads and writes the live
// database. This one builds an in-memory D1 from the migrations, invents a
// few months of activity, creates one admin and serves the Worker itself, so
// what is on screen is the real page and the real API over fictitious rows.
// Everything disappears when the process stops.
//
// The sign-in is printed at start-up. It only exists in this process.
//
// Optional: PREVIEW_DEV_VARS=/path/to/.dev.vars lends the preview the CF_*
// values of that file, so the Infrastructure and Site pages show Cloudflare's
// real counters. Only those names are read. Without it those pages show
// their "connect" card, which is also worth seeing.

import { readFileSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { Miniflare } from 'miniflare';
import worker, { type Env } from '../src/index.ts';

const PORT = Number(process.env.PORT ?? 8799);
const PASSWORD = 'console-preview-password-1';
const DAY = 24 * 60 * 60 * 1_000;
const HOUR = 60 * 60 * 1_000;

const miniflare = new Miniflare({
  modules: true,
  script: 'export default { async fetch() { return new Response("ok") } }',
  d1Databases: ['ACCOUNT_DB'],
});
const db = await miniflare.getD1Database('ACCOUNT_DB');
const migrationsUrl = new URL('../migrations/', import.meta.url);
const migrationNames = (await readdir(migrationsUrl)).filter(name => /^\d+.*\.sql$/.test(name)).sort();
await db.prepare(`
  CREATE TABLE d1_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, applied_at TEXT)
`).run();
for (const name of migrationNames) {
  const migration = await readFile(new URL(name, migrationsUrl), 'utf8');
  for (const statement of migration.split(/;\s*(?:\n|$)/).map(sql => sql.trim()).filter(Boolean)) {
    await db.prepare(statement).run();
  }
  await db.prepare(`INSERT INTO d1_migrations (name, applied_at) VALUES (?, datetime('now'))`)
    .bind(name).run();
}

function lentCloudflareVars(): Record<string, string> {
  const path = process.env.PREVIEW_DEV_VARS;
  if (!path) return {};
  const wanted = ['CF_ANALYTICS_API_TOKEN', 'CF_ACCOUNT_ID', 'CF_WEB_ANALYTICS_SITE_TAG', 'CF_WEB_ANALYTICS_HOST'];
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const at = line.indexOf('=');
    const name = line.slice(0, at).trim();
    if (at > 0 && wanted.includes(name)) out[name] = line.slice(at + 1).trim().replace(/^"|"$/g, '');
  }
  return out;
}

let sentCode = '';
const env = {
  ACCOUNT_DB: db,
  EMAIL: {
    async send(message: { text: string }) {
      sentCode = message.text.match(/\b(\d{6})\b/)?.[1] ?? '';
      return { messageId: 'preview' };
    },
  },
  AUTH_EMAIL_FROM: 'login@alice.example',
  AUTH_HMAC_KEY: 'console-preview-hmac-key-with-more-than-thirty-two-bytes',
  ADMIN_BOOTSTRAP_SECRET: 'console-preview-bootstrap-secret-with-more-than-32-bytes',
  ADMIN_CONSOLE_ENABLED: 'true',
  VENICE_API_KEY: '',
  // PREVIEW_APP_ORIGIN lets a local Alice Web talk to this preview as its proxy.
  ALLOWED_ORIGINS: [`http://localhost:${PORT}`, process.env.PREVIEW_APP_ORIGIN].filter(Boolean).join(','),
  FREE_CLOUD_MODELS: 'e2ee-gpt-oss-120b-p',
  FREE_CLOUD_MAX_TOKENS: '2048',
  CONSOLE_GIT_BRANCH: 'preview',
  CONSOLE_GIT_COMMIT: 'fictitious',
  // One more file than the database has, so the "not applied" warning shows.
  CONSOLE_MIGRATION_FILES: [...migrationNames, '9999_example_not_applied.sql'].join(','),
  ...lentCloudflareVars(),
} as unknown as Env;

function call(path: string, body: unknown, headers: Record<string, string> = {}, method = 'POST') {
  return worker.fetch(new Request(`http://localhost:${PORT}${path}`, {
    method,
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.8', ...headers },
    body: method === 'GET' ? undefined : JSON.stringify(body),
  }), env);
}

let accountsMade = 0;
async function createAccount(prefix: string) {
  // One address each: account creation is rate-limited per network.
  accountsMade += 1;
  const headers: Record<string, string> = {
    'x-alice-install-id': `install-${prefix}-000000000000`,
    'cf-connecting-ip': `203.0.113.${accountsMade}`,
  };
  const { access_token } = await (await call('/auth/anonymous', {}, headers)).json() as { access_token: string };
  headers.authorization = `Bearer ${access_token}`;
  const email = `${prefix}@example.com`;
  await call('/account/identities/email/start', { email }, headers);
  await call('/account/identities/email/verify', { email, code: sentCode }, headers);
  const named = await call('/account/password', { password: PASSWORD, prefix, suffix: 'wonderland' }, headers, 'PUT');
  const { account } = await named.json() as { account?: { user_id: string; username: string } };
  if (!account) throw new Error(`Could not create ${prefix}: the Worker answered ${named.status}.`);
  return { headers, account };
}

// A repeatable generator, so two runs of the preview show the same page.
let seed = 20261117;
function random(): number {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}
const pick = <T>(list: T[]): T => list[Math.floor(random() * list.length)];

const admin = await createAccount('preview-admin');
await call('/admin/api/bootstrap', {}, {
  ...admin.headers,
  'x-admin-bootstrap-secret': env.ADMIN_BOOTSTRAP_SECRET!,
});
const people = [];
for (const name of ['ada', 'grace', 'linus', 'margaret', 'dennis', 'barbara']) {
  people.push(await createAccount(`preview-${name}`));
}

const now = Date.now();
const statements: D1PreparedStatement[] = [];
const platforms = ['web', 'web', 'web', 'android', 'desktop-macos', 'desktop-windows', 'ios'];
const versions = ['0.2.7', '0.2.8', '0.2.8', '0.2.9', '0.2.9', '0.2.9'];

// Installations over 100 days, more of them recently, most never coming back.
for (let index = 0; index < 420; index += 1) {
  const age = Math.floor(Math.pow(random(), 1.7) * 100 * DAY);
  const first = now - age;
  const stayed = random() < 0.45 ? Math.floor(random() * age) : 0;
  const madeRequest = random() < 0.6;
  statements.push(db.prepare(`
    INSERT INTO installations (install_id_hash, first_seen_at, last_seen_at, platform, app_version,
      first_cloud_request_at, tenth_cloud_request_at, quota_exhausted_at, account_created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    `preview-install-${index}`, first, first + stayed, pick(platforms), pick(versions),
    madeRequest ? first + 60_000 : null,
    madeRequest && random() < 0.4 ? first + HOUR : null,
    madeRequest && random() < 0.15 ? first + 2 * HOUR : null,
    random() < 0.08 ? first + 3 * HOUR : null,
  ));
}

// Requests: a daily rhythm, a quiet night, a tenth refunded.
const users = [admin, ...people].map(person => person.account.user_id);
for (let index = 0; index < 2600; index += 1) {
  const day = Math.floor(Math.pow(random(), 1.5) * 95);
  const hour = Math.floor(8 + random() * 15);
  const at = now - day * DAY - (23 - hour) * HOUR - Math.floor(random() * HOUR);
  if (at > now) continue;
  const status = random() < 0.08 ? 'refunded' : (random() < 0.02 ? 'rejected' : 'confirmed');
  statements.push(db.prepare(`
    INSERT INTO cloud_request_ledger (id, user_id, idempotency_key, request_type, status, units,
      input_bytes, reserved_output_bytes, output_bytes, created_at, confirmed_at)
    VALUES (?, ?, ?, 'standard', ?, 1, ?, 0, ?, ?, ?)
  `).bind(
    `preview-ledger-${index}`, pick(users), `preview-key-${index}`, status,
    Math.floor(400 + random() * 6_000), status === 'confirmed' ? Math.floor(800 + random() * 14_000) : 0,
    at, status === 'confirmed' ? at + 4_000 : null,
  ));
}

// Paying accounts, their invoices, and one plan about to run out.
const payers = people.slice(0, 4);
payers.forEach((person, index) => {
  statements.push(db.prepare(`
    UPDATE entitlements SET plan = 'cloud', plan_expires_at = ?,
      input_bytes_limit = 50000000, output_bytes_limit = 50000000 WHERE user_id = ?
  `).bind(now + [3, 12, 26, 70][index] * DAY, person.account.user_id));
  statements.push(db.prepare(`
    UPDATE usage_counters SET input_bytes_used = ?, output_bytes_used = ? WHERE user_id = ?
  `).bind(Math.floor(random() * 30_000_000), [46_000_000, 9_000_000, 21_000_000, 3_000_000][index], person.account.user_id));
});
for (let index = 0; index < 34; index += 1) {
  const at = now - Math.floor(random() * 170 * DAY);
  const status = random() < 0.62 ? 'paid' : (random() < 0.85 ? 'expired' : 'pending');
  const months = pick([1, 1, 1, 3, 6, 12]);
  statements.push(db.prepare(`
    INSERT INTO invoices (id, user_id, provider, provider_invoice_id, plan, months, amount_cents,
      amount_sats, currency, status, credited_at, created_at, updated_at)
    VALUES (?, ?, 'btcpay', ?, 'cloud', ?, ?, ?, 'BTC', ?, ?, ?, ?)
  `).bind(
    `preview-invoice-${index}`, pick(payers).account.user_id, `preview-btcpay-${index}`, months,
    900 * months, status === 'paid' ? Math.floor(9_800 * months * (0.9 + random() * 0.2)) : null,
    status, status === 'paid' ? at + 20 * 60_000 : null, at, at + 20 * 60_000,
  ));
}
statements.push(db.prepare(`
  INSERT INTO billing_reminders (user_id, plan_expires_at, kind, sent_at) VALUES (?, ?, 't_minus_3', ?)
`).bind(payers[0].account.user_id, now + 3 * DAY, now - 2 * HOUR));

// Errors: mostly refusals that worked, a few real failures, one BTCPay outage.
const errorKinds: Array<[string, string, number, number]> = [
  ['auth', 'invalid_password', 400, 60], ['auth', 'invalid_code', 400, 40], ['auth', 'rate_limited', 429, 25],
  ['auth', 'session_expired', 401, 30], ['venice', 'upstream_http_502', 502, 18], ['venice', 'upstream_http_429', 429, 9],
  ['auth', 'internal_error', 500, 3], ['email', 'email_send_failed', 502, 2],
];
let errorIndex = 0;
for (const [category, code, status, count] of errorKinds) {
  for (let index = 0; index < count; index += 1) {
    statements.push(db.prepare(`
      INSERT INTO technical_events (id, category, code, status, user_id, created_at)
      VALUES (?, ?, ?, ?, NULL, ?)
    `).bind(`preview-error-${errorIndex++}`, category, code, status, now - Math.floor(random() * 60 * DAY)));
  }
}
statements.push(db.prepare(`
  INSERT INTO technical_events (id, category, code, status, user_id, created_at)
  VALUES ('preview-down', 'venice', 'btcpay_down', 503, NULL, ?), ('preview-up', 'venice', 'btcpay_up', 200, NULL, ?)
`).bind(now - 9 * DAY, now - 9 * DAY + 95 * 60_000));

const today = Math.floor(now / DAY);

// The scheduled tasks as the deployed Worker would leave them: all on time,
// one of them failing.
for (const [job, minutesAgo, ok, detail] of [
  ['account_cleanup', 22, 1, null], ['billing_cleanup', 22, 1, null], ['expiry_reminders', 22, 1, '1 sent'],
  ['sat_price', 22, 0, 'rate source answered 503'], ['btcpay_probe', 22, 1, 'BTCPay answering'],
  ['explorer_anchors', 4, 1, 'arkade height 921004; bark height 921004; stream heard 12'],
] as const) {
  statements.push(db.prepare(`
    INSERT INTO cron_runs (job, last_started_at, last_duration_ms, last_ok, last_ok_at, last_detail, failures_in_a_row)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(job, now - minutesAgo * 60_000, job === 'explorer_anchors' ? 541_000 : 180, ok, ok ? now - minutesAgo * 60_000 : now - 26 * HOUR, detail, ok ? 0 : 2));
}

// A month of download snapshots for one made-up installer, so the downloads
// per day curve has a past. The live counters come from GitHub itself.
for (let offset = 30; offset >= 1; offset -= 1) {
  statements.push(db.prepare(`
    INSERT INTO github_daily (day, repo, metric, item, count)
    VALUES (?, 'alice-btc/alice', 'downloads', 'v0.0.0/Preview.dmg', ?)
  `).bind(Math.floor(now / DAY) - offset, (30 - offset) * 4 + Math.floor(random() * 4)));
}

// Notes on the calendar.
for (const [daysAgo, label, kind] of [[12, 'Article in a newsletter', 'article'], [4, 'Announcement thread', 'post']] as const) {
  statements.push(db.prepare(`
    INSERT INTO admin_annotations (id, day, label, kind, created_at) VALUES (?, ?, ?, ?, ?)
  `).bind(`preview-note-${daysAgo}`, Math.floor(now / DAY) - daysAgo, label, kind, now));
}

// Clicks on the site's Download buttons, the only counter kept.
for (let offset = 0; offset < 30; offset += 1) {
  for (const [platform, base] of [['desktop-macos', 6], ['desktop-windows', 4], ['android', 3], ['desktop-linux', 2], ['ios', 2]] as const) {
    statements.push(db.prepare(`
      INSERT INTO events_daily (day, event_name, platform, app_version, count) VALUES (?, 'site_download_clicked', ?, '', ?)
    `).bind(today - offset, platform, Math.floor(base * (0.5 + random()))));
  }
}

// A previous visit, so "since your last visit" has something to say.
statements.push(db.prepare(`
  INSERT INTO admin_audit_log (id, actor_user_id, action, metadata, created_at)
  VALUES ('preview-visit', ?, 'admin_login', '{}', ?)
`).bind(admin.account.user_id, now - 3 * DAY));

for (let offset = 0; offset < statements.length; offset += 50) {
  await db.batch(statements.slice(offset, offset + 50));
}

createServer(async (incoming, outgoing) => {
  const chunks: Buffer[] = [];
  for await (const chunk of incoming) chunks.push(chunk as Buffer);
  const headers = new Headers();
  for (const [name, value] of Object.entries(incoming.headers)) {
    if (typeof value === 'string') headers.set(name, value);
  }
  headers.set('cf-connecting-ip', '127.0.0.1');
  const method = incoming.method ?? 'GET';
  if (incoming.url === '/') {
    outgoing.writeHead(302, { location: '/admin' });
    outgoing.end();
    return;
  }
  const response = await worker.fetch(new Request(`http://localhost:${PORT}${incoming.url}`, {
    method,
    headers,
    body: method === 'GET' || method === 'HEAD' ? undefined : Buffer.concat(chunks),
  }), env);
  outgoing.writeHead(response.status, Object.fromEntries(response.headers));
  outgoing.end(Buffer.from(await response.arrayBuffer()));
}).listen(PORT, () => {
  console.log(`Console preview on http://localhost:${PORT}/admin`);
  console.log(`Sign in as ${admin.account.username} with the password "${PASSWORD}".`);
  console.log('Fictitious data in memory. Nothing here is production.');
});
