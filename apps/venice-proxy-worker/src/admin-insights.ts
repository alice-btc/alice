// The console's reading pages: health, growth, money, Venice cost,
// infrastructure, errors, versions and GitHub downloads.
//
// Same rules as admin.ts, which holds the access model: every route asks for
// an admin session, and nothing here reads or returns a conversation, a
// prompt, a wallet, a password, an address or an IP. Figures are counts and
// sums, collapsed before they leave the database or the upstream API; the few
// row-level values (an expiry date, an outage, a slow statement) carry no
// account.
//
// Only adminGithub writes: daily snapshots of GitHub's public counters.

import type { Env } from './index.ts';
import { cloudflareJson, DAY_MS, HOUR_MS, requireAdmin } from './admin.ts';
import { cronStatuses } from './cron-runs.ts';
import { anchorCurrency } from './sat-price.ts';
import { testWalletFaucetStatus } from './test-wallet-faucet.ts';

const WEEK_MS = 7 * DAY_MS;
const PERIOD_DAYS = [1, 7, 30, 90];
const DEFAULT_WORKER_SCRIPT = 'alice-venice-proxy';
const DEFAULT_VENICE_BASE = 'https://api.venice.ai/api/v1';
const DEFAULT_VENICE_ALERT_USD = 10;

type Period = {
  days: number;
  now: number;
  since: number;
  previousSince: number;
  /** One hour for the 24-hour view, one day otherwise. */
  bucketMs: number;
  buckets: number;
};

/**
 * The period every page shares: 24 hours, 7, 30 or 90 days, read from
 * `?days=`. Anything else falls back to 30, so the value can be written into
 * a statement as a number without ever being a string from the URL.
 */
export function readPeriod(request: Request, now: number = Date.now()): Period {
  return periodOf(Number(new URL(request.url).searchParams.get('days') ?? '30'), now);
}

function periodOf(asked: number, now: number): Period {
  const days = PERIOD_DAYS.includes(asked) ? asked : 30;
  return {
    days,
    now,
    since: now - days * DAY_MS,
    previousSince: now - 2 * days * DAY_MS,
    bucketMs: days === 1 ? HOUR_MS : DAY_MS,
    buckets: days === 1 ? 24 : days,
  };
}

/**
 * The bucket a timestamp column falls in. The divisor is a literal with a
 * CAST: bound, it reaches SQLite as a real and the division stops matching
 * any bucket.
 */
function bucketOf(column: string, period: Period): string {
  return `CAST(${column} / ${period.bucketMs} AS INTEGER)`;
}

type BucketRow = { bucket: number } & Record<string, number>;

/** Every bucket of the period, quiet ones as zeros, stamped with its start. */
function densify<K extends string>(
  rows: BucketRow[],
  period: Period,
  keys: K[],
): Array<{ t: number } & Record<K, number>> {
  const byBucket = new Map(rows.map(row => [row.bucket, row]));
  const current = Math.floor(period.now / period.bucketMs);
  const out: Array<{ t: number } & Record<K, number>> = [];
  for (let offset = period.buckets - 1; offset >= 0; offset -= 1) {
    const bucket = current - offset;
    const row = byBucket.get(bucket);
    const point = { t: bucket * period.bucketMs } as { t: number } & Record<K, number>;
    for (const key of keys) (point as Record<K, number>)[key] = row?.[key] ?? 0;
    out.push(point);
  }
  return out;
}

async function all<T>(statement: D1PreparedStatement): Promise<T[]> {
  return (await statement.all<T>()).results ?? [];
}

// ---------------------------------------------------------------------------
// Growth
// ---------------------------------------------------------------------------

/**
 * Installations, accounts and requests over the chosen period against the
 * one before, the same three as curves, and what the existing rows say about
 * versions and retention. Nothing new is collected for this page.
 */
export async function adminGrowth(request: Request, env: Env) {
  await requireAdmin(request, env);
  const period = readPeriod(request);
  const { now, since, previousSince } = period;
  const db = env.ACCOUNT_DB;

  const [counts, requests, installs, accounts, byPlatform, cohorts, active] =
    await Promise.all([
      db.prepare(`
        SELECT
          (SELECT COUNT(*) FROM installations WHERE first_seen_at > ?) AS installs_now,
          (SELECT COUNT(*) FROM installations
            WHERE first_seen_at > ? AND first_seen_at <= ?) AS installs_before,
          (SELECT COUNT(*) FROM installations WHERE last_seen_at > ?) AS active_now,
          (SELECT COUNT(*) FROM (
            SELECT MIN(created_at) AS first_at FROM user_identities GROUP BY user_id
          ) WHERE first_at > ?) AS accounts_now,
          (SELECT COUNT(*) FROM (
            SELECT MIN(created_at) AS first_at FROM user_identities GROUP BY user_id
          ) WHERE first_at > ? AND first_at <= ?) AS accounts_before,
          (SELECT COUNT(*) FROM cloud_request_ledger
            WHERE status = 'confirmed' AND created_at > ?) AS requests_now,
          (SELECT COUNT(*) FROM cloud_request_ledger
            WHERE status = 'confirmed' AND created_at > ? AND created_at <= ?) AS requests_before
      `).bind(
        since, previousSince, since, since,
        since, previousSince, since,
        since, previousSince, since,
      ).first<Record<string, number>>(),

      all<BucketRow>(db.prepare(`
        SELECT ${bucketOf('created_at', period)} AS bucket, COUNT(*) AS count
        FROM cloud_request_ledger
        WHERE status = 'confirmed' AND created_at > ? GROUP BY bucket
      `).bind(since)),

      all<BucketRow>(db.prepare(`
        SELECT ${bucketOf('first_seen_at', period)} AS bucket, COUNT(*) AS count
        FROM installations WHERE first_seen_at > ? GROUP BY bucket
      `).bind(since)),

      all<BucketRow>(db.prepare(`
        SELECT ${bucketOf('first_at', period)} AS bucket, COUNT(*) AS count FROM (
          SELECT MIN(created_at) AS first_at FROM user_identities GROUP BY user_id
        ) WHERE first_at > ? GROUP BY bucket
      `).bind(since)),

      all<{ bucket: number; platform: string; count: number }>(db.prepare(`
        SELECT ${bucketOf('first_seen_at', period)} AS bucket,
               COALESCE(platform, 'unknown') AS platform, COUNT(*) AS count
        FROM installations WHERE first_seen_at > ? GROUP BY bucket, platform
      `).bind(since)),

      // Retention by the week an installation first appeared. "Still seen N
      // days later" is all the table can say: it keeps a first and a last
      // visit, never the days in between.
      all<Record<string, number>>(db.prepare(`
        SELECT
          CAST(first_seen_at / ${WEEK_MS} AS INTEGER) AS week,
          COUNT(*) AS size,
          SUM(CASE WHEN last_seen_at - first_seen_at >= ${DAY_MS} THEN 1 ELSE 0 END) AS d1,
          SUM(CASE WHEN last_seen_at - first_seen_at >= ${7 * DAY_MS} THEN 1 ELSE 0 END) AS d7,
          SUM(CASE WHEN last_seen_at - first_seen_at >= ${30 * DAY_MS} THEN 1 ELSE 0 END) AS d30
        FROM installations
        WHERE first_seen_at > ?
        GROUP BY week ORDER BY week ASC
      `).bind(now - 12 * WEEK_MS)),

      all<{ platform: string; app_version: string; count: number }>(db.prepare(`
        SELECT COALESCE(platform, 'unknown') AS platform,
               COALESCE(app_version, 'unknown') AS app_version,
               COUNT(*) AS count
        FROM installations WHERE last_seen_at > ?
        GROUP BY platform, app_version ORDER BY count DESC LIMIT 60
      `).bind(now - 30 * DAY_MS)),
    ]);

  const pair = (key: string) => ({
    current: counts?.[`${key}_now`] ?? 0,
    previous: counts?.[`${key}_before`] ?? 0,
  });

  return {
    generated_at: now,
    period_days: period.days,
    bucket_ms: period.bucketMs,
    installations: pair('installs'),
    accounts: pair('accounts'),
    requests: pair('requests'),
    // Only "now" exists: last_seen_at is overwritten on every visit.
    active_installations: counts?.active_now ?? 0,
    series: {
      requests: densify(requests, period, ['count']),
      installations: densify(installs, period, ['count']),
      accounts: densify(accounts, period, ['count']),
      installations_by_platform: byPlatform.map(row => ({
        t: row.bucket * period.bucketMs, key: row.platform, count: row.count,
      })),
    },
    retention_by_week: cohorts.map(row => ({
      week_start: row.week * WEEK_MS,
      size: row.size,
      d1: row.d1,
      d7: row.d7,
      d30: row.d30,
    })),
    active_versions_30d: active,
  };
}

// ---------------------------------------------------------------------------
// Money
// ---------------------------------------------------------------------------

/**
 * What the billing tables already hold: invoices,
 * subscriptions, reminders and the bytes the paid plan is metered in. Totals
 * only. No invoice is listed with its account, no payer is named.
 */
export async function adminMoney(request: Request, env: Env) {
  await requireAdmin(request, env);
  const period = readPeriod(request);
  const { now, since, previousSince } = period;
  const db = env.ACCOUNT_DB;
  // An invoice is paid when it was credited; older rows only have the update.
  const paid = `(
    SELECT COALESCE(credited_at, updated_at) AS paid_at, amount_cents,
           COALESCE(amount_sats, 0) AS amount_sats, months
    FROM invoices WHERE status = 'paid'
  )`;

  const [
    byStatus, byStatusAll, compare, series, monthly, monthsMix,
    subscriptions, expiries, reminders, usageSeries, usageByType, usageByPlan, allowance,
  ] = await Promise.all([
    all<{ status: string; count: number; cents: number; sats: number }>(db.prepare(`
      SELECT status, COUNT(*) AS count, COALESCE(SUM(amount_cents), 0) AS cents,
             COALESCE(SUM(amount_sats), 0) AS sats
      FROM invoices WHERE created_at > ? GROUP BY status
    `).bind(since)),

    all<{ status: string; count: number; cents: number; sats: number }>(db.prepare(`
      SELECT status, COUNT(*) AS count, COALESCE(SUM(amount_cents), 0) AS cents,
             COALESCE(SUM(amount_sats), 0) AS sats
      FROM invoices GROUP BY status
    `)),

    db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN paid_at > ? THEN 1 ELSE 0 END), 0) AS count_now,
        COALESCE(SUM(CASE WHEN paid_at > ? THEN amount_cents ELSE 0 END), 0) AS cents_now,
        COALESCE(SUM(CASE WHEN paid_at > ? THEN amount_sats ELSE 0 END), 0) AS sats_now,
        COALESCE(SUM(CASE WHEN paid_at <= ? THEN 1 ELSE 0 END), 0) AS count_before,
        COALESCE(SUM(CASE WHEN paid_at <= ? THEN amount_cents ELSE 0 END), 0) AS cents_before,
        COALESCE(SUM(CASE WHEN paid_at <= ? THEN amount_sats ELSE 0 END), 0) AS sats_before
      FROM ${paid} WHERE paid_at > ?
    `).bind(since, since, since, since, since, since, previousSince)
      .first<Record<string, number>>(),

    all<BucketRow>(db.prepare(`
      SELECT ${bucketOf('paid_at', period)} AS bucket, COUNT(*) AS count,
             SUM(amount_cents) AS cents, SUM(amount_sats) AS sats
      FROM ${paid} WHERE paid_at > ? GROUP BY bucket
    `).bind(since)),

    all<{ month: string; count: number; cents: number; sats: number }>(db.prepare(`
      SELECT strftime('%Y-%m', paid_at / 1000, 'unixepoch') AS month, COUNT(*) AS count,
             SUM(amount_cents) AS cents, SUM(amount_sats) AS sats
      FROM ${paid} WHERE paid_at > ? GROUP BY month ORDER BY month ASC
    `).bind(now - 366 * DAY_MS)),

    all<{ months: number; count: number }>(db.prepare(`
      SELECT months, COUNT(*) AS count FROM ${paid} GROUP BY months ORDER BY months ASC
    `)),

    db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN plan <> 'free' AND plan_expires_at > ? THEN 1 ELSE 0 END), 0) AS active,
        COALESCE(SUM(CASE WHEN plan <> 'free' AND plan_expires_at > ?
                           AND plan_expires_at <= ? THEN 1 ELSE 0 END), 0) AS expiring_7d,
        COALESCE(SUM(CASE WHEN plan <> 'free' AND plan_expires_at > ?
                           AND plan_expires_at <= ? THEN 1 ELSE 0 END), 0) AS expiring_30d,
        COALESCE(SUM(CASE WHEN plan <> 'free' AND plan_expires_at <= ? THEN 1 ELSE 0 END), 0) AS overdue,
        COALESCE(SUM(CASE WHEN plan = 'free' THEN 1 ELSE 0 END), 0) AS free
      FROM entitlements
    `).bind(now, now, now + 7 * DAY_MS, now, now + 30 * DAY_MS, now)
      .first<Record<string, number>>(),

    // Dates only: when the next plans run out, never whose they are.
    all<{ plan_expires_at: number }>(db.prepare(`
      SELECT plan_expires_at FROM entitlements
      WHERE plan <> 'free' AND plan_expires_at > ? AND plan_expires_at <= ?
      ORDER BY plan_expires_at ASC LIMIT 60
    `).bind(now, now + 30 * DAY_MS)),

    all<{ kind: string; count: number }>(db.prepare(`
      SELECT kind, COUNT(*) AS count FROM billing_reminders
      WHERE sent_at > ? GROUP BY kind
    `).bind(since)),

    all<BucketRow>(db.prepare(`
      SELECT ${bucketOf('created_at', period)} AS bucket, COUNT(*) AS count,
             SUM(input_bytes) AS input_bytes, SUM(output_bytes) AS output_bytes
      FROM cloud_request_ledger
      WHERE status = 'confirmed' AND created_at > ? GROUP BY bucket
    `).bind(since)),

    all<{ request_type: string; status: string; count: number }>(db.prepare(`
      SELECT request_type, status, COUNT(*) AS count
      FROM cloud_request_ledger WHERE created_at > ?
      GROUP BY request_type, status
    `).bind(since)),

    // By the plan the account holds today: the ledger does not record which
    // plan a request was served under, and adding that would be new tracking.
    all<{ plan: string; count: number; input_bytes: number; output_bytes: number }>(db.prepare(`
      SELECT e.plan AS plan, COUNT(*) AS count,
             COALESCE(SUM(l.input_bytes), 0) AS input_bytes,
             COALESCE(SUM(l.output_bytes), 0) AS output_bytes
      FROM cloud_request_ledger l
      JOIN entitlements e ON e.user_id = l.user_id
      WHERE l.status = 'confirmed' AND l.created_at > ?
      GROUP BY e.plan
    `).bind(since)),

    db.prepare(`
      SELECT
        COUNT(*) AS accounts,
        COALESCE(SUM(u.input_bytes_used), 0) AS input_used,
        COALESCE(SUM(e.input_bytes_limit), 0) AS input_limit,
        COALESCE(SUM(u.output_bytes_used), 0) AS output_used,
        COALESCE(SUM(e.output_bytes_limit), 0) AS output_limit,
        COALESCE(SUM(CASE WHEN e.output_bytes_limit > 0
          AND u.output_bytes_used * 10 >= e.output_bytes_limit * 8 THEN 1 ELSE 0 END), 0) AS near_limit
      FROM entitlements e
      JOIN usage_counters u ON u.user_id = e.user_id
      WHERE e.plan <> 'free' AND e.plan_expires_at > ?
    `).bind(now).first<Record<string, number>>(),
  ]);

  const created = byStatus.reduce((sum, row) => sum + row.count, 0);
  const paidInPeriod = byStatus.find(row => row.status === 'paid')?.count ?? 0;

  return {
    generated_at: now,
    period_days: period.days,
    bucket_ms: period.bucketMs,
    // amount_cents is quoted in the anchor currency. invoices.currency is what
    // BTCPay settles in, always BTC, and says nothing about the fiat figure.
    fiat_currency: anchorCurrency(env),
    revenue: {
      current: {
        count: compare?.count_now ?? 0,
        cents: compare?.cents_now ?? 0,
        sats: compare?.sats_now ?? 0,
      },
      previous: {
        count: compare?.count_before ?? 0,
        cents: compare?.cents_before ?? 0,
        sats: compare?.sats_before ?? 0,
      },
      series: densify(series, period, ['count', 'cents', 'sats']),
      monthly,
      months_mix: monthsMix,
    },
    invoices: {
      period: byStatus,
      all_time: byStatusAll,
      // Of the invoices opened in the period, how many were paid.
      created,
      paid: paidInPeriod,
      paid_percent: created > 0 ? Math.round((paidInPeriod / created) * 1000) / 10 : null,
    },
    subscriptions: {
      active: subscriptions?.active ?? 0,
      expiring_7d: subscriptions?.expiring_7d ?? 0,
      expiring_30d: subscriptions?.expiring_30d ?? 0,
      // Past its date and not yet swept back to free by the hourly cron.
      overdue: subscriptions?.overdue ?? 0,
      free: subscriptions?.free ?? 0,
      next_expiries: expiries.map(row => row.plan_expires_at),
      reminders: reminders,
    },
    usage: {
      series: densify(usageSeries, period, ['count', 'input_bytes', 'output_bytes']),
      by_type: usageByType,
      by_plan: usageByPlan,
      allowance: {
        accounts: allowance?.accounts ?? 0,
        input_used: allowance?.input_used ?? 0,
        input_limit: allowance?.input_limit ?? 0,
        output_used: allowance?.output_used ?? 0,
        output_limit: allowance?.output_limit ?? 0,
        near_limit: allowance?.near_limit ?? 0,
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Venice cost
// ---------------------------------------------------------------------------

type VeniceBalance = {
  balances: { USD: number; DIEM: number; BUNDLED_CREDITS: number };
  tier: string | null;
  key_expiration: string | null;
  next_epoch_begins: string | null;
};

function veniceKey(env: Env): string {
  return (env.VENICE_BILLING_API_KEY ?? env.VENICE_API_KEY ?? '').trim();
}

async function veniceJson(env: Env, path: string): Promise<Record<string, unknown>> {
  const base = env.VENICE_API_BASE ?? DEFAULT_VENICE_BASE;
  const res = await fetch(`${base}${path}`, {
    headers: { authorization: `Bearer ${veniceKey(env)}` },
    signal: AbortSignal.timeout(15_000),
  });
  const body = await res.json().catch(() => null) as Record<string, unknown> | null;
  if (!res.ok || !body) {
    const reason = typeof body?.error === 'string' ? `: ${body.error}` : '';
    throw new Error(`Venice answered ${res.status}${reason}`);
  }
  return body;
}

async function veniceBalance(env: Env): Promise<VeniceBalance> {
  const body = await veniceJson(env, '/api_keys/rate_limits');
  const data = (body.data ?? {}) as Record<string, unknown>;
  const balances = (data.balances ?? {}) as Record<string, unknown>;
  const amount = (key: string) => (typeof balances[key] === 'number' ? balances[key] as number : 0);
  return {
    balances: {
      USD: amount('USD'),
      DIEM: amount('DIEM'),
      BUNDLED_CREDITS: amount('BUNDLED_CREDITS'),
    },
    tier: typeof (data.apiTier as { id?: unknown } | undefined)?.id === 'string'
      ? (data.apiTier as { id: string }).id
      : null,
    key_expiration: typeof data.keyExpiration === 'string' ? data.keyExpiration : null,
    next_epoch_begins: typeof data.nextEpochBegins === 'string' ? data.nextEpochBegins : null,
  };
}

const VENICE_MAX_PAGES = 30;

type VeniceEntry = {
  amount?: number;
  currency?: string;
  sku?: string;
  units?: number;
  pricePerUnitUsd?: number;
  timestamp?: string;
};

/**
 * What Private Cloud costs: the balance left at Venice and what was spent,
 * by day and by product.
 *
 * Venice's ledger has one line per request. Those lines are added up here and
 * dropped: only the sums leave this function, never a request id, a token
 * count or a timestamp finer than the hour. Nothing is stored. The cost of a
 * line is its units times Venice's list price in USD, whichever balance paid
 * for it, so a day paid in DIEM and a day paid in USD compare.
 */
export async function adminVenice(request: Request, env: Env) {
  await requireAdmin(request, env);
  const period = readPeriod(request);
  if (!veniceKey(env)) return { configured: false as const };

  let balance: VeniceBalance;
  try {
    balance = await veniceBalance(env);
  } catch (error) {
    return {
      configured: true as const,
      error: error instanceof Error ? error.message : 'Venice request failed',
    };
  }

  const byBucket = new Map<number, { usd: number; lines: number }>();
  const bySku = new Map<string, { usd: number; units: number; lines: number }>();
  const byCurrency = new Map<string, number>();
  let totalUsd = 0;
  let truncated = false;
  let usageError: string | null = null;
  try {
    const first = new URLSearchParams({
      pageSize: '1000',
      startTimestamp: new Date(period.since).toISOString(),
      endTimestamp: new Date(period.now).toISOString(),
    });
    let query = first.toString();
    for (let page = 0; ; page += 1) {
      if (page === VENICE_MAX_PAGES) { truncated = true; break; }
      const body = await veniceJson(env, `/billing/usage-history?${query}`);
      for (const entry of (body.data ?? []) as VeniceEntry[]) {
        // Charges are negative; purchases and grants are not spending.
        if (typeof entry.amount !== 'number' || entry.amount >= 0) continue;
        const usd = (entry.units ?? 0) * (entry.pricePerUnitUsd ?? 0);
        const at = Date.parse(entry.timestamp ?? '');
        if (!Number.isFinite(at)) continue;
        const bucket = Math.floor(at / period.bucketMs);
        const day = byBucket.get(bucket) ?? { usd: 0, lines: 0 };
        day.usd += usd;
        day.lines += 1;
        byBucket.set(bucket, day);
        const sku = entry.sku ?? 'unknown';
        const product = bySku.get(sku) ?? { usd: 0, units: 0, lines: 0 };
        product.usd += usd;
        product.units += entry.units ?? 0;
        product.lines += 1;
        bySku.set(sku, product);
        const currency = entry.currency ?? 'unknown';
        byCurrency.set(currency, (byCurrency.get(currency) ?? 0) + usd);
        totalUsd += usd;
      }
      if (typeof body.nextCursor !== 'string' || !body.nextCursor) break;
      // Filters travel inside the cursor; sending them again is refused.
      query = new URLSearchParams({ cursor: body.nextCursor }).toString();
    }
  } catch (error) {
    usageError = error instanceof Error ? error.message : 'Venice request failed';
  }

  const round = (value: number) => Math.round(value * 10_000) / 10_000;
  const perDay = totalUsd / period.days;
  // DIEM refills every epoch, so only the balances that run down count.
  const spendable = balance.balances.USD + balance.balances.BUNDLED_CREDITS;
  return {
    configured: true as const,
    generated_at: period.now,
    period_days: period.days,
    bucket_ms: period.bucketMs,
    ...balance,
    usage_error: usageError,
    truncated,
    total_usd: round(totalUsd),
    per_day_usd: round(perDay),
    runway_days: perDay > 0 ? Math.floor(spendable / perDay) : null,
    series: densify(
      [...byBucket].map(([bucket, row]) => ({ bucket, usd: round(row.usd), lines: row.lines })),
      period,
      ['usd', 'lines'],
    ),
    by_sku: [...bySku]
      .map(([sku, row]) => ({ sku, usd: round(row.usd), units: round(row.units), lines: row.lines }))
      .sort((a, b) => b.usd - a.usd)
      .slice(0, 40),
    by_currency: [...byCurrency].map(([currency, usd]) => ({ currency, usd: round(usd) })),
  };
}

// ---------------------------------------------------------------------------
// Infrastructure (Cloudflare's own analytics)
// ---------------------------------------------------------------------------

type GraphqlRow = {
  count?: number;
  sum?: Record<string, number>;
  max?: Record<string, number>;
  avg?: Record<string, number>;
  quantiles?: Record<string, number>;
  dimensions?: Record<string, string>;
};

function cloudflareConfigured(env: Env): boolean {
  return Boolean(env.CF_ANALYTICS_API_TOKEN?.trim() && env.CF_ACCOUNT_ID?.trim());
}

async function cloudflareGraphql(
  env: Env,
  selection: string,
): Promise<Record<string, GraphqlRow[] | undefined>> {
  const body = await cloudflareJson(env, '/graphql', {
    method: 'POST',
    body: JSON.stringify({
      query: `query ($account: String!) {
        viewer { accounts(filter: { accountTag: $account }) { ${selection} } }
      }`,
      variables: { account: env.CF_ACCOUNT_ID!.trim() },
    }),
  });
  const errors = body.errors as Array<{ message?: string }> | null | undefined;
  if (errors && errors.length > 0) {
    throw new Error(errors.map(error => error.message ?? 'unknown error').join('; '));
  }
  return ((body.data as { viewer?: { accounts?: unknown[] } } | undefined)
    ?.viewer?.accounts?.[0] ?? {}) as Record<string, GraphqlRow[] | undefined>;
}

/** Only what a GraphQL string literal can hold safely. */
function graphqlName(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]/g, '');
}

type WorkerPoint = {
  t: number;
  requests: number;
  errors: number;
  subrequests: number;
  cpu_p50_ms: number;
  cpu_p99_ms: number;
};

/**
 * The Worker's requests, errors and CPU time from Cloudflare. Asked a week at
 * a time, the longest span the dataset answers in one query.
 */
async function workerMetrics(env: Env, period: Period) {
  const script = graphqlName(env.CF_WORKER_SCRIPT_NAME?.trim() || DEFAULT_WORKER_SCRIPT);
  const dimension = period.days === 1 ? 'datetimeHour' : 'date';
  const windows: Array<[number, number]> = [];
  for (let end = period.now; end > period.since; end -= WEEK_MS) {
    windows.push([Math.max(period.since, end - WEEK_MS), end]);
  }
  const selection = windows.map(([from, to], index) => `
    w${index}: workersInvocationsAdaptive(
      limit: 2000
      filter: {
        datetime_geq: "${new Date(from).toISOString()}"
        datetime_lt: "${new Date(to).toISOString()}"
        scriptName: "${script}"
      }
    ) {
      sum { requests errors subrequests }
      quantiles { cpuTimeP50 cpuTimeP99 }
      dimensions { ${dimension} status }
    }`).join('\n');
  const account = await cloudflareGraphql(env, selection);

  const byBucket = new Map<number, WorkerPoint>();
  const byStatus = new Map<string, number>();
  for (const rows of Object.values(account)) {
    for (const row of rows ?? []) {
      const at = Date.parse(row.dimensions?.[dimension] ?? '');
      if (!Number.isFinite(at)) continue;
      const bucket = Math.floor(at / period.bucketMs);
      const point = byBucket.get(bucket) ?? {
        t: bucket * period.bucketMs,
        requests: 0, errors: 0, subrequests: 0, cpu_p50_ms: 0, cpu_p99_ms: 0,
      };
      const requests = row.sum?.requests ?? 0;
      point.requests += requests;
      point.errors += row.sum?.errors ?? 0;
      point.subrequests += row.sum?.subrequests ?? 0;
      // Cloudflare reports CPU time in microseconds. A bucket holds one row
      // per status; the success row speaks for the median, the worst for
      // the tail.
      if (row.dimensions?.status === 'success' || point.cpu_p50_ms === 0) {
        point.cpu_p50_ms = Math.round((row.quantiles?.cpuTimeP50 ?? 0) / 10) / 100;
      }
      point.cpu_p99_ms = Math.max(
        point.cpu_p99_ms,
        Math.round((row.quantiles?.cpuTimeP99 ?? 0) / 10) / 100,
      );
      byBucket.set(bucket, point);
      const status = row.dimensions?.status ?? 'unknown';
      byStatus.set(status, (byStatus.get(status) ?? 0) + requests);
    }
  }

  const current = Math.floor(period.now / period.bucketMs);
  const series: WorkerPoint[] = [];
  for (let offset = period.buckets - 1; offset >= 0; offset -= 1) {
    const bucket = current - offset;
    series.push(byBucket.get(bucket) ?? {
      t: bucket * period.bucketMs,
      requests: 0, errors: 0, subrequests: 0, cpu_p50_ms: 0, cpu_p99_ms: 0,
    });
  }
  const requests = series.reduce((sum, point) => sum + point.requests, 0);
  const errors = series.reduce((sum, point) => sum + point.errors, 0);
  return {
    script,
    requests,
    errors,
    error_percent: requests > 0 ? Math.round((errors / requests) * 10_000) / 100 : null,
    by_status: [...byStatus].map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count),
    series,
  };
}

/** D1's analytics keep 31 days. */
const D1_RETENTION_DAYS = 31;

async function databaseMetrics(env: Env, period: Period) {
  const databaseId = graphqlName(env.CF_D1_DATABASE_ID?.trim() ?? '');
  const days = Math.min(period.days, D1_RETENTION_DAYS);
  const since = period.now - days * DAY_MS;
  const hourly = period.days === 1;
  const dimension = hourly ? 'datetimeHour' : 'date';
  const scope = databaseId ? `databaseId: "${databaseId}"` : '';
  const range = `
    datetime_geq: "${new Date(since).toISOString()}"
    datetime_leq: "${new Date(period.now).toISOString()}"
    ${scope}`;
  const account = await cloudflareGraphql(env, `
    activity: d1AnalyticsAdaptiveGroups(limit: 2000, filter: { ${range} }) {
      sum { readQueries writeQueries rowsRead rowsWritten }
      quantiles { queryBatchTimeMsP50 queryBatchTimeMsP99 }
      dimensions { ${dimension} }
    }
    storage: d1StorageAdaptiveGroups(
      limit: 1, filter: { ${range} }, orderBy: [datetime_DESC]
    ) { max { databaseSizeBytes } dimensions { datetime } }
    slowest: d1QueriesAdaptiveGroups(
      limit: 12, filter: { ${range} }, orderBy: [sum_queryDurationMs_DESC]
    ) {
      count
      avg { queryDurationMs }
      sum { queryDurationMs rowsRead rowsWritten }
      dimensions { query }
    }`);

  const rows: BucketRow[] = [];
  for (const row of account.activity ?? []) {
    const at = Date.parse(row.dimensions?.[dimension] ?? '');
    if (!Number.isFinite(at)) continue;
    rows.push({
      bucket: Math.floor(at / period.bucketMs),
      read_queries: row.sum?.readQueries ?? 0,
      write_queries: row.sum?.writeQueries ?? 0,
      rows_read: row.sum?.rowsRead ?? 0,
      rows_written: row.sum?.rowsWritten ?? 0,
      p50_ms: Math.round((row.quantiles?.queryBatchTimeMsP50 ?? 0) * 100) / 100,
      p99_ms: Math.round((row.quantiles?.queryBatchTimeMsP99 ?? 0) * 100) / 100,
    });
  }
  const shown: Period = { ...period, buckets: hourly ? 24 : days };
  const series = densify(
    rows, shown,
    ['read_queries', 'write_queries', 'rows_read', 'rows_written', 'p50_ms', 'p99_ms'],
  );
  const total = (key: 'read_queries' | 'write_queries' | 'rows_read' | 'rows_written') =>
    series.reduce((sum, point) => sum + point[key], 0);
  return {
    // Without an id the figures cover every D1 database of the account.
    scoped_to_database: Boolean(databaseId),
    days_shown: hourly ? 1 : days,
    size_bytes: account.storage?.[0]?.max?.databaseSizeBytes ?? null,
    read_queries: total('read_queries'),
    write_queries: total('write_queries'),
    rows_read: total('rows_read'),
    rows_written: total('rows_written'),
    series,
    // Statement text as D1 logs it: the SQL with its placeholders, never the
    // bound values.
    slowest_queries: (account.slowest ?? []).map(row => ({
      query: (row.dimensions?.query ?? '').replace(/\s+/g, ' ').trim().slice(0, 240),
      runs: row.count ?? 0,
      avg_ms: Math.round((row.avg?.queryDurationMs ?? 0) * 100) / 100,
      total_ms: Math.round(row.sum?.queryDurationMs ?? 0),
      rows_read: row.sum?.rowsRead ?? 0,
      rows_written: row.sum?.rowsWritten ?? 0,
    })),
  };
}

/**
 * The Worker and its database as Cloudflare measures them. Adds no
 * collection: these are counters Cloudflare keeps for every Worker, read with
 * the same Account Analytics token as the site visits.
 */
export async function adminPlatform(request: Request, env: Env) {
  await requireAdmin(request, env);
  const period = readPeriod(request);
  if (!cloudflareConfigured(env)) return { configured: false as const };
  const settle = async <T>(work: Promise<T>) => {
    try {
      return { data: await work, error: null as string | null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Cloudflare request failed',
      };
    }
  };
  const [worker, database] = await Promise.all([
    settle(workerMetrics(env, period)),
    settle(databaseMetrics(env, period)),
  ]);
  return {
    configured: true as const,
    generated_at: period.now,
    period_days: period.days,
    bucket_ms: period.bucketMs,
    worker: worker.data,
    worker_error: worker.error,
    database: database.data,
    database_error: database.error,
  };
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

/**
 * BTCPay going down and coming back are written to technical_events under
 * the 'venice' category, the only one the table's CHECK left room for. They
 * are news about the payment host, not AI failures, so every count here
 * leaves them out and the page shows them on their own.
 */
const NOT_BTCPAY = `code NOT IN ('btcpay_up', 'btcpay_down')`;

export async function adminErrors(request: Request, env: Env) {
  await requireAdmin(request, env);
  const period = readPeriod(request);
  const { since, previousSince } = period;
  const db = env.ACCOUNT_DB;

  const [series, codes, totals, btcpay] = await Promise.all([
    all<{ bucket: number; category: string; count: number }>(db.prepare(`
      SELECT ${bucketOf('created_at', period)} AS bucket, category, COUNT(*) AS count
      FROM technical_events
      WHERE created_at > ? AND ${NOT_BTCPAY}
      GROUP BY bucket, category
    `).bind(since)),

    all<Record<string, number | string>>(db.prepare(`
      SELECT category, code, MAX(status) AS status,
             SUM(CASE WHEN created_at > ? THEN 1 ELSE 0 END) AS count,
             SUM(CASE WHEN created_at <= ? THEN 1 ELSE 0 END) AS previous,
             MIN(created_at) AS first_at, MAX(created_at) AS last_at
      FROM technical_events
      WHERE created_at > ? AND ${NOT_BTCPAY}
      GROUP BY category, code
      HAVING count > 0
      ORDER BY count DESC LIMIT 60
    `).bind(since, since, previousSince)),

    db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN created_at > ? THEN 1 ELSE 0 END), 0) AS count_now,
        COALESCE(SUM(CASE WHEN created_at <= ? THEN 1 ELSE 0 END), 0) AS count_before,
        COALESCE(SUM(CASE WHEN created_at > ? AND status >= 500 THEN 1 ELSE 0 END), 0) AS server_now,
        COALESCE(SUM(CASE WHEN created_at <= ? AND status >= 500 THEN 1 ELSE 0 END), 0) AS server_before
      FROM technical_events
      WHERE created_at > ? AND ${NOT_BTCPAY}
    `).bind(since, since, since, since, previousSince).first<Record<string, number>>(),

    all<{ code: string; created_at: number }>(db.prepare(`
      SELECT code, created_at FROM technical_events
      WHERE code IN ('btcpay_up', 'btcpay_down')
      ORDER BY created_at DESC LIMIT 40
    `)),
  ]);

  return {
    generated_at: period.now,
    period_days: period.days,
    bucket_ms: period.bucketMs,
    total: { current: totals?.count_now ?? 0, previous: totals?.count_before ?? 0 },
    // 5xx: Alice or something it depends on failed. The rest are refusals
    // that worked as designed (a wrong password, a rate limit).
    server: { current: totals?.server_now ?? 0, previous: totals?.server_before ?? 0 },
    series: series.map(row => ({
      t: row.bucket * period.bucketMs, key: row.category, count: row.count,
    })),
    codes,
    btcpay_events: btcpay,
  };
}

// ---------------------------------------------------------------------------
// Versions
// ---------------------------------------------------------------------------

async function vercelDeployment(env: Env) {
  const token = env.VERCEL_API_TOKEN?.trim();
  const project = env.VERCEL_PROJECT_ID?.trim();
  if (!token || !project) return { configured: false as const };
  try {
    const query = new URLSearchParams({ projectId: project, target: 'production', limit: '1' });
    if (env.VERCEL_TEAM_ID?.trim()) query.set('teamId', env.VERCEL_TEAM_ID.trim());
    const res = await fetch(`https://api.vercel.com/v7/deployments?${query}`, {
      headers: { authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10_000),
    });
    const body = await res.json().catch(() => null) as {
      deployments?: Array<Record<string, unknown>>;
      error?: { message?: string };
    } | null;
    if (!res.ok || !body) {
      throw new Error(`Vercel answered ${res.status}${body?.error?.message ? `: ${body.error.message}` : ''}`);
    }
    const latest = body.deployments?.[0];
    const meta = (latest?.meta ?? {}) as Record<string, unknown>;
    return {
      configured: true as const,
      state: String(latest?.readyState ?? latest?.state ?? 'unknown'),
      created_at: typeof latest?.created === 'number' ? latest.created : null,
      commit: typeof meta.githubCommitSha === 'string' ? meta.githubCommitSha.slice(0, 8) : null,
      message: typeof meta.githubCommitMessage === 'string'
        ? meta.githubCommitMessage.split('\n')[0].slice(0, 120)
        : null,
    };
  } catch (error) {
    return {
      configured: true as const,
      error: error instanceof Error ? error.message : 'Vercel request failed',
    };
  }
}

/**
 * What is running where: the checkout the console runs from, the migrations
 * the database has against the ones the checkout holds, the Worker versions
 * that served traffic this week, and the site's last deployment.
 */
export async function adminVersions(request: Request, env: Env) {
  await requireAdmin(request, env);
  const now = Date.now();

  // Wrangler keeps this table. A database built another way has none.
  let applied: Array<{ name: string; applied_at: string }> = [];
  let appliedError: string | null = null;
  try {
    applied = await all<{ name: string; applied_at: string }>(env.ACCOUNT_DB.prepare(`
      SELECT name, applied_at FROM d1_migrations ORDER BY id ASC
    `));
  } catch {
    appliedError = 'This database has no d1_migrations table, so what was applied cannot be read.';
  }
  const expected = (env.CONSOLE_MIGRATION_FILES ?? '')
    .split(',').map(name => name.trim()).filter(Boolean).sort();
  const appliedNames = new Set(applied.map(row => row.name));

  let workerVersions: Array<{ version: string; requests: number; first_day: string; last_day: string }> = [];
  let workerError: string | null = null;
  if (cloudflareConfigured(env)) {
    try {
      const script = graphqlName(env.CF_WORKER_SCRIPT_NAME?.trim() || DEFAULT_WORKER_SCRIPT);
      const account = await cloudflareGraphql(env, `
        versions: workersInvocationsAdaptive(
          limit: 500
          filter: {
            datetime_geq: "${new Date(now - WEEK_MS).toISOString()}"
            datetime_lt: "${new Date(now).toISOString()}"
            scriptName: "${script}"
          }
        ) { sum { requests } dimensions { scriptVersion date } }`);
      const byVersion = new Map<string, { requests: number; first_day: string; last_day: string }>();
      for (const row of account.versions ?? []) {
        const version = row.dimensions?.scriptVersion || 'unknown';
        const day = row.dimensions?.date ?? '';
        const entry = byVersion.get(version) ?? { requests: 0, first_day: day, last_day: day };
        entry.requests += row.sum?.requests ?? 0;
        if (day < entry.first_day) entry.first_day = day;
        if (day > entry.last_day) entry.last_day = day;
        byVersion.set(version, entry);
      }
      workerVersions = [...byVersion]
        .map(([version, entry]) => ({ version, ...entry }))
        .sort((a, b) => (a.last_day === b.last_day
          ? b.first_day.localeCompare(a.first_day)
          : b.last_day.localeCompare(a.last_day)));
    } catch (error) {
      workerError = error instanceof Error ? error.message : 'Cloudflare request failed';
    }
  }

  return {
    generated_at: now,
    console: {
      branch: env.CONSOLE_GIT_BRANCH?.trim() || null,
      commit: env.CONSOLE_GIT_COMMIT?.trim() || null,
    },
    migrations: {
      applied,
      applied_error: appliedError,
      // Null when the launcher did not say what the checkout holds.
      pending: expected.length > 0 && !appliedError
        ? expected.filter(name => !appliedNames.has(name))
        : null,
      checkout_count: expected.length || null,
    },
    worker_versions_7d: workerVersions,
    worker_error: workerError,
    cloudflare_configured: cloudflareConfigured(env),
    site: await vercelDeployment(env),
  };
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

type Level = 'ok' | 'warn' | 'bad' | 'unknown';
type Check = { key: string; label: string; level: Level; summary: string };

async function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('no answer in time')), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The first page: one light per thing Alice depends on, each with the
 * sentence that explains its colour, and what happened since the operator
 * last opened the console.
 *
 * A light is only ever red for something that needs a person. Too little
 * traffic to judge reads as fine with the reason given, not as a warning.
 */
export async function adminHealth(request: Request, env: Env) {
  const admin = await requireAdmin(request, env);
  const now = Date.now();
  const day = now - DAY_MS;
  const db = env.ACCOUNT_DB;
  const checks: Check[] = [];

  const started = Date.now();
  const [ledger, errors, btcpay, invoices, visits] = await Promise.all([
    all<{ status: string; count: number }>(db.prepare(`
      SELECT status, COUNT(*) AS count FROM cloud_request_ledger
      WHERE created_at > ? GROUP BY status
    `).bind(day)),
    all<{ category: string; count: number; server: number }>(db.prepare(`
      SELECT category, COUNT(*) AS count,
             SUM(CASE WHEN status >= 500 THEN 1 ELSE 0 END) AS server
      FROM technical_events
      WHERE created_at > ? AND ${NOT_BTCPAY} GROUP BY category
    `).bind(day)),
    db.prepare(`
      SELECT code, created_at FROM technical_events
      WHERE code IN ('btcpay_up', 'btcpay_down')
      ORDER BY created_at DESC LIMIT 1
    `).first<{ code: string; created_at: number }>(),
    db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) AS pending,
        COALESCE(SUM(CASE WHEN status = 'paid' AND COALESCE(credited_at, updated_at) > ?
                 THEN 1 ELSE 0 END), 0) AS paid_24h
      FROM invoices
    `).bind(day).first<{ pending: number; paid_24h: number }>(),
    // The sign-in before this one: admin_login is written once per half hour
    // of use, so the second most recent is the previous visit.
    all<{ created_at: number }>(db.prepare(`
      SELECT created_at FROM admin_audit_log
      WHERE actor_user_id = ? AND action = 'admin_login'
      ORDER BY created_at DESC LIMIT 2
    `).bind(admin.userId)),
  ]);
  const databaseMs = Date.now() - started;

  checks.push({
    key: 'database',
    label: 'Database',
    level: databaseMs > 4_000 ? 'warn' : 'ok',
    summary: `Answered 5 queries in ${databaseMs} ms from this console.`,
  });

  const ledgerCount = (status: string) => ledger.find(row => row.status === status)?.count ?? 0;
  const confirmed = ledgerCount('confirmed');
  const refunded = ledgerCount('refunded');
  const answered = confirmed + refunded;
  const refundedShare = answered > 0 ? refunded / answered : 0;
  checks.push({
    key: 'ai',
    label: 'Private Cloud (Venice)',
    level: answered < 5 ? 'ok' : (refundedShare > 0.3 ? 'bad' : (refundedShare > 0.1 ? 'warn' : 'ok')),
    summary: answered === 0
      ? 'No Private Cloud request in the last 24 hours.'
      : `${confirmed} answered and ${refunded} refunded after an upstream failure in 24 hours`
        + (answered < 5 ? ', too few to judge a failure rate.' : `, ${Math.round(refundedShare * 100)}% failed.`),
  });

  const errorRow = (category: string) => errors.find(row => row.category === category);
  const auth = errorRow('auth');
  checks.push({
    key: 'auth',
    label: 'Sign-in and accounts',
    level: (auth?.server ?? 0) > 0 ? 'bad' : 'ok',
    summary: (auth?.server ?? 0) > 0
      ? `${auth!.server} server-side failures in 24 hours. See Errors.`
      : `No server-side failure in 24 hours. ${auth?.count ?? 0} refusals that worked as designed (wrong code, rate limit).`,
  });

  const email = errorRow('email');
  checks.push({
    key: 'email',
    label: 'Login emails',
    level: (email?.count ?? 0) > 0 ? 'warn' : 'ok',
    summary: (email?.count ?? 0) > 0
      ? `${email!.count} login emails could not be sent in 24 hours.`
      : 'No delivery failure in 24 hours.',
  });

  const down = btcpay?.code === 'btcpay_down';
  checks.push({
    key: 'payments',
    label: 'Payments (BTCPay)',
    level: down ? 'bad' : 'ok',
    summary: down
      ? `Reported down since ${new Date(btcpay!.created_at).toISOString().slice(0, 16).replace('T', ' ')} UTC and not seen back. Payments cannot be taken.`
      : `No outage in progress. ${invoices?.paid_24h ?? 0} invoices paid in 24 hours, ${invoices?.pending ?? 0} waiting for payment.`
        + (btcpay ? ` Last outage ended ${new Date(btcpay.created_at).toISOString().slice(0, 10)}.` : ''),
  });

  // The three outside calls run together and none can hold the page up.
  const [worker, venice, faucet] = await Promise.all([
    cloudflareConfigured(env)
      ? withTimeout(workerMetrics(env, periodOf(1, now)), 8_000)
        .then(data => ({ data, error: null as string | null }))
        .catch((error: Error) => ({ data: null, error: error.message }))
      : null,
    veniceKey(env)
      ? withTimeout(veniceBalance(env), 8_000)
        .then(data => ({ data, error: null as string | null }))
        .catch((error: Error) => ({ data: null, error: error.message }))
      : null,
    withTimeout(testWalletFaucetStatus(env, now), 8_000)
      .then(data => ({ data, error: null as string | null }))
      .catch((error: Error) => ({ data: null, error: error.message })),
  ]);

  if (!worker) {
    checks.push({
      key: 'worker', label: 'Worker', level: 'unknown',
      summary: 'Cloudflare is not connected: CF_ANALYTICS_API_TOKEN and CF_ACCOUNT_ID are missing from .dev.vars.',
    });
  } else if (!worker.data) {
    checks.push({
      key: 'worker', label: 'Worker', level: 'unknown',
      summary: `Cloudflare could not be read: ${worker.error}`,
    });
  } else {
    const percent = worker.data.error_percent ?? 0;
    checks.push({
      key: 'worker',
      label: 'Worker',
      level: worker.data.requests < 50 ? 'ok' : (percent > 5 ? 'bad' : (percent > 1 ? 'warn' : 'ok')),
      summary: `${worker.data.requests} requests in 24 hours, ${worker.data.errors} ended in an exception`
        + (worker.data.requests > 0 ? ` (${percent}%).` : '.'),
    });
  }

  const veniceFloor = Number(env.ADMIN_ALERT_VENICE_USD) > 0
    ? Number(env.ADMIN_ALERT_VENICE_USD)
    : DEFAULT_VENICE_ALERT_USD;
  if (!venice) {
    checks.push({
      key: 'venice_balance', label: 'Venice balance', level: 'unknown',
      summary: 'No Venice key in .dev.vars, so the balance cannot be read.',
    });
  } else if (!venice.data) {
    checks.push({
      key: 'venice_balance', label: 'Venice balance', level: 'unknown',
      summary: `The balance could not be read: ${venice.error}. A placeholder key in .dev.vars gives exactly this; set VENICE_BILLING_API_KEY.`,
    });
  } else {
    const { USD, DIEM, BUNDLED_CREDITS } = venice.data.balances;
    // DIEM refills by itself; with none, the dollar balance is all there is.
    const low = DIEM <= 0 && USD + BUNDLED_CREDITS < veniceFloor;
    checks.push({
      key: 'venice_balance',
      label: 'Venice balance',
      level: low ? 'warn' : 'ok',
      summary: `${USD.toFixed(2)} USD, ${DIEM.toFixed(2)} DIEM, ${BUNDLED_CREDITS.toFixed(2)} USD of bundled credits.`
        + (low ? ` Below the ${veniceFloor} USD floor.` : ''),
    });
  }

  if (!faucet.data) {
    checks.push({
      key: 'faucet', label: 'Test wallet faucet', level: 'unknown',
      summary: `The faucet could not be read: ${faucet.error}`,
    });
  } else if (!faucet.data.wallet) {
    checks.push({
      key: 'faucet', label: 'Test wallet faucet', level: 'unknown',
      summary: faucet.data.walletError
        ? `The Mutinynet chain could not be read: ${faucet.data.walletError}`
        : 'No faucet wallet is visible from this console (TEST_WALLET_FAUCET_XPUB is not set).',
    });
  } else {
    checks.push({
      key: 'faucet',
      label: 'Test wallet faucet',
      level: faucet.data.wallet.low ? 'warn' : 'ok',
      summary: `${faucet.data.wallet.balanceSats} sats left, enough for ${faucet.data.wallet.payoutsLeft} payouts.`
        + (faucet.data.wallet.low ? ' Top it up.' : ''),
    });
  }

  const crons = await cronStatuses(env, now);
  if (!crons) {
    checks.push({
      key: 'crons', label: 'Scheduled tasks', level: 'unknown',
      summary: 'The cron_runs table does not exist: migration 0021 is not applied to this database.',
    });
  } else if (crons.every(cron => cron.last_started_at === null)) {
    checks.push({
      key: 'crons', label: 'Scheduled tasks', level: 'unknown',
      summary: 'No run recorded yet. The Worker that records them is not deployed, or no cron has fired since.',
    });
  } else {
    const late = crons.filter(cron => cron.late || cron.last_started_at === null);
    const failing = crons.filter(cron => cron.last_ok === false);
    const stuck = failing.filter(cron => cron.failures_in_a_row >= 3);
    const names = (list: typeof crons) => list.map(cron => cron.label).join(', ');
    checks.push({
      key: 'crons',
      label: 'Scheduled tasks',
      level: late.length > 0 || stuck.length > 0 ? 'bad' : (failing.length > 0 ? 'warn' : 'ok'),
      summary: late.length > 0
        ? `Not running on time: ${names(late)}.`
        : failing.length > 0
          ? `Last run failed: ${names(failing)}.`
          : `All ${crons.length} ran on time and worked.`,
    });
  }

  // What changed since the previous visit, capped at 30 days so a long
  // absence does not turn this into a lifetime total.
  const previousVisit = visits[1]?.created_at ?? null;
  let sinceLastVisit: Record<string, number> | null = null;
  if (previousVisit) {
    const from = Math.max(previousVisit, now - 30 * DAY_MS);
    const counts = await db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM installations WHERE first_seen_at > ?) AS installations,
        (SELECT COUNT(*) FROM (
          SELECT MIN(created_at) AS first_at FROM user_identities GROUP BY user_id
        ) WHERE first_at > ?) AS accounts,
        (SELECT COUNT(*) FROM cloud_request_ledger
          WHERE status = 'confirmed' AND created_at > ?) AS requests,
        (SELECT COUNT(*) FROM invoices
          WHERE status = 'paid' AND COALESCE(credited_at, updated_at) > ?) AS paid_invoices,
        (SELECT COUNT(*) FROM technical_events
          WHERE created_at > ? AND status >= 500 AND ${NOT_BTCPAY}) AS server_errors
    `).bind(from, from, from, from, from).first<Record<string, number>>();
    sinceLastVisit = { since: from, ...(counts ?? {}) };
  }

  return {
    generated_at: now,
    checks,
    alerts: checks.filter(check => check.level === 'warn' || check.level === 'bad'),
    crons,
    since_last_visit: sinceLastVisit,
  };
}

// ---------------------------------------------------------------------------
// GitHub: downloads and repository traffic
// ---------------------------------------------------------------------------

const GITHUB_API = 'https://api.github.com';
const GITHUB_REPOS = [
  { repo: 'alice-btc/alice', product: 'Alice' },
  { repo: 'alice-btc/alice-wallet', product: 'Wallet' },
];

/**
 * The installers people download by hand. Checksums and signatures are left
 * out: they are fetched to verify an installer, not to install Alice.
 */
function installerPlatform(fileName: string): string | null {
  const name = fileName.toLowerCase();
  if (name.endsWith('.dmg')) return 'Mac';
  if (name.endsWith('.msi') || name.endsWith('.exe')) return 'Windows';
  if (name.endsWith('.appimage') || name.endsWith('.deb') || name.endsWith('.rpm')) return 'Linux';
  if (name.endsWith('.apk')) return 'Android';
  return null;
}

async function githubJson(env: Env, path: string): Promise<unknown> {
  const token = env.GITHUB_TRAFFIC_TOKEN?.trim();
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      accept: 'application/vnd.github+json',
      // GitHub refuses a request without a user agent.
      'user-agent': 'alice-admin-console',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
  return res.json();
}

type GithubRelease = {
  tag_name?: string;
  published_at?: string;
  draft?: boolean;
  assets?: Array<{ name?: string; download_count?: number }>;
};
type TrafficDay = { timestamp?: string; count?: number; uniques?: number };

/**
 * Downloads and repository traffic, from GitHub's own counters.
 *
 * GitHub gives a running total per release file and keeps traffic for 14
 * days, so each read also files today's figures in `github_daily`: that is
 * what turns totals into downloads per day and two weeks into months. It is
 * the one reading route that writes, and it writes counters about Alice's
 * public repositories, nothing about a person. GitHub counts repeats and
 * tells nobody who downloaded.
 *
 * The history only knows the days the console was opened. A gap of several
 * days files its downloads on the day of the next read, and the page says so.
 *
 * Traffic needs GITHUB_TRAFFIC_TOKEN; the download counters are public.
 */
export async function adminGithub(request: Request, env: Env) {
  await requireAdmin(request, env);
  const period = readPeriod(request);
  const today = Math.floor(period.now / DAY_MS);
  const db = env.ACCOUNT_DB;
  const errors: string[] = [];
  const upserts: D1PreparedStatement[] = [];
  const file = (day: number, repo: string, metric: string, item: string, count: number) =>
    upserts.push(db.prepare(`
      INSERT INTO github_daily (day, repo, metric, item, count) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT (day, repo, metric, item) DO UPDATE SET count = excluded.count
    `).bind(day, repo, metric, item.slice(0, 200), Math.max(0, Math.round(count))));

  const assets: Array<{
    repo: string; item: string; product: string; version: string;
    platform: string; file: string; count: number; added: number | null;
  }> = [];
  const releases: Array<{ product: string; version: string; published_at: number }> = [];
  const hasToken = Boolean(env.GITHUB_TRAFFIC_TOKEN?.trim());

  await Promise.all(GITHUB_REPOS.map(async ({ repo, product }) => {
    try {
      const list = await githubJson(env, `/repos/${repo}/releases?per_page=100`) as GithubRelease[];
      for (const release of list) {
        if (release.draft || !release.tag_name) continue;
        const published = Date.parse(release.published_at ?? '');
        if (Number.isFinite(published)) {
          releases.push({ product, version: release.tag_name, published_at: published });
        }
        for (const asset of release.assets ?? []) {
          const platform = installerPlatform(asset.name ?? '');
          if (!platform || !asset.name) continue;
          const item = `${release.tag_name}/${asset.name}`;
          const count = asset.download_count ?? 0;
          assets.push({ repo, item, product, version: release.tag_name, platform, file: asset.name, count, added: null });
          file(today, repo, 'downloads', item, count);
        }
      }
    } catch (error) {
      errors.push(`${product}: ${error instanceof Error ? error.message : 'GitHub request failed'}`);
    }
    if (!hasToken) return;
    try {
      const [views, clones, referrers] = await Promise.all([
        githubJson(env, `/repos/${repo}/traffic/views?per=day`) as Promise<{ views?: TrafficDay[] }>,
        githubJson(env, `/repos/${repo}/traffic/clones?per=day`) as Promise<{ clones?: TrafficDay[] }>,
        githubJson(env, `/repos/${repo}/traffic/popular/referrers`) as Promise<Array<{ referrer?: string; count?: number }>>,
      ]);
      const days = (rows: TrafficDay[] | undefined, total: string, uniques: string) => {
        for (const row of rows ?? []) {
          const at = Date.parse(row.timestamp ?? '');
          if (!Number.isFinite(at)) continue;
          file(Math.floor(at / DAY_MS), repo, total, '', row.count ?? 0);
          file(Math.floor(at / DAY_MS), repo, uniques, '', row.uniques ?? 0);
        }
      };
      days(views.views, 'views', 'view_uniques');
      days(clones.clones, 'clones', 'clone_uniques');
      // A rolling 14-day total per referring site, as GitHub gives it.
      for (const row of referrers ?? []) {
        if (row.referrer) file(today, repo, 'referrer_views', row.referrer, row.count ?? 0);
      }
    } catch (error) {
      errors.push(`${product} traffic: ${error instanceof Error ? error.message : 'GitHub request failed'}`);
    }
  }));

  type Row = { day: number; repo: string; metric: string; item: string; count: number };
  let history: Row[] = [];
  let historyError: string | null = null;
  try {
    for (let offset = 0; offset < upserts.length; offset += 50) {
      await db.batch(upserts.slice(offset, offset + 50));
    }
    history = await all<Row>(db.prepare(`
      SELECT day, repo, metric, item, count FROM github_daily
      WHERE day >= ? ORDER BY day ASC
    `).bind(today - Math.max(period.days, 2) - 60));
  } catch {
    historyError = 'The github_daily table does not exist: migration 0021 is not applied to this database. '
      + 'Totals are shown, the history is not kept.';
  }

  // Downloads per day: the difference between two snapshots of a file, filed
  // on the day of the later one. A file first seen after its repository was
  // already being tracked is a new release, and all its downloads are new.
  const productOf = new Map(GITHUB_REPOS.map(({ repo, product }) => [repo, product]));
  const downloads = history.filter(row => row.metric === 'downloads');
  const firstDayOf = new Map<string, number>();
  for (const row of downloads) {
    if (!firstDayOf.has(row.repo)) firstDayOf.set(row.repo, row.day);
  }
  const lastCount = new Map<string, number>();
  const addedOn = new Map<string, number>();
  const downloadsByDay = new Map<string, number>();
  for (const row of downloads) {
    const key = `${row.repo}/${row.item}`;
    const before = lastCount.get(key);
    const tracked = row.day > (firstDayOf.get(row.repo) ?? row.day);
    const added = before === undefined ? (tracked ? row.count : null) : Math.max(0, row.count - before);
    lastCount.set(key, row.count);
    if (added === null) continue;
    if (row.day === today) addedOn.set(key, added);
    const platform = installerPlatform(row.item) ?? 'Other';
    const cell = `${row.day}|${platform}`;
    downloadsByDay.set(cell, (downloadsByDay.get(cell) ?? 0) + added);
  }
  const snapshotDays = [...new Set(downloads.map(row => row.day))].sort((a, b) => a - b);
  const baseDay = snapshotDays.filter(day => day < today).at(-1) ?? null;
  for (const asset of assets) {
    asset.added = baseDay === null ? null : addedOn.get(`${asset.repo}/${asset.item}`) ?? 0;
  }

  const sinceDay = today - Math.max(period.days, 2);
  const series = (metric: string) => history
    .filter(row => row.metric === metric && row.day > sinceDay)
    .map(row => ({ t: row.day * DAY_MS, key: productOf.get(row.repo) ?? row.repo, count: row.count }));
  const referrerDay = history.filter(row => row.metric === 'referrer_views').at(-1)?.day ?? null;

  return {
    generated_at: period.now,
    period_days: period.days,
    errors,
    history_error: historyError,
    assets: assets.sort((a, b) => b.count - a.count),
    // The last earlier day a snapshot was filed: what "new" is counted from.
    base_day: baseDay === null ? null : new Date(baseDay * DAY_MS).toISOString().slice(0, 10),
    first_day: snapshotDays.length ? new Date(snapshotDays[0] * DAY_MS).toISOString().slice(0, 10) : null,
    snapshot_days: snapshotDays.length,
    downloads_by_day: [...downloadsByDay]
      .map(([cell, count]) => {
        const [day, platform] = cell.split('|');
        return { t: Number(day) * DAY_MS, key: platform, count };
      })
      .filter(row => row.t > sinceDay * DAY_MS && row.count > 0),
    releases: releases.sort((a, b) => b.published_at - a.published_at),
    traffic: {
      configured: hasToken,
      views: series('views'),
      view_uniques: series('view_uniques'),
      clones: series('clones'),
      clone_uniques: series('clone_uniques'),
      referrers: referrerDay === null ? [] : history
        .filter(row => row.metric === 'referrer_views' && row.day === referrerDay)
        .map(row => ({ referrer: row.item, product: productOf.get(row.repo) ?? row.repo, views: row.count }))
        .sort((a, b) => b.views - a.views),
    },
  };
}
