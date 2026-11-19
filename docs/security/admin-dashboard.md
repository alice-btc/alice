# Alice admin dashboard

A staff-only dashboard for understanding Private Cloud usage and helping
testers, built directly into the existing Venice proxy Worker (`apps/venice-proxy-worker`).
It reuses the same D1 database (`ACCOUNT_DB`), the same session/bearer-token
model as every other Alice client, and adds nothing external: no third-party
analytics or admin SaaS, no new deploy target.

- Static shell: `GET /admin` (served by `src/admin-dashboard-html.ts`, no
  build step, no CDN dependency)
- Brand fonts: `src/admin-dashboard-fonts.ts` (see [Look and feel](#look-and-feel))
- JSON API: `/admin/api/*` (`src/admin.ts`, routed from `src/index.ts`)
- Migrations: `0006_admin.sql`, `0007_installation_milestones.sql`,
  `0008_admin_roles.sql`, `0009_events_daily.sql`

## The data inventory, in five categories

This is the complete picture of what Alice's server side handles. The
principle behind it: collect nothing that is not needed to run and improve
Alice, and nothing personal beyond what an account inherently is. Everything
below is enumerable, there is no "and miscellaneous logs" bucket.

**1. Can never be collected, impossible by construction.** Wallet recovery
phrases, wallet keys, balances, transactions, or even the fact that a wallet
exists: Alice never sends any of it to this Worker, and no schema
column could hold it. Chat prompts and AI responses: encrypted on the device,
relayed as ciphertext, never readable here. Plaintext passwords: only salted
hashes exist. Plaintext email addresses at rest: none. Since 0.2.0 the
address is kept encrypted (`account_emails`, key held by the Worker, see
`src/email-vault.ts`) next to a keyed one-way HMAC for login lookup and a
masked display label (`sat****@bitcoin.com`). The encryption protects it if
the database or a backup leaks, not from the Worker, which decrypts it to send
plan reminders; the interface suggests an alias.

**2. Collected by Alice, the exhaustive list.** Account rows (username,
display name, masked email label, HMAC email fingerprint, the encrypted
email address, creation and last-use timestamps); password hashes (scrypt or
PBKDF2, salted); session records (hashed tokens); quota counters and the cloud
request ledger (one row per request: user id, status, encrypted byte counts,
millisecond timestamps, no model name, no content, kept until the account is
deleted); BTCPay invoices (amount, status, no email or username);
pseudonymous
installation rows (HMAC of a random install id, platform, app version,
write-once milestone timestamps); day-level aggregate product counters
(event × day × platform × version, no user id); technical error telemetry
(category, code, status); admin roles, the admin audit log and recorded
access denials; promo codes and their redemptions.

**3. Seen in transit but deliberately not kept.** The raw IP address is
HMAC'd with a day-scoped key for rate limiting, then unrecoverable, no
durable IP record exists. The email address transits once per login to send
the verification code; what is kept is described in category 1. Request and
response
bodies are never read into logs; Cloudflare invocation logs are disabled in
`wrangler.toml`.

**4. Collected by third parties, under their own policies, because Alice
uses them.** Each provider sees only its own slice: Cloudflare (edge
metadata of proxy traffic and DNS queries; the payload it relays is
ciphertext), Venice (encrypted inference inside the TEE, session metadata),
Resend (the recipient address and delivery metadata of login-code emails),
Arkade, Boltz and Satora (the payment operations they execute), Esplora
providers (the on-chain addresses a wallet queries), Vercel (web-hosting
access logs), Hugging Face (model-download traffic). None of them receives
seeds, chat plaintext, or Alice account credentials.

**5. Could technically be collected, and deliberately is not.** Per-user
event streams and behavioural timelines (the schema has no place for them);
per-model usage; a queryable IP or device-fingerprint table; a "wallet
created" milestone; timestamps finer than a day in analytics; substring
search over email addresses. Each of these was considered and rejected, adding any of them back is a reviewable schema change, not a toggle.

## Access model

There is no "admin flag" anywhere in a client or in a JWT claim. Every
`/admin/api/*` route calls `requireAdmin()`, which:

1. runs the normal `authenticate()` check used by every other authenticated
   route (a valid, non-expired, non-revoked session for an `active` user), then
2. requires a row for that `user_id` in the `admin_users` table, and
3. for any state-changing route, requires that row's `role` to be `admin`.

Both checks happen on the server, per request. The dashboard HTML page itself
carries no privilege, it is a thin client that signs in through the existing
`/auth/password/login` endpoint and then calls
`/admin/api/*` with the resulting bearer token, exactly like any Alice client
would call `/account`.

### Roles

| Role | Can do |
| --- | --- |
| `support` | Read-only: every page, account search, account sheet, audit log. Cannot unlock writes. |
| `admin` | Everything, including suspend/reactivate, credit adjustment, promo codes, role changes, and permanent deletion. |

### The write lock and re-authentication

The console opens read-only, and it writes to production: a click on the
wrong row suspends a real account. Every control that changes something is
disabled until the admin unlocks writes with their **own** password
(`POST /admin/api/unlock`). The answer is a token signed for that admin and
one expiry, 10 minutes later, which the page keeps in memory only and sends
as `x-admin-unlock`. Reloading the tab, closing it, the 10 minutes running
out or the Lock button all return the console to read-only. The token is not
a session: without a valid admin session it opens nothing, and one admin's
token is refused for another.

The server is what enforces this, not the disabled buttons. Suspending or
reactivating an account, changing its credits and creating or disabling a
promo code are refused unless the request carries a valid unlock or the
password itself (`admin_password` in the body).

Three actions never accept the unlock and ask for the password in the same
request every time: permanently deleting an account, granting console
access, and revoking it. The first cannot be undone and the other two are
the keys themselves.

A stolen or left-open session is therefore not enough on its own to destroy
data or grant itself company. The password check is rate-limited per admin
so it cannot be used as a password oracle, and every failure is recorded.

Denied attempts, not an admin, insufficient role, or a failed re-auth, are
written to `admin_access_denials` and surfaced at
`GET /admin/api/access-denials`, so probing the dashboard is visible rather
than silent.

### Is the page itself a risk?

`GET /admin` is public: anyone who knows the URL sees the sign-in form. That
is deliberate and safe, because **the page ships no data**. Every value on
every screen arrives from `/admin/api/*` after a server-side check, so there
is nothing for a tampered client to reveal:

- Faking a token in `sessionStorage` → `authenticate()` HMACs it and finds no
  matching session → **401** on every route.
- Editing the JS in devtools to skip the login, or setting `state.role =
  'admin'` in the console → cosmetic only; the page renders empty shells
  because every fetch is still refused.
- Signing in with a real, correct password on an account that is not an admin
  → **403** on every route, with no data in the body.
- Suspending an admin's account revokes its sessions, so an `admin_users` row
  alone does not keep a dashboard session alive.

`admin.test.ts` proves this rather than asserting it: the suite enumerates
**every** admin route and checks all three attacker positions (no token,
forged token, valid non-admin session) against each one. A separate test
writes real accounts and sessions to the database, then fetches `/admin`
unauthenticated and asserts that none of those usernames, user ids, tokens or
session hashes appear anywhere in the HTML. If a new admin endpoint is ever
added without protection, that route list is where it surfaces.

The page does contain the *name* `ADMIN_BOOTSTRAP_SECRET`, as the placeholder
telling the operator which variable to paste. Naming an environment variable
is not disclosing it.

### A secret path

`ADMIN_DASHBOARD_PATH` moves the whole dashboard, shell and API, to a path
of your choosing, and `/admin` then returns 404. The page derives its API
base from its own URL, so one variable moves everything.

**This is not a security control.** It keeps drive-by scanners, bots and
casual URL-guessing away, which is worth having, but anyone who learns the
URL gains nothing: the role check is identical there, and a non-admin still
gets 403 on every route. Treat it as noise reduction layered on top of the
password and the `admin_users` row, never as a replacement for either.

A malformed value falls back to `/admin` rather than half-applying, so a typo
cannot leave the dashboard reachable at two places or at none.

### Reachability

Once deployed, `/admin` is reachable from anywhere on the internet at the
Worker's URL, it is not a local-only tool. That is what the layers above are
for: a password with a 15-character minimum, an `admin_users` row, an
optional `ADMIN_ALLOWED_USERNAMES` gate, password re-auth on destructive
actions, and recorded denials. For a private beta, putting **Cloudflare
Access** in front of the route as well is the cheapest large improvement:
an attacker then has to pass your IdP before they can even see the form.

### Transport hardening

- **No CORS on `/admin/api/*`.** The dashboard is served same-origin by this
  Worker, so it needs none, and withholding the headers means no other
  allowlisted Alice origin (the Alice apps, `localhost` during development)
  can script a request against these endpoints from a user's browser.
  Preflights for `/admin*` are answered without CORS headers too. The normal
  account API keeps its CORS as before.
- **The dashboard page is unframable.** `X-Frame-Options: DENY` plus
  `frame-ancestors 'none'`. It has one-click destructive controls, so
  without this a hostile page could overlay an invisible iframe and trick an
  admin into clicking *Delete*.
- **A tight CSP** (`default-src 'none'`, no external origins), plus
  `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff` and
  `X-Robots-Tag: noindex`.

### Bootstrap is race-free

The bootstrap insert is conditional (`INSERT … WHERE NOT EXISTS`) rather than
check-then-insert, so two concurrent calls from different accounts cannot
both become admin. It is also rate-limited, and a wrong secret is recorded as
a denial.

### Recommended additional layer

Put **Cloudflare Access** in front of the `/admin` route. It is configuration
rather than code, costs nothing here, and means an attacker needs to pass
your IdP before they can even reach the login form. This is not implemented
in code on purpose: an IP allowlist inside the Worker would mean handling raw
IPs, which Alice deliberately avoids everywhere else.

### Bootstrapping the first admin

There is no seed data and no default admin. The whole first run happens in
the browser, no `curl` needed.

**The admin account must have a password.** The dashboard's sign-in form is
password-based, and every irreversible action (delete an account, grant or
revoke dashboard access) requires re-entering that same password.

1. **Create a normal Alice account with a password**, in the app or on the
   web build. Nothing special about it, it is an ordinary account that will
   be marked as admin in step 4. Password rules come from `validatePassword`:
   **15 to 128 characters**. The username is `prefix.suffix#1234`, and note
   that `admin`, `alice`, `support`, `staff`, `security`, `team` and a few
   others are reserved and cannot be used as either part.
2. **Set the bootstrap secret** on the Worker, once:
   ```bash
   openssl rand -base64 48 | npx wrangler secret put ADMIN_BOOTSTRAP_SECRET
   ```
3. **Open `/admin`** and sign in with that username and password.
4. The dashboard sees a valid session with no admin role and reveals a
   **First-time setup** panel. Paste the secret from step 2 and press *Claim
   admin access*. That panel only appears once the credentials are already
   correct, so it never hints at a bootstrap secret to someone who cannot
   sign in.

That is the whole flow. It succeeds exactly once: if `admin_users` already
has a row, the call returns `409 admin_already_bootstrapped`. Every
subsequent admin is granted by an existing admin from the Admins tab, which
requires that admin's password and writes an audit entry, no secret
involved.

Afterwards, rotate or delete `ADMIN_BOOTSTRAP_SECRET`; it is only useful
again if `admin_users` is ever emptied. Consider setting
`ADMIN_ALLOWED_USERNAMES` to your username at the same time.

Demoting the last remaining full admin is refused server-side
(`409 last_admin`) so the team can never lock itself out.

## What the dashboard shows

Four sections, each with a few pages. A period selector in the header
(24 hours, 7, 30 or 90 days) applies to every page that reads a period and is
dimmed on the others. Each period figure is shown against the same span just
before it. A Refresh button reads the page again, and each page ends with the
source of its figures and the time they were read. Tables sort on a click of
a heading and export what they show as CSV.

Every reading route is in `src/admin-insights.ts` or `src/admin.ts`, asks for
an admin session, and returns counts and sums only.

### Today

**At a glance**, the page the console opens on: one tile per key figure for
the chosen period, in four groups (people, money, reach, quality), each with
its change against the period before, the shape of the period as a row of
bars, and a click through to the page that explains it. Above them, one line
with a light per dependency. It adds no route: it asks the growth, money,
errors, health, site, Venice and GitHub sources at once, and a source that
fails leaves its own tiles saying so without blanking the page.

**Pulse** (`GET /admin/api/health`, `GET /admin/api/launch`).

- *Since your last visit*: installations, accounts, AI requests, paid
  invoices and server-side errors since the previous console sign-in. The
  sign-in is the `admin_login` audit entry, written once per half hour of
  use, so no new table is involved. Capped at 30 days.
- *One light per dependency*, each with the sentence that explains its
  colour: the database, Private Cloud (share of requests refunded after an
  upstream failure), sign-in, login emails, BTCPay, the Worker's exception
  rate, the Venice balance and the test wallet faucet. A light is red only
  for something that needs a person. Too little traffic to judge reads as
  fine with the reason given. A service that cannot be read is "not
  connected", never a false green.
- *Scheduled tasks*: when each cron last ran, how long it took, whether it
  worked and its last technical line. The deployed Worker writes one row per
  task in `cron_runs` at each run (`src/cron-runs.ts`); recording never
  changes what the task returns or throws, and a database without the table
  leaves the cron as it was. A task is late after two and a half intervals
  without a run, which turns the light red: a cron that stops fails in
  silence otherwise.
- Whatever is orange or red is repeated in a strip under the header on every
  page.
- The last 24 hours against the 24 before for installations, AI requests and
  accounts, hourly curves over 48 hours, downloads and site visits.

**Errors** (`GET /admin/api/errors`): server-side failures (status 500 and
above) apart from refusals that worked as designed, a curve by kind, and
every code with what it means and what to do about it. BTCPay going down and
coming back are stored in `technical_events` under the `venice` category,
the only one the table's CHECK left room for; they are kept out of every
error count and shown as a list of outages with their length.

**Infrastructure** (`GET /admin/api/platform`): the Worker's requests,
exceptions and CPU time, how requests ended, and for the database its size,
queries, rows read and written, query time and the statements that cost the
most time. All of it is read from Cloudflare's GraphQL Analytics API
(`workersInvocationsAdaptive`, `d1AnalyticsAdaptiveGroups`,
`d1StorageAdaptiveGroups`, `d1QueriesAdaptiveGroups`) with the same token as
the Site page, so it adds no collection. The Worker dataset is asked a week
at a time. D1 keeps 31 days. A statement is shown as D1 logs it: the SQL with
its placeholders, never the bound values.

**Versions** (`GET /admin/api/versions`): the branch and commit the console
runs from, the migrations applied to the database against the ones the
checkout holds, the Worker versions that served traffic in the last 7 days,
the site's last Vercel deployment when a token is set, and the latest public
releases. The branch, the commit and the list of migration files come from
the operator's launcher script, which passes them to
`wrangler dev` as variables: the Worker cannot see its own checkout.

**Notes** (`GET`, `POST /admin/api/annotations`,
`DELETE /admin/api/annotations/:id`): a day, a kind and up to 80 characters,
for a tweet, an article or an announcement. Notes and Alice's public
releases (read from GitHub) are drawn as flags on every daily curve, so a
spike can be read against what caused it. It is free text about Alice's own
doings, never about a user. Adding and removing sit behind the
write lock and are audited.

### Growth

**Overview** (`GET /admin/api/growth`, `GET /admin/api/overview`): new
installations, AI requests and new accounts over the period against the one
before, the three as curves, installations stacked by platform, and the
free-quota figures.

**Activation** (`GET /admin/api/analytics`, `GET /admin/api/growth`):
everything here is a COUNT or a SUM over rows Alice already stores, collapsed
to totals before it leaves the database.

- *Retention*, share of installations still seen 1/7/30 days after first
  contact, from `installations.first_seen_at` / `last_seen_at`. Cohort
  eligibility is applied per horizon, so a two-day-old install never drags
  down D30.
- *Retention by week of first use*, the same measure for each of the last 12
  weeks, so a release that made Alice stickier shows in the weeks after it.
- *Activation funnel*, installations → 1st cloud request → 10th → quota
  exhausted → account created, from the write-once milestone columns below.
- *Free quota histogram*, how far into their 21 requests users actually
  get. This is the number that tells you whether 21 is the right number.
- *Versions still in use*, installations seen in the last 30 days by
  platform and version.

**Download clicks** (`GET /admin/api/events`): clicks on the site's Download
buttons, by platform and by day, see [Usage counters](#usage-counters).

**Downloads** (`GET /admin/api/github`): every installer of
`alice-btc/alice` and `alice-btc/alice-wallet` (`.dmg`, `.msi`, `.exe`,
`.AppImage`, `.deb`, `.rpm`, `.apk`) by platform and version, downloads per
day, and the repositories' traffic. Checksums and signatures are left out:
they are fetched to verify an installer, not to install Alice.

GitHub gives a running total per file and keeps traffic for 14 days. Each
read therefore also files the day's figures in `github_daily`, which is what
turns totals into downloads per day and two weeks into months. It is the one
reading route that writes, and it writes counters about Alice's public
repositories. The history only knows the days the console was opened: after
a gap, the downloads of those days land on the day of the next read, and the
page says so. A file first seen after its repository was already tracked is
a new release, so all its downloads count as new. The very first read counts
nothing as new.

The Worker asks GitHub, not the page, so the page's CSP allows no outside
host at all. The download counters are public and need no token. Traffic
(page views, clones, referring sites) needs `GITHUB_TRAFFIC_TOKEN`. GitHub
counts repeats and knows nothing Alice could use about who downloaded.

**Site** (`GET /admin/api/site-analytics`): visits and page views per day,
top pages, countries and referrers over the period, read from Cloudflare Web
Analytics (`rumPageloadEventsAdaptiveGroups` on the GraphQL API). The site
already loads that cookie-free beacon, so this collects nothing new. It needs
`CF_ANALYTICS_API_TOKEN` and `CF_ACCOUNT_ID` in the local `.dev.vars`;
without them the endpoint answers `configured: false` and the page explains
the setup. The site tag is looked up by exact host (`alicebtc.com`, or
`CF_WEB_ANALYTICS_HOST`) unless `CF_WEB_ANALYTICS_SITE_TAG` is set; with no
exact match the page says so rather than show another site of the account. A
Cloudflare error is shown on the card instead of failing the page.

### Money

All three pages below read `GET /admin/api/money`: what the billing tables
hold, as totals. No invoice is listed with its account and no payer is named.

**Revenue**: sats received, invoiced value and invoices paid over the period
against the one before, a curve, the last 12 months, invoices by status (an
expired invoice is a checkout nobody paid in time), the share of invoices
opened in the period that were paid, and the number of months people buy.
Revenue is shown beside the Venice spend for the same period and not
subtracted from it: one is in the invoice currency, the other in USD, and
the console does not invent an exchange rate.

**Subscriptions**: active paid plans, those running out within 7 and 30 days
(dates only), plans past their date that the hourly sweep has not returned
to free yet, and the renewal reminders sent. A button opens the account list
filtered on the paid plan, which is where a name appears.

**Usage**: requests answered, bytes sent to Venice and received, the same as
curves, free against paid, how much of their allowance the paid plans use,
and how requests ended. Free and paid are told apart by the plan each
account holds today, because the ledger does not record the plan a request
was served under.

**Venice cost** (`GET /admin/api/venice`): the USD, DIEM and bundled-credit
balances, what was spent over the period by day and by product, the daily
average and how long the balance lasts at that pace. Read from Venice's
`/api_keys/rate_limits` and `/billing/usage-history` (beta). Venice's ledger
has one line per request; the lines are added up in the Worker and dropped,
so only sums leave it: no request id, no token count, nothing finer than the
day, and nothing is stored. Cost is units times Venice's list price in USD,
whichever balance paid. It needs `VENICE_BILLING_API_KEY` in `.dev.vars`.

**Faucet** (`GET /admin/api/test-wallet-faucet`): see
[docs/test-wallet-faucet.md](../test-wallet-faucet.md).

**Promos** (`GET /admin/api/promo-codes`): the manual codes that grant extra
free requests.

### Accounts

**Accounts** (`GET /admin/api/accounts?q=`): search by username, exact email
(hashed the same way login does: the stored address is encrypted, so there
is no substring search over it), or support id, and filter by plan, status
and creation date. The three filters are closed lists and a number, never
free text. Anonymous installations are excluded from this list; they are not
accounts.

**Account detail** (`GET /admin/api/accounts/:id`): username, display name,
creation date, login methods with their labels and timestamps (never a
credential, key, or hash), plan/quota/usage, last session activity, status,
and the account's own last 10 technical error events (category + status
code + timestamp only).

**Operator tools**: suspend/reactivate (reason required, both audited),
credit adjustment (`delta` + reason, clamped so a reduction can never drop
the limit below what is already used), permanent deletion (see below), and
promo code management. All of them sit behind [the write
lock](#the-write-lock-and-re-authentication).

**Audit** (`GET /admin/api/audit-log`, `GET /admin/api/access-denials`):
every state-changing admin action, newest first, with the acting admin's
support id, the action, the target's support id (kept even after a
deletion), and a small metadata blob (the reason string, before/after
numbers, never a secret or free-text content). Under it, the refused
attempts to reach the console.

**Admins** (`GET /admin/api/admins`): who has console access and with which
role.

## Look and feel

The dashboard is deliberately the same visual language as the app, so a
screenshot of it can go straight into Alice's communication without looking
borrowed from a generic admin tool.

- **Palette**: `PALETTES.blue` from `packages/alice-content/src/theme.ts`,
  transcribed into CSS custom properties, the same values the web app
  already declares in `globals.css`. Accent tones for status come from the
  other Alice palettes rather than arbitrary colours: `flame` for danger,
  `green` for OK, `bitcoin` for warnings.
- **Type**, three faces with one job each. PressStart2P, the pixel face,
  names places: the title, the four sections, a card's heading.
  terminal-grotesque carries figures, as `typography.numbers` does in the
  wallet. Everything meant to be read (labels, table headings, axes,
  sentences) is in the system face at 12px or more. The pixel face is
  unreadable at 7 and 8px. The two brand faces are embedded as WOFF2 data URIs,
  converted from the TTFs in `apps/app-web/public/fonts` (115KB + 49KB of
  TTF → 29KB + 12KB). The page's CSP is `default-src 'none'`, so nothing can
  be fetched from a CDN, the bytes have to travel with the Worker.
- **Colour of text**: running text is near-white (`#e6edf3`), secondary text
  a grey-blue (`#9aa9c0`). The primary blue is an accent, kept for headings,
  figures and the open tab: a page set entirely in it has no hierarchy.
- **Pixel treatment**: 2px borders and a 2px radius everywhere, matching
  `getPixel()`. Chart bars keep the pixel look through a banded fill, so
  they read as part of the same language as the app's toggles.
- **Charts**: one bar per hour on the 24-hour view and per day otherwise, a
  labelled axis, the period's average as a dotted line, and under the plot
  the total, the average, the lowest and the highest bucket. A stacked chart
  has one colour per key and a legend.
- **Themes**: dark by default like the app, with a light toggle for
  screenshots on a white page.

Two deliberate deviations from the palette, both because this page carries
far denser text than an app screen:

- The palette's own `muted` (`#4a6a9a` dark, `#b8d0ff` light) is an accent
  tone in the app and too faint for a sentence. Secondary text uses
  `--alice-dim` instead: `#9aa9c0` on dark, `#51627c` on light. `muted` is
  kept for borders and decoration.
- `--alice-ink` carries headings and figures. In dark mode it is the
  primary; in light mode the primary is a pale accent (1.9:1) that cannot
  carry a headline number, so it falls back to a dark blue (`#1f4f9c`).

### The page's source

`admin-dashboard-html.ts` assembles the page from the stylesheet
(`admin-dashboard-css.ts`) and the client script in three parts that share
one closure: `admin-dashboard-client-core.ts` (state, API, write lock,
charts, tables), `-today.ts` (Today and Growth) and `-money.ts` (Money,
Accounts, sign-in, router).

Those parts are `String.raw` templates. In an ordinary template
literal a lone backslash disappears at compile time, which can turn a regex
into a comment and leave the page blank. Raw text
reaches the browser as written. Two things still cannot appear in those
files: a backtick, and a dollar sign followed by a brace.

### Looking at it without production

```bash
node apps/venice-proxy-worker/scripts/console-preview.ts
```

serves the real page and the real API on `http://localhost:8799/admin` over
an in-memory database built from the migrations and filled with made-up
activity. It prints its sign-in. Nothing in it is production and it all
disappears when the process stops. `PREVIEW_DEV_VARS=/path/to/.dev.vars`
lends it the `CF_*` values of that file, so the Infrastructure and Site
pages show Cloudflare's real counters.

## Installation milestones

`migrations/0007_installation_milestones.sql` adds a handful of write-once
columns to `installations`, which is already pseudonymous (the primary key
is an HMAC of the install id):

```
platform, app_version,
first_cloud_request_at, tenth_cloud_request_at,
quota_exhausted_at, account_created_at
```

The design principle is **milestones, not an event stream**. Each column
records "this installation reached step X at time T", written once with
`COALESCE` and never overwritten. That is enough for funnels, retention and
cohort analysis, while keeping what Alice stores fully enumerable, there is
no per-action log, and no way to reconstruct a behavioural timeline.

`platform` is validated against an allowlist (`ios`, `android`, `web`,
`desktop-macos`, `desktop-windows`, `desktop-linux`) and `app_version`
against `N.N.N`, both server-side. Anything else is dropped rather than
stored, so these columns can never carry arbitrary client text. Clients send
them as the `x-alice-platform` and `x-alice-app-version` headers.

**There is deliberately no wallet milestone.** The server has no reason to
know that a wallet exists, when it was created, or that it was used. Cloud
request milestones exist only because those requests already pass through
this proxy on their way to Venice.

## Usage counters

The apps send no usage counter: nothing in the client counts what is opened
or how many answers are given, and there is no setting for it because there
is nothing to switch off.

Up to 0.2.9 the apps posted daily totals to `POST /account/events` (Alice or
one of its screens opened, a local model downloaded). The route still answers
`{ "accepted": 0 }`, so those versions see no error. It reads nothing from
the request and stores nothing. Migration `0022_drop_app_usage_counters.sql`
deletes the totals that were stored.

### The site's Download buttons

`POST /site/events` takes `{ "platform": "desktop-macos" }` and adds 1 to
`site_download_clicked` for that platform and day. No session: the site has
no account. The platform comes from a closed list of the five the site has a
button for, anything else is ignored, and the route is limited to 60 requests
an hour per network. The request carries no cookie and no identifier
(`apps/site/src/lib/download-click.ts`).

It is the only counter kept in `events_daily`: a row says "on day D, the
button for platform P was clicked N times" and nothing more.

## What is deliberately never collected or shown

- Prompts, AI responses, or any Private Cloud request/response body, the
  proxy never reads them in the first place (see `docs/security/private-cloud-e2ee.md`).
- Wallet seeds, wallet private keys, wallet transactions, or even *the fact
  that a wallet exists*, this Worker has no wallet data at all, Alice
  never sends it here, and no milestone or event records wallet activity.
- Per-user click streams, page-view timelines, or session replay, and no
  usage counter from the apps.
- Passwords, password hashes and session tokens.
- Raw IP addresses. `technical_events` (auth/email/venice error telemetry)
  stores only a category, a code, a status, and, only when the request was
  already authenticated, the acting `user_id`; it is never derived from IP
  or install id, so it adds no new tracking surface.
- Per-model usage breakdown. `cloud_request_ledger` does not record which
  model a request used, so the dashboard cannot show it either; adding that
  column would be new tracking, which this project avoids by default.
- Full unmasked email addresses in any list view.
- The internal `user_id` to end users, it only ever appears to admins, in
  the single-account detail view, because operators need a real primary key
  to act on a record via this API.

## Account deletion

`DELETE /admin/api/accounts/:id` requires the request body's `confirm` field
to exactly match the account's support id (its username, or its internal id
if it never set one), copy-pasted, not just any string, as a strong
confirmation gate. The action is written to `admin_audit_log` *before* the
row disappears (so the trail survives), then every row referencing the
account is deleted in an explicit, ordered batch (promo redemptions, admin
role, cloud request ledger, free grant, installations, legacy passkey
credentials if present, password credentials, identities, sessions, usage
counters, entitlements, the
username reservation is released, and finally the `users` row itself). This
does not rely on SQLite's `ON DELETE CASCADE` being active for the
connection, it is correct regardless of D1's per-connection foreign-key
pragma state.

### One-off reset of the beta data

`apps/venice-proxy-worker/scripts/reset-beta-data.sql` clears the private
beta before the public launch. It deletes every anonymous account (nothing
of its own: no identity, password, passkey, admin role, paid plan, invoice,
billing contact or account email) in the same explicit order as above, the
installations nothing references any more, and the statistics: product
counters, technical errors, request history and faucet claims. Every other
account, invoices, billing contacts, the audit trail, access denials, promo
codes and flagged installations stay. Request rows still reserved or from
the last 24 hours stay too, so a request in flight can still settle.

`reset-beta-data-count.sql` previews the same rule read-only, and
`src/reset-beta-data.test.ts` checks that the two agree. Procedure, from
`apps/venice-proxy-worker`:

1. `npx wrangler d1 execute alice-accounts --remote --file scripts/reset-beta-data-count.sql`
2. `npx wrangler d1 time-travel info alice-accounts` and keep the bookmark.
3. `npx wrangler d1 execute alice-accounts --remote --file scripts/reset-beta-data.sql`
4. Run the preview again: nothing left to delete.

Undo within the Time Travel window:
`npx wrangler d1 time-travel restore alice-accounts --bookmark=<bookmark>`.
An app whose anonymous account is gone signs in again silently with a new
one and a fresh free quota, at the latest when its 15-minute access token
comes up for refresh. Until then its Private Cloud requests can fail with
"Sign in", so run the reset at a quiet hour. Conversations are never on the server, so
nothing on the device changes.

## Environment variables and secrets

| Name | Kind | Required | Notes |
| --- | --- | --- | --- |
| `ACCOUNT_DB` | D1 binding | existing | Same database as accounts/auth. |
| `AUTH_HMAC_KEY` | secret | existing | Same key used for session tokens. |
| `ADMIN_BOOTSTRAP_SECRET` | secret | new, admin-only | ≥32 bytes. Only used by `POST /admin/api/bootstrap`. Safe to rotate/remove after the first admin exists. |
| `ADMIN_ALLOWED_USERNAMES` | var | optional | Comma-separated usernames. When set, a session must match one of these **and** have an `admin_users` row. See below. |
| `ADMIN_DASHBOARD_PATH` | secret | optional | Secret path for the dashboard, e.g. `/console-7fq2xk`. When set, `/admin` stops existing. Set it as a secret, not a `[vars]` entry, so it does not sit in git. |
| `CF_ANALYTICS_API_TOKEN` | local `.dev.vars` only | optional | Cloudflare API token with only *Account Analytics: Read*. Lets the Site and Infrastructure pages read Cloudflare's analytics. Never set it on the deployed Worker. |
| `CF_ACCOUNT_ID` | local `.dev.vars` only | optional | The Cloudflare account the token reads. |
| `CF_WEB_ANALYTICS_SITE_TAG` | local `.dev.vars` only | optional | Web Analytics site tag, when the lookup by host does not find the site. |
| `CF_WEB_ANALYTICS_HOST` | local `.dev.vars` only | optional | Host to find the site by. Defaults to `alicebtc.com`. |
| `VENICE_BILLING_API_KEY` | local `.dev.vars` only | optional | A Venice key of the account Alice is billed on, for the Venice cost page and the balance light. Falls back to `VENICE_API_KEY`, which in `.dev.vars` is usually a placeholder Venice refuses. Never set it on the deployed Worker. |
| `ADMIN_ALERT_VENICE_USD` | local `.dev.vars` only | optional | Below this many USD of Venice credit the console warns. Defaults to 10. |
| `GITHUB_TRAFFIC_TOKEN` | local `.dev.vars` only | optional | A fine-grained GitHub token limited to the two public repositories with the Administration permission in read-only, which GitHub requires to read traffic. Without it the Downloads page shows the public counters only. |
| `VERCEL_API_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID` | local `.dev.vars` only | optional | Lets the Versions page show the site's last deployment. |
| `CF_WORKER_SCRIPT_NAME`, `CF_D1_DATABASE_ID` | set by the launcher | optional | Which Worker and database the Infrastructure page reads. Read from `wrangler.toml` by the launcher. Without the database id the D1 figures cover every database of the account, and the page says so. |
| `CONSOLE_GIT_BRANCH`, `CONSOLE_GIT_COMMIT`, `CONSOLE_MIGRATION_FILES` | set by the launcher | optional | The checkout the console runs from, for the Versions page. |
| `EXPO_PUBLIC_ALICE_APP_VERSION` | client build var | optional | `x.y.z`. Inlined into the app builds so they can report their version. Malformed values are simply not reported. |

### Locking the dashboard to specific people

`ADMIN_ALLOWED_USERNAMES` is the answer to "only I should be able to see
this". With it set, being in the `admin_users` table is no longer
sufficient, the session's username must also appear in the list. That means
a rogue promotion, a mistake, or a direct write to D1 by anything other than
this Worker still grants nothing. Set it to your own username and the
dashboard is yours alone. Store the value in `.dev.vars`, not in
`wrangler.toml`, and quote it because dotenv treats an unquoted `#` as the
start of a comment:

```dotenv
ADMIN_ALLOWED_USERNAMES="admin.whiterabbit#4269"
```

Without the quotes, Wrangler loads only `admin.whiterabbit`, and the valid
admin account is refused even though the file appears to contain the complete
username.

Leave it unset to let the database decide alone (useful before you know your
final username). Combined with Cloudflare Access in front of `/admin`, an
attacker needs your IdP **and** your Alice password **and** a listed
username.

### Rotating the admin username without locking yourself out

The value is a **comma-separated list**, which is what makes a safe rotation
possible: the old and the new name can both be listed while the change is in
flight, so there is never a moment when no name matches.

Two server rules make the order matter. A username can only be changed **once
every 30 days**, and the previous one stays **reserved for 180 days**. A
rotation done in the wrong order therefore cannot simply be undone.

1. **Before touching anything**, confirm the dashboard works as it stands:
   sign in and load one read screen. That is the baseline you compare against.
2. **Add the future username to the list first**, next to the current one, and
   restart the console. Both are accepted from now on.
3. **Change the username in the app.** The session keeps working, because its
   new name is already listed.
4. **Sign in again and confirm** the dashboard loads and returns data. Until
   this passes, do not go further.
5. **Remove the old username from the list**, restart, and confirm once more.
   The old access is invalid only at this point.

The list lives wherever the console actually runs. For a local console that is
`.dev.vars`, which is git-ignored: the real value never belongs in the
repository, and `wrangler.toml` carries a format example only.

No other new environment variable is required. The dashboard reuses
`ALLOWED_ORIGINS`/CORS handling only for its `/admin/api/*` JSON responses;
the `GET /admin` HTML page is same-origin (served by the Worker itself) so it
needs no CORS entry.

## Tests

`apps/venice-proxy-worker/src/admin.test.ts` covers: bootstrap (success,
wrong secret, refuses a second bootstrap), access control (non-admin
rejected, unauthenticated rejected, static shell reachable without auth),
overview counts, account search/suspend/reactivate (and that a suspended
account really can't log in), reason-required enforcement, credit
adjustment clamping, that account detail never serializes a secret, delete
confirmation matching, last-admin protection, promo code creation,
redemption, double-redemption and disabling, plus:

- destructive actions refused without / with a wrong re-auth password, and
  the target account left untouched afterwards;
- a `support` operator can read every read endpoint but is refused on every
  mutation, with `admin_role_required`;
- denied attempts recorded and listable;
- analytics returning aggregates that contain no `user_id` or `install_id`;
- platform/version recorded when valid, **dropped when not on the
  allowlist**;
- the console reporting the site's download clicks and nothing an app
  posted to the old counters route.

`apps/venice-proxy-worker/src/admin-insights.test.ts` covers the reading
pages and the write lock, each against rows put in a database built from the
migrations:

- the unlock refused on a wrong password and to a `support` operator, a
  write refused with neither password nor unlock, accepted with the unlock,
  and a forged, expired, over-long or borrowed unlock refused;
- deletion and role changes refused on the unlock alone;
- account filters, and a filter value outside the closed lists ignored;
- money totals, and that the page carries no account, invoice id or
  provider reference;
- the period falling back to 30 days on a value it does not offer;
- errors counted without the BTCPay events;
- health answering with every outside service down, turning red on a BTCPay
  outage and on refunded requests, and reporting the previous visit;
- the Venice lines added up, paginated by cursor, with no request id, key id
  or token count in the answer;
- Cloudflare rows mapped to buckets, and a script name unable to close the
  GraphQL string it is written into;
- pending migrations listed, and not guessed when the table is missing;
- every reading route refused to a signed-in non-admin;
- a cron run recorded when it works, when it throws and when it recovers,
  the recording unable to break the task, and the light turning red for a
  task that stopped;
- two download snapshots turned into downloads per day, a second read in a
  day not counted twice, nothing new on the first day, traffic kept by day
  with a token and never asked for without one;
- a note added, listed and removed behind the write lock, each audited, and
  the audit log intact after its table was rebuilt.

Run with:
```bash
node --test "apps/venice-proxy-worker/src/**/*.test.ts"
```

## Known limitations

- **Billing is BTCPay Server only.** Since `migrations/0012_billing.sql`,
  the Cloud plan is sold through BTCPay (`invoices`, `entitlements`,
  `billing_reminders`, see [docs/billing-and-quotas.md](../billing-and-quotas.md)).
  The "promo codes" here remain a manual operator tool for granting extra
  free requests, not a purchase flow.

  BTCPay Server is the only provider for the beta, free to run, no
  card data anywhere, and a natural fit for a Bitcoin wallet. Stripe is
  deferred until commercialisation is actually decided. The `invoices`
  table keeps a `provider` discriminator so Stripe can be added later
  without rewriting the schema; if it is, never store card data, only an
  opaque provider token plus the brand/last-4 the provider echoes back, with
  the top-up ledger kept separate from subscription state.
- **No per-model usage stat**, by design, `cloud_request_ledger` does not
  record which model served a request, and adding that column would be new
  tracking.
- **No IP-based abuse dashboard.** Alice intentionally does not persist raw
  IPs; rate limiting uses HMAC'd, day-bucketed IP hashes that are not
  admin-queryable. Anonymous-installation counts, the activation funnel and
  free-quota consumption are the available proxies for abuse.
- **Anonymous usage is not perfectly unlinkable.** `user_installations` and
  `free_grants` already tie an installation to an account created later on
  that same install, which predates this dashboard. Nothing here exposes
  that link per-individual, but if the "anonymous" promise is meant to be
  strict, that relationship is the thing to revisit.
- **Retention is approximated** from `first_seen_at`/`last_seen_at` rather
  than a true daily-active signal, because Alice does not store per-day
  activity. It answers "was this install still around N days later", which
  is the honest reading of the number.
- **Admin accounts authenticate with a password.** Re-auth is required for
  irreversible actions.
