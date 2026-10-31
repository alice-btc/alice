# Content Security Policy, the two tools

Alice Web and the site both enforce their policy (`Content-Security-Policy`
in `apps/app-web/vercel.json`, see `docs/security/web-storage-hardening.md`,
and in `apps/site/vercel.json`); the desktop app carries its own in
`apps/app-desktop/src-tauri/tauri.conf.json` (`app.security.csp`), and the
Android and iOS apps override it in `tauri.android.conf.json` and
`tauri.ios.conf.json`. Two tools
say whether the policies agree with each other and with what the apps
actually do, before a policy change ships.
Neither sends anything anywhere: the crawl is a developer tool, and no
violation is ever reported from a user's browser.

## 1. Parity check, in CI

```bash
npm run check:csp-parity          # also runs in the CI `verify` job and in `npm test`
node scripts/check-csp-parity.mjs --list   # prints every directive of the five policies
```

`scripts/check-csp-parity.mjs` parses the five policies into directives and
sources, then reports every source present in one policy and missing from
another. A difference passes only when `scripts/csp-parity-exceptions.json`
documents it: an entry names the directive, the sources, the exact set of
policies expected to carry them (`site`, `app-web`,
`desktop`, `android`, `ios`) and a reason. An exception that matches no difference any more
fails the check too, so the list cannot rot.

When a policy changes, run the check: either the new source is wanted on
every surface, or an entry explains where it is wanted and why. Reasons
marked "not verified" or "to confirm" in the file are open questions, not
established facts.

## 2. Crawl, by hand

`scripts/csp-crawl/crawl.mjs` drives a browser (Playwright) through the
site and Alice Web, with a `securitypolicyviolation` listener on
every page and frame, and prints the servers each surface contacted (from
the requests and WebSockets observed) and the violations raised. It is not a
workspace, so Playwright stays out of the app dependency tree:

```bash
cd scripts/csp-crawl
npm install
npx playwright install chromium        # or use the installed Google Chrome with --channel chrome

node crawl.mjs --site https://alicebtc.com --app https://app.alicebtc.com
node crawl.mjs --app https://alice-web-git-branch-xyz.vercel.app --json report.json   # a preview deployment
node crawl.mjs --channel chrome --inject-csp --site http://localhost:3002 --app http://localhost:3000
node crawl.mjs --channel chrome --no-send --app http://localhost:3100   # no Private Cloud request
```

What it walks: the site pages; on Alice Web the chat (one question), the
explorer, Learn (first course), the settings with the semantic model
download, the account tab with the plan prices, the practice wallet.
Every step is best effort: a step that cannot drive its screen is
reported as failed and the crawl goes on, so the lists stay useful.

Options that change what happens on the target:

- `--pay` creates a throwaway account on the target's Worker (password
  generated, never printed) and opens the plan checkout up to the BTCPay
  page in a new tab. Nothing is paid.
- `--inject-csp` adds the repository's policy to every document response,
  under the header its `vercel.json` uses (enforced or report-only), for a
  local server that sends no headers (`next dev`, or a static server on
  `apps/app-web/out`). Only documents get it: requests made from a worker
  are checked only when the server itself sends the header on every file,
  as Vercel does.
- `--no-send` types the chat question without sending it, so the crawl
  makes no Private Cloud request.
- `--fail-on-violation` exits 1 when a violation was recorded; `--json`
  writes the full report.

Reading the result against a local server: a Next dev server evaluates code
with `eval` (every `script-src eval` line is dev only), and a dev build may
call the development Worker host instead of `proxy.alicebtc.com`. Confirm
anything that matters on a preview deployment. The listener runs in pages
and frames, not inside workers: a worker's own violation shows only in the
console lines the report appends.

The two gaps found on 2026-10-14 on Alice Web, the `https://api.coinbase.com`
price feed and a `blob:` script for the semantic engine, are closed by its
enforced policy: `connect-src` admits any HTTPS destination, and the engine's
factory now loads from `/semantic-runtime/` instead of a blob.

## Enforced on both web hosts

On 2026-10-25 the site moved from `Content-Security-Policy-Report-Only` to
`Content-Security-Policy`. Checked before the change, locally, on a static
export served with the `vercel.json` headers on every file: the crawl over
the site pages reported no violation, and neither did the production site
under its report-only header. Not run: a preview deployment, the Cloudflare
beacon (the production site loaded none).

Alice Web's `connect-src` stays as it was, open to any destination,
on purpose. A Custom AI server and a custom Explorer node can be anywhere (a
VPS, an Umbrel, an OpenAI-compatible API), and a header is the same for every
visitor: it cannot allow only the server one user typed in settings. Narrowing
it per user would mean the hosting reading that address on every load, which
Alice does not do. Plain `http:` and `ws:` reach only the same computer, since
browsers refuse them from an `https` page anywhere else. A host list was tried
and checked (no violation on the crawl, every explorer, Ark, Spark, Intel and
loopback host reachable) and set aside for this reason; the cost is that code
already running in the page could send data to any HTTPS host.

The desktop app follows the same rule since 2026-10-25: its `connect-src` is
`ipc: 'self' https: http: wss: ws:`, so a remote node or AI server works there
too. Pointing Alice at one's own node is a privacy gain, not a loss: the
lookups stop going to a public explorer.

Before any later policy change: `npm run check:csp-parity` green, and the
crawl run against a preview deployment of each host with no violation left
that is not a dev artefact.
