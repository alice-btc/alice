# Arkade Explorer validation

Validated on 2026-10-29 with Node 24.22.2, on the private branch `fix/arkade-pagination-expiry`. No public deployment or wallet operation is part of this validation.

## Behavior

- SDK pinned to `@arkade-os/sdk` 0.4.79; its canonical flags, expiry and commitment fields take precedence over legacy fields. The SDK remains a dynamic import.
- Address lookup explicitly requests 500 VTXOs per page and follows the indexer's 1-based cursor (request index 0 maps to page 1), including when the server caps each page below 500. The balance appears only after all pages succeed.
- Failed pages, duplicate coins, skipped/repeated pages and unusable cursors reject the entire result. No partial balance is returned.
- Cancellation stops waiting, drops the old answer and prevents later page requests. The SDK does not accept an AbortSignal, so an already-started HTTP request can still finish in the background.
- Expiry is a date, a block height or unknown. Raw/legacy scalar interpretation follows the SDK's 1 January 2025 cutoff, not BIP65's locktime threshold. Explicit canonical dates/heights retain their units.
- Address rows, batches, virtual outputs, exit paths and Ask Alice context preserve expiry units. Missing expiry displays “expiry unknown” / “expiration inconnue”. Heights are never compared with the clock.

## Reproduce

Use Node 24 and install the root lockfile, including nested workspace dependencies. Copying only the root `node_modules` misses the Worker's pinned Miniflare version.

```sh
npm ci --ignore-scripts
node --test apps/app-web/src/lib/explorer/arkade*.test.ts apps/app-web/src/lib/explorer/layer-context.test.ts
npm test
npm run check:types
npm run check:npm-audit
npm run check:csp-parity
npm run build --workspace @alice-wallet/app-web
```

The prebuild prepares the EN/FR Learn packs. An offline reconstruction also needs those packs or the normal release download source. No credentials are needed for the Arkade fixtures.

For UI checks, install the existing developer-only browser dependency and serve the production export in a separate terminal:

```sh
npm ci --prefix scripts/csp-crawl
python3 -m http.server 3047 --bind 127.0.0.1 --directory apps/app-web/out
node scripts/verify-arkade-explorer.mjs http://127.0.0.1:3047 <tmp>/alice-arkade-browser
```

The script defaults to installed Chrome. For Playwright WebKit, install its browser and set `ARKADE_BROWSER=webkit`. Every external response is intercepted in these scenarios; no real funds or wallet is used. It writes JSON results, rendered text and screenshots to the output directory.

## Initial validation (2026-10-29, commit 869e58cf)

- Before the fix, a 1,001-coin fixture returned only 500 coins and 500,000 sats instead of 1,001,000 sats. The initial new regression set exposed 24 failing tests against the old code.
- All Arkade test files plus layer-context: **108 passed**, 0 failed. These use the actual SDK provider with scripted HTTP responses and cover pagination, states, expiry, cancellation and Ask Alice context.
- Browser: **7/7 passed** in Chrome, with no JavaScript runtime errors. Scenarios: 1,001 coins across 3 pages; exactly 1,000 across 2 pages; server-capped 100-coin pages; page 2 failure with no partial metrics; date/height/unknown; French height wording; VTXO exit height.
- Integrated-browser live smoke check: the public fixture address ending `j7cvp7wwwlq3` displayed **12 VTXOs and 0 spendable sats**, matching a direct read from `arkade.computer` (gateway version v0.9.23). This real address does not validate the multi-page case; that case uses fixtures.
- Full repository suite: **1,650 tests passed across 169/169 test files**, 0 failures or skips.
- Types and production Web build passed; client boundary check passed and 10 exported pages were secured. CSP parity passed (4 policies, 22 documented exceptions). Audit gate passed with 1 high and 0 critical findings under the existing exception policy.
- Explorer first-load JS changed from 570 kB to 590 kB (Next's estimate); all exported JavaScript changed from 6,551,125 to 6,909,216 bytes. The SDK upgrade changes shared transitive dependencies as well as its lazy chunk.
- Native macOS development binary compiled successfully. The native window was not validated; no signed/notarized release package was made. WebKit and other operating systems must not be inferred from the Chrome result.

## Limits

Offset pagination is not an atomic snapshot. A duplicate caused by concurrent changes is detected, but an omitted coin caused by pages shifting cannot be detected without indexer snapshot support. Reload to retry.

A height expiry is displayed as a height but is not classified as expired from the current chain tip. Ask Alice's context is tested locally; no live AI request was submitted. Cancellation and stale-result guards are tested/reviewed; the manual slow-A/fast-B navigation scenario has not been exercised in the native window.

The other REST lookups in `arkade.ts` remain REST calls; this is not a migration of every Explorer endpoint to the SDK.

## State precedence follow-up (2026-10-29)

The independent review found that canonical SDK flags can coexist. A coin spent by its holder and later swept must be named **spent**, in the SDK order `spent > swept > preconfirmed > settled`. `arkadeStateOf` now provides that order for the VTXO state and Ask Alice text; the address badge and virtual transaction output also test spent first. The secondary preconfirmed/confirmed row text still reflects the independent indexer flag. Balance filters and `readAllPages` are unchanged.

The empty-address fixture now returns `{ current: 1, next: 0, total: 0 }`. Regression coverage includes all 8 boolean combinations, the address/VTXO context and a context check through the real SDK provider.

### Verification

- Node 24.22.2: **111/111 Arkade and layer-context tests passed**.
- Mutation check: temporarily restoring only the original swept-first `arkadeState` makes **both new context tests fail** (2 run, 2 failed); the corrected source was restored before the full checks.
- Production Web build passed locally and in GitHub CI; client boundary check passed and 10 exported pages were secured.
- All **7/7 browser scenarios passed** again in Chrome against this rebuilt export, with no JavaScript runtime errors.
- Full `npm test` on GitHub/Linux: **1,652 passed across 169/169 test files**, 0 failed, skipped or cancelled. `check:types`, CSP parity and the audit gate also passed in [CI for code commit 420ef684](https://github.com/alice-btc/alice-private/actions/runs/40872239151).
- Local `check:types` passed when rerun after the build. The first concurrent attempt hit missing generated `.next/types` files; the sequential rerun resolved that race. The local full suite was stopped due to severe machine contention and completed on GitHub instead.
- No remaining failure in the requested checks. The live operator address, native Desktop window and WebKit were not rechecked in this follow-up; the 7 browser scenarios use synthetic HTTP responses.

The SDK update already included these shared dependency changes in the root lockfile (no additional dependency update in this follow-up):

| Package | Before SDK update | After SDK update |
| --- | --- | --- |
| `@scure/btc-signer` | 2.0.1 | 2.4.1 |
| `@noble/curves` | 2.0.1 | 2.4.0 |
| `@scure/base` | 2.0.0 | 2.4.0 |

These dependencies also support the practice wallet and wallet derivation; the full monorepo checks cover that shared surface.
