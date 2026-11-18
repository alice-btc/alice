// The last run of each scheduled task, for the admin console.
//
// A cron that stops running fails in silence. Each task is wrapped here so
// that its last start, its duration and whether it worked are written to
// `cron_runs`, one row per task. Nothing about a user is ever in that row.

import type { Env } from './index.ts';

/** Every scheduled task, with how often it is due. */
export const CRON_JOBS = {
  account_cleanup: { label: 'Expired sessions and codes', everyMs: 60 * 60_000 },
  billing_cleanup: { label: 'Lapsed plans and old invoices', everyMs: 60 * 60_000 },
  expiry_reminders: { label: 'Plan expiry reminders', everyMs: 60 * 60_000 },
  sat_price: { label: 'Satoshi price', everyMs: 60 * 60_000 },
  btcpay_probe: { label: 'Payment host check', everyMs: 60 * 60_000 },
  explorer_anchors: { label: 'Explorer settlement anchors', everyMs: 10 * 60_000 },
} as const;

export type CronJob = keyof typeof CRON_JOBS;

type Outcome = { ok: boolean; detail?: string };

/**
 * Runs a task and records how it went. The task's own result is what it
 * returns or throws; recording never changes it and never throws itself, so
 * a database that cannot be written (the migration not applied yet) leaves
 * the cron exactly as it was.
 *
 * `judge` turns a task's result into ok or not for tasks that report failure
 * in their return value instead of throwing.
 */
export async function trackCron<T>(
  env: Env,
  job: CronJob,
  work: () => Promise<T>,
  judge: (result: T) => Outcome = () => ({ ok: true }),
): Promise<T> {
  const started = Date.now();
  let outcome: Outcome;
  try {
    const result = await work();
    outcome = judge(result);
    await recordCronRun(env, job, started, outcome);
    return result;
  } catch (error) {
    outcome = { ok: false, detail: error instanceof Error ? error.message : 'failed' };
    await recordCronRun(env, job, started, outcome);
    throw error;
  }
}

async function recordCronRun(env: Env, job: CronJob, started: number, outcome: Outcome): Promise<void> {
  if (!env.ACCOUNT_DB) return;
  const ok = outcome.ok ? 1 : 0;
  try {
    await env.ACCOUNT_DB.prepare(`
      INSERT INTO cron_runs (
        job, last_started_at, last_duration_ms, last_ok, last_ok_at, last_detail, failures_in_a_row
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (job) DO UPDATE SET
        last_started_at = excluded.last_started_at,
        last_duration_ms = excluded.last_duration_ms,
        last_ok = excluded.last_ok,
        last_ok_at = COALESCE(excluded.last_ok_at, cron_runs.last_ok_at),
        last_detail = excluded.last_detail,
        failures_in_a_row = CASE
          WHEN excluded.last_ok = 1 THEN 0
          ELSE cron_runs.failures_in_a_row + 1
        END
    `).bind(
      job,
      started,
      Math.max(0, Date.now() - started),
      ok,
      ok ? started : null,
      (outcome.detail ?? '').slice(0, 200) || null,
      ok ? 0 : 1,
    ).run();
  } catch {
    // Recording is best-effort.
  }
}

export type CronStatus = {
  job: CronJob;
  label: string;
  every_minutes: number;
  last_started_at: number | null;
  last_duration_ms: number | null;
  last_ok: boolean | null;
  last_ok_at: number | null;
  last_detail: string | null;
  failures_in_a_row: number;
  /** More than two and a half intervals without a run. */
  late: boolean;
};

/** Every task, run or not, or null when the table does not exist yet. */
export async function cronStatuses(env: Env, now: number = Date.now()): Promise<CronStatus[] | null> {
  let rows: Array<Record<string, number | string | null>>;
  try {
    rows = (await env.ACCOUNT_DB.prepare('SELECT * FROM cron_runs').all<Record<string, number | string | null>>())
      .results ?? [];
  } catch {
    return null;
  }
  const byJob = new Map(rows.map(row => [row.job as string, row]));
  return (Object.keys(CRON_JOBS) as CronJob[]).map(job => {
    const row = byJob.get(job);
    const { label, everyMs } = CRON_JOBS[job];
    const startedAt = (row?.last_started_at as number | undefined) ?? null;
    return {
      job,
      label,
      every_minutes: everyMs / 60_000,
      last_started_at: startedAt,
      last_duration_ms: (row?.last_duration_ms as number | undefined) ?? null,
      last_ok: row ? row.last_ok === 1 : null,
      last_ok_at: (row?.last_ok_at as number | null | undefined) ?? null,
      last_detail: (row?.last_detail as string | null | undefined) ?? null,
      failures_in_a_row: (row?.failures_in_a_row as number | undefined) ?? 0,
      late: startedAt !== null && now - startedAt > everyMs * 2.5,
    };
  });
}
