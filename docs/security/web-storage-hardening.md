# Web storage hardening

Updated on 2026-10-22 after the focused storage and prebuilt-header fixes,
using Next.js 15.5.28. Local validation is recorded below. It does not validate
a production deployment or a native Desktop release.

## Scope and storage behavior

The browser uses a random, non-extractable AES-256-GCM key in IndexedDB for
managed conversations, memory/profile and Explorer/Playground records. This is
a local symmetric storage key, not a real wallet private key. The app uses it
automatically; optional cryptographic locking is deferred.

- Key creation reads and adds in 1 IndexedDB readwrite transaction, returns the
  committed winner and never replaces an inaccessible or invalid stored key.
  `LocalKeyStore.getOrAdd(candidate)` replaces the former `put` contract.
- New managed writes do not fall back to persisted plaintext. Without a
  cipher, new activity stays in memory. If a cipher object exists but IndexedDB
  later refuses access, chat saving fails with a generic notice. The active
  conversation remains visible, without saved sidebar history.
- Explorer/Playground quarantine unreadable keys for the page session. Writes
  stay in memory and `LocalVault.flush()` rejects. Initial enumeration/read
  failure disables that vault's disk writes until reload. Memory/profile
  writes also check current ciphertext. Chat saves authenticate the stored
  record, including when its index is readable but its body is not. The web
  adapter authenticates the incoming value and rechecks storage after awaits,
  with no await between its final comparison and write. Unreadable values
  remain intact and a storage notice appears. This is not a multi-record or
  cross-process transaction; concurrent valid saves still use last-writer-wins
  semantics. `status()` and `subscribe()` expose vault persistence state;
  successful flush does not prove physical disk durability.
- Playground uses the same cipher and format but loads separately when
  requested. This reduces eager decryption; it does not lock data or guarantee
  memory zeroization.
  Native keychain commands and wallet adapters are unchanged, although Desktop
  embeds the changed frontend.

Account-session tokens, Custom AI credentials and other preferences retain
storage outside these managed values. The Explorer cache persists queried
addresses and public chain results in plaintext, revealing consultation traces
to someone with local storage access. Non-extractability does not prevent
same-origin code from using the key. Complete browser-profile copy resistance
has not been established. Real wallet PIN/seed storage is outside this change.
See [Local chat encryption](local-chat-encryption.md).

## Script policy and build paths

`npm run build --workspace @alice-wallet/app-web` runs Next's export and then
`scripts/secure-app-export.mjs`. Each HTML page receives a CSP meta element
before its scripts, allowing same-origin scripts, WebAssembly compilation and
hashes of that page's inline scripts. The tested output blocks unlisted inline
scripts, HTML event handlers and JavaScript string evaluation; same-origin/blob
workers remain allowed. Do not deploy `next build` output without securing it.

`apps/app-web/vercel.json` configures an enforced response CSP. Its
`unsafe-inline` permission is restricted by the per-page policy; the header
alone does not provide the same script protection. Inline CSS remains allowed.
`connect-src` permits HTTP(S)/WebSocket destinations for Custom AI and custom
Explorer nodes, so it does not prevent exfiltration by already-authorized code.
The prebuilt packaging path carries these headers as described below.

The production web path loads its ONNX factory from `/semantic-runtime/` and
disables the Transformers WASM cache. Model weights and WASM retain their
download paths. Embedded Desktop uses `/semantic-model/ort/` for WASM.
Native Tauri initialization under both CSPs still requires release testing.

## Packaging, deletion and conversation preservation

- **Prebuilt response headers.** `scripts/prepare-web-deployment.mjs` reads
  `apps/app-web/vercel.json` and adds its security headers to a non-terminal
  first route in Build Output API `config.json`. Pages, direct file paths,
  assets and the 404 fallback receive the same headers. Cache rules remain
  unchanged. Missing required headers, malformed values, unsupported scopes or
  unsupported configuration fields fail before a new output directory is
  created. The destination must be fresh. The output contains only the static
  export and its routing configuration.
- **Explicit deletion without a cipher.** Memory/profile removal reaches
  persisted values as well as temporary state. Chat "Delete all" enumerates
  the chat namespace, so a hidden, unreadable or incomplete index cannot leave
  unlisted messages behind. It waits for any migration already in progress
  before enumerating keys, so pending migration writes cannot restore deleted
  records. Other storage keys are untouched. Explicit deletion
  also permits removing unreadable ciphertext; passive reads and failed saves
  do not. Profile initialization no longer deletes legacy records. If storage
  cannot be reached, deletion rejects and the UI reports failure. Volatile
  values remain available for retry when their backing deletion fails; a partial
  memory/profile failure refreshes the panel to reflect successful deletions.
  "Delete all" remains available even when the displayed count is 0, because unreadable
  or unlisted records can still exist. Its confirmation includes these records.
- **Conversation preservation.** An unreadable encrypted body under a readable
  index now rejects `saveSession()` without replacing either value. Web writes
  also recheck changes made while asynchronous work was pending. The encryption
  envelope alone is insufficient: values must authenticate for the storage key.
  Explicit deletion is still allowed. Automatic trimming runs only after the
  new conversation and updated index have been saved.

Clear-all enumeration and deletion are not atomic with writes from another
open tab; stop activity in other tabs before clearing all history.

Before a Desktop release, check native initialization, menus/IPC, keychain
encryption, history after reload and semantic-search ready state.

The CI verify job tests policy helpers; a separate `web-build` job runs
`npm run build --workspace @alice-wallet/app-web` (Learn pack preparation,
webpack build, HTML securing) and requires the web client boundary success
marker. It does not upload artifacts or deploy. The local
build check confirmed quoted script `src` attributes and charset declarations
fully before byte 1024 in all 10 exported pages.

## Verification and limits

The follow-up was built locally with Node 24.19.0 and the installed dependencies
from the previously validated lockfile. No dependency or lockfile changed.
The full suite passed **1677 tests in 193 files**, with 0 failures or skipped
cases. Type checks and the AI/wallet boundary check passed. The App Web build
secured all 10 exported HTML pages; their inline-script hashes were checked.

A fresh prebuilt artifact was generated from that build. Its configured headers
were checked against `vercel.json` for pages, direct HTML, JavaScript assets and
404 responses. Local HTTP tests interpreted the emitted Build Output routes;
they did not run on Vercel infrastructure. Actual hosting response headers must
still be verified on the eventual deployment path.

Chromium, Firefox and Playwright WebKit used disposable profiles and synthetic
records, with external requests blocked. Tests covered normal encrypted history
and reopening after reload, refusal to replace a corrupt conversation through
the API and an active chat UI, a concurrent replacement during encryption,
explicit deletion of corrupt data, legacy memory/profile/chat deletion without
a cipher, preservation during passive profile initialization, volatile new
writes and propagation of deletion errors. The Settings "Delete all" and memory
erasure/retry flows are checked separately from the storage API.

Private PR CI passed 1676 tests in 193 files, types and the AI/wallet boundary
check after `npm ci --ignore-scripts`. The generated Learn packs are absent in
CI, so 1 pack-validation test runs only locally. The registry audit reported
25 high findings and 0 critical, accepted under the existing scoped exceptions.
Passing this check does not mean there are no vulnerable dependencies.
See [Dependency audit](dependency-audit.md).

External-service availability was not checked by these local regression tests.

Native Safari, native Desktop, payments/signing, browser-profile copy
resistance and production HTTP headers remain unverified here. No offensive
production test or deployment was performed. No XSS was found in the rendering
paths examined; this was not an exhaustive application/infrastructure audit.

For local checks, use the supported Node version and disposable browser
profiles with synthetic data. Prepare the prebuilt artifact in a new directory
only after the secured App Web build completes.

```sh
npm run check:types
npm test
npm run build --workspace @alice-wallet/app-web
node scripts/prepare-web-deployment.mjs /path/to/fresh-prebuilt-output
```

Serve the prepared artifact with its emitted routes and inspect response
headers, `securitypolicyviolation` and uncaught errors. A plain static server
without route/header handling does not validate this deployment path. Check
actual hosting responses separately before release.
