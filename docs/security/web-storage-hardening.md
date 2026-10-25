# Web storage hardening

How Alice App protects what it keeps in your browser, what happens when that
storage fails, and where the protection stops. The encryption scheme itself is
described in [Local chat encryption](local-chat-encryption.md).

## What is encrypted

Alice App keeps your conversations, your memory and profile, and the records of
the Explorer and the Playground in the browser. Each value is encrypted with
AES-256-GCM under one key created for this browser. The key is random,
non-extractable (WebCrypto will not hand it out) and kept in IndexedDB. It is a
storage key, not a wallet key: Alice App holds no wallet secret.

The app uses this key on its own; there is no PIN or unlock step on the web.

Some data stays outside this encryption:

- the account session token, Custom AI credentials and other preferences;
- the Explorer cache, which keeps the addresses you looked up and the public
  chain data returned for them in clear. Someone with access to the browser's
  storage can see which addresses were consulted.

## When storage fails, nothing is lost or written in clear

- **One key, never replaced.** The key is created in a single IndexedDB
  transaction that returns whichever key was stored first, so several open
  tabs end up with the same key. A key that cannot be read or is invalid is
  never overwritten.
- **No plaintext fallback.** Without a working key, new conversations and
  records stay in memory for the session and are never written to disk in
  clear. If the browser refuses storage later on, saving a conversation fails
  with a notice; the conversation stays on screen, without saved history.
- **Unreadable records are kept as they are.** A conversation, memory, profile
  or Explorer and Playground record that no longer decrypts is left intact and
  a notice appears. A save never writes over it, including when the
  conversation list is readable but the conversation itself is not. Before
  writing, the app checks that the stored value still authenticates under the
  key and that it did not change in the meantime.
- **The Playground loads only when opened**, so its records are not decrypted
  with everything else. This limits what sits decrypted in memory; it does not
  lock the data or guarantee that memory is wiped.

Two valid saves from two tabs at the same moment still follow "last write
wins": the checks above protect unreadable data, they are not a transaction
across records or tabs.

## Deleting is explicit and complete

- **Delete all** in Settings walks every stored conversation, not only those
  the list shows, so a damaged or incomplete list cannot leave messages behind.
  It stays available when the list shows 0 conversations, since unreadable
  records can still exist, and its confirmation says so.
- Erasing memory and profile reaches what is stored as well as what is in
  memory, with or without a working key.
- Only an explicit deletion removes unreadable ciphertext. Reading, starting
  the app or a failed save never does.
- If storage cannot be reached, the deletion fails and the app says so instead
  of looking done.

Delete all is not atomic with writes from another open tab: stop activity in
the other tabs before clearing everything.

## Which scripts may run

The web build (`npm run build --workspace @alice-wallet/app-web`) exports
static pages, then `scripts/secure-app-export.mjs` adds a Content Security
Policy to each page, before its scripts. It allows the app's own scripts,
WebAssembly compilation and the hashes of that page's inline scripts. Any other
inline script, HTML event handler or string evaluation is blocked. Workers from
the app's origin or from `blob:` remain allowed. Never deploy `next build`
output that has not gone through this step.

The hosting also sends an enforced CSP header, set in
`apps/app-web/vercel.json`. Its `unsafe-inline` is narrowed by the per-page
policy; the header alone would not give the same protection. Inline styles stay
allowed. `connect-src` allows any HTTP(S) or WebSocket destination, because
Custom AI endpoints and custom Explorer nodes are chosen by the user; it
therefore cannot stop code that already runs in the page from sending data out.

The semantic-search engine loads its ONNX runtime from the app itself
(`/semantic-runtime/`) instead of a blob, and the desktop app uses
`/semantic-model/ort/` for its WebAssembly.

When the web app is deployed as a prebuilt output,
`scripts/prepare-web-deployment.mjs` copies the security headers of
`vercel.json` onto every route of the output: pages, files, assets and the 404
page. Missing or malformed headers stop the preparation before anything is
written.

## Limits

- Non-extractable means the key cannot be exported through WebCrypto. Any
  script running on Alice's origin can still use it, and protection against a
  full copy of the browser profile, a backup or an unencrypted disk depends on
  the browser and the operating system. It has not been tested.
- The browser key protects data at rest on this device only. It plays no part
  in Private Cloud, whose encryption is described in
  [Private Cloud E2EE](private-cloud-e2ee.md).
- Alice Desktop does not use this browser key. It keeps its own key in the
  operating system's keychain, as described in
  [Local chat encryption](local-chat-encryption.md).

## Checking it yourself

With the supported Node version, disposable browser profiles and test data:

```sh
npm run check:types
npm test
npm run build --workspace @alice-wallet/app-web
node scripts/prepare-web-deployment.mjs /path/to/fresh-prebuilt-output
```

Serve the prepared output with its routes, then look at the response headers,
`securitypolicyviolation` events and uncaught errors in the console. A plain
static server ignores the routes and headers, so it does not check this path.
[CSP tools](csp-tools.md) describes a scripted walk through the app with a
violation listener. CI runs the tests and the secured web build on every pull
request.
