# Alice

Alice is a private AI companion for Bitcoin. She answers your questions,
explains what you are looking at on the chain, and teaches you the subject at
your own pace. She runs on your device or through encrypted inference you can
verify, and she never sees your keys.

**Alice App** is the companion: a chat that knows Bitcoin, an Explorer that
reads the chain in plain words, a Learn library of courses, and a Playground
where you practise real wallet moves with coins that are worth nothing.

Alice Wallet, an experimental self-custodial wallet that has not been audited,
lives in its own repository: [alice-btc/alice-wallet](https://github.com/alice-btc/alice-wallet).

## What Alice can never see

Security and privacy are not a section of this project; they are its shape.
The full details live in [docs/security/](docs/security/), but the summary
belongs here, up front.

**Data that can never be collected**, impossible by construction rather than
by promise:

- your recovery phrase, wallet keys, balances and transaction history: the
  server never receives them;
- your conversations with Alice: questions are encrypted on your device
  before they reach our proxy, and answers are decrypted on your device;
- your passwords: only salted hashes are stored;
- your IP address as a durable record: it is hashed together with the day
  under a server-side secret, so the result changes daily, used only for rate
  limiting, then forgotten. That protects it on our side, and a VPN protects
  it from everyone else you connect to, which we recommend.

**Data we do collect**, the complete list and nothing else:

- account data, if you create an account: your email address, stored
  encrypted so Alice can warn you before a paid plan runs out (the encryption
  protects it if the database leaks, not from our server, which decrypts it to
  send, so an alias works perfectly well), a one-way fingerprint of it used to
  sign you in, a masked display form like `sat****@bitcoin.com`, your
  username, and quota counters for Private Cloud;
- one usage record per Private Cloud request, against your account or your
  anonymous installation: when it happened and, on a plan, how many encrypted
  bytes it carried, never what it said, kept as long as the account exists;
- aggregate, day-level product counters (app opened, chat opened…) keyed only
  by day, platform and app version, never by user, session or device;
- whatever you explicitly put in a support report.

**Data third parties see because Alice uses them**, each provider seeing only
its own slice: Cloudflare relays encrypted AI traffic, hosts our DNS, and
counts page views on the website (cookieless, no fingerprint, site
only, never in the app);
Venice runs AI inference inside a hardware enclave and receives ciphertext;
Esplora (a blockchain-explorer API) answers on-chain lookups, including the
Playground's on Mutinynet (a test network); Explorer asks the Arkade, Bark
and Spark servers about coins on those layers; Resend delivers login-code
emails; Hugging Face serves the semantic-search model to web builds (fetched
on your first question, never on a data-saving connection, and the installed
desktop app carries it and asks Hugging Face nothing) and the optional local
chat models; jsDelivr serves downloadable Learn languages and course art;
GitHub serves course images from Plan ₿ Network's repository. What a CDN
sees is the classic slice: your IP address and which files you fetch. None
of these providers receives your seed or your chat history in clear.

Recovery phrases and private keys pasted into chat are blocked before they
can be stored or sent to any AI backend.

## Honest limits, stated plainly

- **Private Cloud is "attested, but not pinned."** Alice verifies that
  Venice's AI runs inside a genuine, current, non-debug TDX hardware enclave
  (a TEE, a processor mode that isolates code and memory from its own host),
  and that the encryption key is bound to that enclave. What Alice cannot yet
  verify is *which* enclave image runs, because Venice has not published
  reference measurements. Until then, short copy may say that messages are
  encrypted end-to-end, every detailed explanation states this limit, and
  nothing ever displays "E2EE verified". Details:
  [docs/security/private-cloud-e2ee.md](docs/security/private-cloud-e2ee.md).
- **E2EE turns are single-shot.** Venice does not encrypt assistant replies,
  so Alice drops them from the context instead of leaking them back.
- **Semantic search runs on Alice App web and Desktop.** Retrieval is hybrid:
  keyword matching fused with an on-device embedding model, and it falls back
  to keywords alone, silently, whenever the model is not loaded.
- **The Playground is on-chain only, on Mutinynet.** It has one explorer
  (Esplora) and one faucet and no fallback server: if either is down, the
  Playground shows the error. Only the fee estimate falls back, to 1 sat/vB.

The broader map is in [docs/security/THREAT_MODEL.md](docs/security/THREAT_MODEL.md).

## What's in the app

Alice App is more than the chat:

- **Chat**: the companion itself, over a built-in Bitcoin knowledge base
  (retrieval described under Honest limits above).
- **Explorer**: blocks, transactions, addresses and xpubs, explained by
  Alice instead of dumped as hex. It also reads three layers that settle on
  Bitcoin, Arkade, Bark and Spark, and ties every off-chain coin back to its
  Bitcoin side: the commitment, round or deposit transaction it hangs from,
  the block that confirmed it, and the exit path that brings it on-chain
  without the operator. The layers' own explorers (Sparkscan, for one) stop
  at the off-chain ledger; Alice shows both sides in one place.
- **Learn**: the [Plan ₿ Network](https://planb.network) educational corpus
  (CC BY-SA 4.0), reshaped into per-language packs. English and French ship
  in the app; 26 more languages download on demand from
  [alice-learn-planb-packs](https://github.com/mariusoffchain/alice-learn-planb-packs).
  Alice never rewrites the teaching text; she explains it when you get stuck.
- **Playground**: a practice wallet on Mutinynet (a Bitcoin test network
  whose coins are worthless by design): real wallet mechanics, zero risk.

## Trying Alice

- [Alice App](https://app.alicebtc.com), the companion, in any browser,
  phones included.
- **Alice Desktop** for macOS, Windows and Linux, from
  [alicebtc.com](https://alicebtc.com) or the
  [latest release](https://github.com/alice-btc/alice/releases/latest):
  - macOS: a universal DMG, signed with an Apple Developer ID and notarised
    by Apple; the first launch asks the usual question about an app
    downloaded from the internet;
  - Windows: an MSI, not signed yet, so SmartScreen shows "Windows protected
    your PC" until you choose **More info**, then **Run anyway**;
  - Linux: an AppImage and a Debian package.

  The desktop app adds Local mode (see AI modes below). Compare each download
  with the release's `SHA256SUMS-desktop-*.txt` before opening it; the steps
  are in [docs/BETA_TESTING.md](docs/BETA_TESTING.md).

Do not rely on a URL alone to identify a build: check its version and commit.
Never share your recovery phrase, and never send it to Alice: she will never
ask for it.

An Alice account (email + username + password) is optional; it exists only to
manage Private Cloud quotas. 21 free Private Cloud requests are available
without any account.

Something wrong or unclear? In the app, open **Account > Report an issue**, or
open an [issue](https://github.com/alice-btc/alice/issues) here. Issues are
public: leave out anything personal, or write to
[support@alicebtc.com](mailto:support@alicebtc.com) instead. Security issues
follow [SECURITY.md](SECURITY.md).

## AI modes

- **Private Cloud**: encrypted inference through Alice's blind proxy (a
  Cloudflare Worker in [apps/venice-proxy-worker](apps/venice-proxy-worker)).
  The proxy holds the Venice API key server-side and relays ciphertext; no
  client build ever contains the key.
- **Local**, in Alice Desktop: a model file (GGUF) downloaded from Settings
  and run entirely on your device. No chat model is preinstalled in any build. (The desktop
  installer does include the small semantic-search embedding model, so
  knowledge retrieval works offline out of the box; web builds fetch it on
  first use instead.)
- **Custom**: your own OpenAI-compatible endpoint.

## Repository map

```
apps/app-web              Alice App (Next.js static export: web, and the
                          desktop shell's frontend)
apps/app-desktop          Alice App desktop shell (Tauri)
apps/site                 alicebtc.com (Next.js static export)
apps/venice-proxy-worker  Private Cloud blind proxy (Cloudflare Worker)
packages/alice-ai         AI companion: chat, RAG, E2EE, memory
packages/alice-content    knowledge base and generated Learn catalog
packages/practice-wallet  the Playground's Mutinynet wallet logic
packages/alice-ui         shared UI primitives
```

## Development

Use Node.js `>=22.12.0 <25` (Node `24` LTS is recommended). The lockfile is
the source of truth for a reproducible dependency tree.

```bash
npm ci
```

Unit tests, from the repository root:

```bash
npm test
```

CI runs that plus the dependency-audit gate; run both before pushing:

```bash
npm run check:npm-audit
```

Type-checking runs per workspace (each app and package carries its own
`tsconfig.json`; Next checks its app during its build). A single
repo-wide `tsc` pass is not wired up yet. For the pure packages:

```bash
npx tsc --noEmit -p packages/alice-ai
```

Tests use Node's built-in runner (`node --test`) on the TypeScript sources
directly, so there is no test framework to install and no build step. One
constraint follows: Node resolves ES module specifiers literally, so imports
carry an explicit extension (`./venice-errors.ts`). Only pure modules are
testable this way.

For the reproducible release checklist across web and Desktop, see
[BUILDING.md](BUILDING.md). Never place production secrets in a client build.

### Alice App, desktop build (Tauri)

Start the Next dev server first, then the desktop shell. `beforeDevCommand`
is empty on purpose, so `tauri dev` never builds the web app itself:

```bash
npm run dev --workspace apps/app-web
```

```bash
npm run dev --workspace apps/app-desktop
```

How the frontend is served differs between the two modes, and the difference
matters:

- **dev** loads `devUrl` (`http://localhost:3000`), so web changes hot-reload.
- **prod** embeds `apps/app-web/out`, produced by `beforeBuildCommand`.

Which one applies is decided at compile time by the `custom-protocol` Cargo
feature. It must stay declared as a **package** feature in
`apps/app-desktop/src-tauri/Cargo.toml`:

```toml
[features]
default = ["custom-protocol"]
custom-protocol = ["tauri/custom-protocol"]
```

Enabling it directly on the `tauri` dependency instead leaves nothing for
`tauri dev`'s `cargo run --no-default-features` to switch off, so the desktop
app silently serves a stale `out/` snapshot and ignores the dev server.

One consequence to expect: the two modes have different web origins
(`http://localhost:3000` in dev, `tauri://localhost` in prod), so they use
different `localStorage`. Conversation history and AI settings do not carry
over between a dev run and an installed build.

### Environment

Copy `.env.example` to `.env` and adjust when needed:

```bash
cp .env.example .env
```

Never commit `.env`. Every distributed build, including Desktop, routes
Private Cloud through `EXPO_PUBLIC_VENICE_PROXY_URL`
(`https://proxy.alicebtc.com` for official builds): a desktop binary
can be inspected, so none may contain the Venice API key. Direct Venice calls
exist only for explicit internal diagnostics with a personal, revocable key.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md)
first. Report security issues privately to
[contact@alicebtc.com](mailto:contact@alicebtc.com).

## License

Alice is licensed under [GNU AGPL-3.0-or-later](LICENSE). See
[NOTICE](NOTICE) for copyright and third-party notices, and
[TRADEMARKS.md](TRADEMARKS.md) for the separate rules governing the Alice
name and visual identity.
