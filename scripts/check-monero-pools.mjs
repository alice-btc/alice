#!/usr/bin/env node
// Checks every Monero pool list the Explorer reads to name the miner of a
// block (apps/app-web/src/lib/explorer/monero-pool-apis.ts). A pool that changes
// its API, or stops answering browsers, names nothing in the app without any
// error; this check says so before a release does. For each pool it reads the
// list as the app does and verifies that block hashes come out, that the
// answer allows any origin (or at least the app's), and reports the age of
// the newest block listed.
//
//   node scripts/check-monero-pools.mjs
//
// Exits 1 when a list fails. Needs network access; not part of `npm test`.

import { MONERO_POOL_APIS } from '../apps/app-web/src/lib/explorer/monero-pool-apis.ts';

const ORIGIN = 'https://app.alicebtc.com';
const RECENT_DAYS = 14;

async function check(api) {
  const url = api.url(20);
  let res;
  try {
    res = await fetch(url, { headers: { Accept: 'application/json', Origin: ORIGIN }, signal: AbortSignal.timeout(15_000) });
  } catch (e) {
    return { ok: false, detail: `unreachable (${e.cause?.code ?? e.name})` };
  }
  if (!res.ok) return { ok: false, detail: `HTTP ${res.status}` };
  const cors = res.headers.get('access-control-allow-origin');
  if (cors !== '*' && cors !== ORIGIN) return { ok: false, detail: `no CORS for ${ORIGIN} (got ${cors ?? 'none'})` };
  let body;
  try {
    body = await res.json();
  } catch {
    return { ok: false, detail: 'answer is not JSON' };
  }
  const hashes = api.hashes(body);
  if (hashes.length === 0) return { ok: false, detail: 'no block hash in the answer: the format changed, or the pool found nothing' };
  // Is the newest listed block recent? Ask the explorer the app uses.
  try {
    const block = await fetch(`https://xmrchain.net/api/search/${hashes[0]}`, { signal: AbortSignal.timeout(15_000) }).then(r => r.json());
    const ts = Number(block?.data?.timestamp);
    if (Number.isFinite(ts) && ts > 0) {
      const days = (Date.now() / 1000 - ts) / 86_400;
      return { ok: true, detail: `${hashes.length} hashes, newest ${days < 1 ? `${Math.round(days * 24)} h` : `${Math.round(days)} days`} old${days > RECENT_DAYS ? ' (stale?)' : ''}` };
    }
  } catch { /* the age is a bonus */ }
  return { ok: true, detail: `${hashes.length} hashes` };
}

const results = await Promise.all(MONERO_POOL_APIS.map(async api => ({ name: api.name, ...(await check(api)) })));
for (const r of results) console.log(`${r.ok ? 'ok  ' : 'FAIL'}  ${r.name.padEnd(12)}  ${r.detail}`);
const failed = results.filter(r => !r.ok);
if (failed.length) {
  console.error(`\n${failed.length} of ${results.length} pool lists failed: the Explorer will not name their blocks. Fix the entry in monero-pool-apis.ts or remove it.`);
  process.exit(1);
}
console.log(`\nAll ${results.length} pool lists answer.`);
