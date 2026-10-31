# Changelog

Alice ships as three surfaces from one repository, and they are versioned
together: a single number means a tester and a log line refer to the same code.

- `0.2.7`, current release
- `0.2.6`, previous release
- `0.2.5`, previous release
- `0.2.4`, previous release
- `0.2.3`, previous release
- `0.2.2`, previous release
- `0.2.1`, previous release
- `0.2.0`, previous release
- `0.1.0`, previous closed beta
- `0.0.1`, first public baseline
- `1.0.0`, public launch, planned

## 0.2.7

Desktop installers for macOS, Windows and Linux ship with this release.

This release gives Private Cloud the thread of the conversation, an app
language with a French interface and French knowledge, the *Dictionnaire de
Bitcoin* in Learn, an Explorer that keeps up with Arkade, and the first
builds of Alice for Android and iOS, which are not yet distributed.

### Private Cloud

- Alice keeps the thread of a Private Cloud conversation. Every turn, her
  earlier replies included, now travels to the enclave encrypted in its own
  role, so a question such as "what would you think about her?" is read
  against the whole conversation instead of alone. Until now Private sent
  each question single-shot, with at most the last exchange re-encoded as a
  transcript, on the belief that Venice left assistant turns in clear; the
  enclave in fact decrypts them and rejects any plaintext turn (verified on
  29 October 2026). The history is bounded by a character budget and the
  proxy's message limit, and the public texts no longer describe Private as
  single-shot.
- Before anything is encrypted, Private Cloud measures the exact size of the
  request and drops the oldest turns of a very long conversation to stay
  under the proxy's limit, refusing locally, with nothing sent, only when
  the instructions and your latest message alone are too large.

### Language

- Alice App has an app language, French or English, in Settings › General.
  It follows the device language until one is chosen there: French on a
  French device, English on every other. No question is asked at first
  launch. Alice answers in the app language by default; "Auto", which follows
  the language of each message, is a choice. A short message such as "Thanks"
  or "Ark?" no longer switches the answer to another language, and the
  history of the conversation now counts in that decision.
- The interface speaks French when the app language is French: chat,
  Settings, Explorer, Playground, Learn, notices and dialogs, from one
  dictionary per language. The interface says "vous"; Alice says "tu" in
  her answers. English pages are unchanged.
- The knowledge Alice reads before answering exists in English as well as
  French (403 notes, machine-translated and marked as such), so an English
  question is answered from English notes, with the same retrieval cost.
- The site exists in French under `/fr`, with the contact menu, hreflang and
  a sitemap per language. English pages are unchanged.
- A language asked for in a message ("answer in English", "reviens au
  français") holds for the rest of that conversation, and for it only: a new
  conversation starts from the Settings choice again. The FR/EN badge the
  chat briefly showed is gone.

### Chat

- What Alice remembers about you is sent to her with the day each fact was
  noted and the rule that the current conversation comes first: she no
  longer presents a remembered fact as something said in this conversation,
  nor asks you to choose between a memory and what you just said.
- Alice never calls Ark a layer 1 or a base-layer protocol, in her notes and
  in a check on her answers, including when the dictionary's definition of
  Ark is what she read.
- On a phone, the message field grows with the text up to three lines, then
  scrolls inside, so the conversation stays visible; the keyboard's return
  key starts a new line and the send button sends. With a physical keyboard,
  Enter sends and Shift+Enter starts a new line, as before.

### Custom server

- An address ending in `/v1`, as clients' examples often show it, works: the
  app adds the paths itself and no longer asked for `/v1/v1/models`. The
  example in the address field no longer shows `/v1`.
- Settings says "connected to your custom server" only once the server
  answered at that address, and otherwise that it does not answer there;
  before, a saved address was reported as connected while the chat could
  not reach it.

- A custom server running Qwen3.5 or SmolLM3 (llama-server, Ollama, LM
  Studio) answers instead of failing with "Connection error". The backend now
  reads what the server speaks and serves from its model list: the OpenAI
  shape whenever `/v1/models` answers, Ollama's `/api/chat` only as a
  fallback, no longer guessed from the presence of an API key; a model family
  whose template takes a single leading system message gets Alice's context
  as user turns, as on the bundled local model; and thinking is switched off
  for those families, with any `<think>` block hidden from the answer in
  every case.

### Explorer

- When Sparkscan's request limit is reached, the Explorer stops asking until
  Sparkscan says it may, and tells how long to wait ("Try again in about 2
  minutes"), instead of sending requests that would be refused.
- An Arkade address with more than 500 coins shows them all and its whole
  balance: the lookup now reads every page of the operator's indexer before
  showing a figure, and a page that fails shows an error rather than a
  partial balance. A coin's expiry keeps its unit, a block height or a date,
  instead of a date in 1970 for a height; a spent coin later swept by the
  operator stays "spent".
- The newest Arkade commitment the Explorer starts from no longer stands
  still for weeks. The walk of the operator's wallet that finds it lets a
  trail go after two spenders that are not commitments (it followed coins
  into users' wallets and forgot the operator's own lines), keeps each
  output to watch once, and the Worker that does the walk for everyone now
  also listens to the operator's live stream between two walks, so a
  commitment funded from coins the walk never saw is still found, once the
  chain confirms it.

### Learn

- The *Dictionnaire de Bitcoin* by Loïc Pandul, 1408 definitions in French
  (CC BY-NC-SA 4.0, embedded with the author's agreement of 17 October 2026),
  is read in Learn from A to Z and from the home search, each definition
  with a way to ask Alice about it. When a question names a definition, Alice reads it
  before the course excerpt, and every reply that leaned on Learn material
  (a chapter, a tutorial, a definition) ends with a short sentence naming its
  source and shows a SOURCES block that opens the page in the app, with the
  author and licence.

### Desktop

- The macOS DMG is notarised by Apple and its ticket stapled, like the
  application inside it already was: the disk image itself now passes
  Gatekeeper's check, offline too.
- The app's content security policy no longer allows `eval`; it allows
  WebAssembly instead, which on-device search needs.
- A custom Explorer node or a custom AI server can be on another machine,
  an Umbrel or a VPS for instance, as on Alice Web; the app reached only
  servers on the same computer before.
- On Linux, when the system keychain is unavailable (no Secret Service, a
  locked keyring, a dismissed prompt), the app says so in a banner naming
  GNOME Keyring or KWallet, keeps the conversation in memory, and a Retry
  button saves it once the keychain answers, without reloading. What the
  disk already holds wins over what was written while the keychain was
  away. The window no longer goes white while GNOME asks to unlock the
  keyring.
- Shortcuts read `Ctrl` on Linux and Windows and `⌘` on macOS, and the
  sidebar answers the right key on each. Every surface opens on Private at
  first launch. The bitcoin sign `₿` is drawn by the app's own glyph where
  the system font lacks it. The `.deb` package carries its category and
  description.

### Phones

- Alice builds for Android and iOS from this repository, with the phone
  layout, the local models that fit a phone and the same Private Cloud,
  Explorer, Learn and Playground. These builds are not distributed yet;
  the store listings will follow. In the store builds nothing is for sale.

### Accounts

- Replacing an account password asks for the current one. A signed-in
  session alone could change it before, so a stolen session or an unlocked
  device was enough to lock the owner out. Forgetting it is still covered by
  the reset with a code sent to the account's address.
- A new password, chosen or reset, signs out every other device at once, and
  the address on file receives a short notice that the password changed.
- The login code is no longer in the email's subject, which a locked phone
  shows in its notification; it is in the body only.
- Signing in with a name that does not exist takes as long as a wrong
  password, instead of a slower check that told the two apart.
- A promo code's last place goes to one account only, even when two redeem
  it at the same moment.

### Server

- Suspending or reactivating an account and changing its credits ask for the
  admin password again, like deletion already did.
- Deleting an account from the admin console also removes its address,
  invoices and reminders by name, instead of counting on the database to
  cascade.
- The public routes that need no session (collateral relay, Explorer entity
  lookup, uptime alert) are limited per network and per hour, and every
  per-IP limit counts an IPv6 client by its /64, the block one connection
  owns, rather than by address.
- The admin console opens on a Launch tab: the last 24 hours against the 24
  before for installations, AI requests and accounts, hourly curves over 48
  hours, errors, app events today and yesterday, downloads and site visits.
- A Downloads tab counts every installer of Alice and the wallet by
  platform and version, from GitHub's public counters, and what is new since
  the last day the console was opened.
- A Site tab shows alicebtc.com's visits, pages, countries and referrers from
  Cloudflare Web Analytics, which the site already uses without cookies. It
  needs a read-only Cloudflare token in the local `.dev.vars`, never deployed.

### Site

- A contact icon in the top bar, on every screen, opens the list of ways to
  reach Alice: contact@alicebtc.com, @askAliceBTC on X and Alice on Nostr,
  and a Report section that opens a new issue on the public repository,
  with the same warning as the app's Report form that GitHub issues are
  public. It opens on hover with a mouse and on a tap on a phone, like the
  Download menu.
- The footer has the same links on a Contact line, with their icons.
  The site's Organization data lists the same address and profiles, with
  the source code.

## 0.2.6

Desktop installers for macOS, Windows and Linux ship with this release.

This release repairs the download of local models in Alice Desktop. It adds
no feature.

### Desktop

- A local model is downloaded by the app itself, straight into its models
  folder, and the settings page only asks how far it is. Until 0.2.5 the
  page fetched the file and handed the bytes to the app over its message
  bridge, which on macOS silently lost a message after a few hundred
  megabytes: the bar froze at 4 %, 6 % or 16 % with no error. A download that
  receives nothing for 60 seconds, or is offered a file of another size than
  the catalog's, now fails with a message.
- The window no longer freezes while a model downloads: until 0.2.5 the page
  re-rendered on every network piece and decoded megabytes of JSON on the
  window's own thread, and Settings could not even be closed.
- Once the whole file is on disk, the row says `Verifying the file...` with
  its own bar while the SHA-256 is computed (seconds in the published app),
  instead of a full bar still labelled `Downloading...`.
- A model that finishes downloading while the chat is already on Local is
  picked up at once: the chat reloads its engine with the new model instead
  of keeping "No local model is installed yet" (or the previous model) until
  the app was restarted.
- Under a model's name, `6 GB` is labelled `RAM 6 GB`: it is the memory the
  model needs, and it read as a second file size next to the 2.7 GB download.
- A local model starts only from the app's models folder, and a downloaded
  model is accepted only if its exact size and SHA-256 match the catalog;
  a mismatch deletes the file. Models listed without a pinned revision are
  no longer downloaded. Reported in alice-btc/alice#7.

## 0.2.5

Desktop installers for macOS, Windows and Linux ship with this release.

Alice Wallet, the self-custodial wallet (Android app and web wallet), now
lives in its own repository, alice-btc/alice-wallet, and is released on its
own from there. This repository ships no Android build any more; the last
Android build published here is `0.2.0`. The Playground, the practice wallet
inside Alice App, is unchanged.

This release repairs what 0.2.4 left wrong. It adds no feature.

### Your data in Alice App on the web

- A conversation, a memory or a profile the app cannot read any more (a
  damaged record, or one written while another tab was saving) is kept as it
  is instead of being written over, and a notice says so. The local
  encryption key is created once, even with several tabs open, and an
  existing key is never replaced. Without a working key, new conversations
  stay in memory for the session and are never written in clear.
- Erasing is explicit and complete: "Delete all" also removes conversations
  the list could not show, the memory panel waits for the erase before it
  refreshes, and a failed erase says so instead of looking done.
- Conversations, memory and settings written by 0.2.4 open unchanged after
  the update.

### Security on the web

- Alice App enforces its Content Security Policy: each page allows only its
  own scripts, and the semantic search engine loads from the app instead of
  a blob. The bitcoin price feed is no longer reported as a violation.
- Next.js moves to 15.5.28.

### What Alice remembers about you

- The forbidden-subject filter no longer misses accented, capitalised or
  derived forms: "santé", "SANTÉ", "politics", "political", "diagnosis",
  "sexualité", "clés privées", "mots de passe" and "transactions" are refused
  like the words already on the list, and "politique monétaire", "politique
  de frais" or "soldes" stay allowed. The sentence that warned about this
  limit leaves the website's memory page and both memory documents.

### Reporting a problem

- A report opens a prefilled issue on the public `alice-btc/alice`
  repository, from Alice App (Account > Report an issue) and from the wallet
  (Settings > Report a problem). Copy still works, and email now goes to
  `support@alicebtc.com`. Nothing is sent until you choose one of them.
- Choosing GitHub first opens a short warning: a GitHub issue is public,
  readable by anyone, so remove anything personal or send the report by
  email instead, which stays private.
- A report names the page it comes from (Explorer, Learn…) instead of copying
  its full address, which could carry an identifier.

### Explorer

- In Ask Alice, the details of an attachment wrap long transaction ids and
  addresses, with nothing added to them, and scroll inside their own box.
  The message field, the attachment and Close stay reachable on a large
  transaction, in a narrow panel or a low window.

### Learn in French

- Section titles, the time under a chat message and the welcome dialog's
  buttons fit the French interface on a phone. The response language reads
  FRANÇAIS.
- Course videos play again. The YouTube player refused to start since 0.2.4
  (error 153) because the app sends no referrer; the video frame alone now
  tells YouTube it is embedded by Alice, its origin only, never the page or
  the course.

### Sharing a link

- A link to Alice App shows a preview card again on X, Telegram, Nostr and
  other apps: one per section (Chat, Explorer, Learn, Playground), in the
  website's style, each with its sidebar icon. A card names the section only,
  never a transaction, an address or a course.

### Privacy wording

- The website and the app's privacy page say what Local and Private Cloud
  protect, and no more: Local runs the model on your device while other
  features use the network; Private Cloud is end-to-end encrypted, Alice
  checks the enclave hardware before every message, and the exact program
  inside cannot be verified until Venice publishes its reference values.
  The GPU attestation is not checked yet. The privacy page also lists
  the Instructions for Alice and Learn progress kept unencrypted, the price
  feed and the Playground faucet requests.
- The comparison with ChatGPT no longer announces a future wallet that would
  let Alice make payments on your behalf.

### For contributors

- CI compares the Content Security Policies of the web hosts and the desktop
  app, and builds Alice App with its client boundary checked.
  `scripts/csp-crawl` walks the surfaces with a violation listener.
- `GET /app-version` on the Worker also returns `wallet`, the released
  Alice Wallet version, for the wallet's own update banner.

## 0.2.4

Desktop installers for macOS, Windows and Linux ship with this release. The
Android build is unchanged and stays on `0.2.0`.

This release closes the security and accessibility review of 30 September.

### Security

- The three public hosts send security headers: no framing by another site,
  no content sniffing, no referrer, and a permissions policy that keeps the
  camera for the QR scanners and nothing else. A Content Security Policy
  ships in report-only mode first and will be enforced once its reports come
  back clean.
- The web wallet asks for a PIN before it opens. In a browser the PIN is what
  encrypts the recovery phrase; without one it was encrypted with a constant
  anyone could read in the public bundle. A wallet created earlier picks its
  PIN once at its next visit, and the lock cannot be turned off on the web.
  Android keeps its optional PIN, since the phone's secure store holds the
  seed there. The welcome screen says where the keys live.
- Private Cloud, on the server: a plan is credited only when BTCPay reports
  the invoice settled in full, never on a single confirmed payment, which
  could be partial or late. New free installations are capped at five per
  network and per day, and the refusal says what to do. The production
  origin list no longer admits local development servers.

### Accessibility

- Wallet: the light theme's blue reads at full contrast; text fields keep
  their focus ring on the web; every back arrow, the settings gear, the send
  button, the balance and the QR code have a name; the address, amount, chat
  and recovery-phrase fields have a label; payment status changes are
  announced; the pixel fills and typewriters stop when the system asks for
  reduced motion.
- Alice App: a Learn course declares its own language, and the plan checkout
  announces a confirmed payment.
- Website: a "Skip to content" link, download panels that read as what they
  are, and a download notice that takes the focus and gives it back.

## 0.2.3

Desktop installers for macOS, Windows and Linux ship with this release. The
Android build is unchanged and stays on `0.2.0`.

### Explorer: three off-chain layers next to Bitcoin and Liquid

- Bark joins the Explorer: its server, the rounds as they happen, addresses,
  and your own coin by its id or an export of the wallet. The rounds found
  on-chain are marked on the blocks and the ribbon, and a coin's exit tree is
  drawn as a funnel, in Bark's own words.
- Arkade gains addresses, a fresher commitment feed, and the exit tree of a
  VTXO read from the operator's indexer, in Arkade's words. A view says when
  the Arkade tools failed to load instead of staying empty.
- Spark is read from its three operators, with no account: transfers, leaves
  and their trees, the deposit on Bitcoin, and a live feed through Sparkscan.
  The deposits and exits this browser has learnt about are labelled on their
  Bitcoin transactions, never on blocks, since a Spark deposit can land in any
  block.
- Every off-chain page follows the Bitcoin pages' layout and one accent rule:
  a full badge and a coloured edge in the layer's colour on each header.

### The Arkade and Bark feeds start from the present

- A visit no longer walks the operator's wallet forward from a seed written in
  the code. Bark asks its server for the latest round and shows it first; both
  networks then read the newest settlement Alice's own server has found, one
  anonymous request the data-source note names, and fill in the recent history
  under it: ten commitments on Arkade, a day of rounds on Bark. The seeds only
  serve when nothing at all is known.
- While the walk catches up with the chain, the ribbon's jump arrow and the
  head of the feed show a ring with a line of explanation; once there, the
  feed says it is up to date and at which block. Passes chain until the tip is
  reached instead of waiting for the next tick. Older history loads on
  request, twenty-five at a time, with a closing line when nothing older can
  be found.
- A coin's page carries a button to its commitment transaction (Arkade) or
  its round (Bark), the virtual transaction page too, on its own line under
  the identifier.
- The Bark round oracle is corrected: a round's tree root can sit at another
  output than the first, and the tree transactions a holder broadcasts to
  exit are not rounds, whatever their policy. The rounds the earlier rule had
  recorded are forgotten and found again.
- Alice's Worker walks the Arkade operator's wallet every ten minutes and
  keeps Second's latest round, and publishes both at `/explorer/anchors`.

### Alice knows the layers

- Fifteen concept notes on Spark and Ark, in English and French, enter the
  Explorer corpus: what a leaf, a tree, a transfer, an exit and its timelocks,
  an operator, a VTXO, a round and a commitment are, and where the privacy
  limits lie.
- Each off-chain page tells Alice what it shows. By default she receives a
  description free of identifiers (layer, kind of page, counts, magnitude and
  age buckets); the identified mode, switched by the eye next to the send
  button, adds the identifiers you choose to share. The composer takes two
  lines without an attachment, three with one.

### Local data rests encrypted on every device

- On desktop, a key held in the system keychain; on the web, a non-extractable
  AES-256-GCM key the browser keeps in IndexedDB. Conversations, memory and
  the learning profile were already encrypted on desktop; they now are on the
  web too, and the application's own stores join them: Explorer tabs and
  session links, saved wallets, custom nodes, the Arkade, Bark and Spark
  registries, Ask Alice questions, and the whole Playground, recovery phrase
  included. Values found in clear are migrated silently.
- No PIN yet: this protects data at rest (backups, a copied profile folder, an
  unencrypted disk, another user), not against someone using the unlocked
  session. The design is in `docs/security/local-chat-encryption.md`.
- The notice that announced a block or transaction opened from a link is gone.

### Alice answers from a reviewed corpus

- A curated corpus of 403 French fiches, 200 primary and 203 secondary,
  replaces the imported notes and the documentation pack in retrieval. Each
  fiche carries a short answer, an explanation and its limits, with aliases
  and questions for search; the corpus covers Bitcoin and Alice App (local
  data, Playground, Private Cloud, memory), and is reviewed editorially, as
  `docs/CURATED_CORPUS.md` describes and bounds.
- Retrieval starts from the primary fiches and opens a secondary one when the
  question calls for it, from topic evidence and parent links; an introductory
  question stays on its primary fiche, a comparison keeps both subjects, and
  the diagnostics say which fiche was chosen, at which tier, and why.
- Both semantic indexes are rebuilt from that corpus, 403 vectors each. The
  earlier Obsidian and documentation corpora stay in the repository for
  traceability and are no longer searched.

### Desktop

- The packaged app may now reach the Bark server, the three Spark operators
  and Sparkscan, so the new Explorer pages work in the installed app as they
  do in a browser. A node you configure yourself is still refused by that
  list, as in 0.2.1.
- The private application previews build on demand only.

### Website and documentation

- The privacy page says what Alice remembers and how it is stored; the memory
  docs and the data and recovery page describe the encrypted stores.
- The hero tagline reads "Private AI · Open source".
- The AI/wallet boundary check runs in CI.

## 0.2.2

Desktop installers for macOS, Windows and Linux ship with this release. The
Android build is unchanged and stays on `0.2.0`.

### Application and website

- A pixel rabbit, restrained controls, theme-aware assets and clearer chat,
  Explorer, Learn and settings layouts.
- Distinct model and reasoning labels in the application and website preview.
- Refreshed product screenshots and pixel icons, with the original scrolling
  website tour, dark grid and display typography preserved.
- A separate experimental section for Alice Wallet, outside the main download
  menus and product tour. The mobile wallet interface is unchanged.
- The app learns from the proxy which version is current and shows a
  notice, with the release details, when a newer one exists.

### Chat: the right note reaches the model, and the answer keeps to it

- The statement that precedes a question now reaches retrieval, so "I have a
  2-of-3 setup, can I lose a key?" is searched with the setup and not only
  with the question. More question openings are recognised in French and
  English, seven notes gained the keywords readers actually use, and product
  documentation no longer crowds out a note on a shared common word. On the
  acceptance set, the expected note is in the model's context for 40 of 40
  questions, against 25 before.
- For the Ark, multisig and replace-by-fee notes, the model receives the
  points an answer must state and the claims it must not make, and the
  answer is checked afterwards. On the acceptance set with the local 9B
  model, critical errors go from 6 to 0.
- Questions about present network values (fees, height, prices) receive a
  deterministic reply that says Alice has no live data and points to the
  wallet's own estimate, instead of a figure the model would invent.
- The local model catalog is reduced to Qwen3.5 2B, 4B and 9B, with an import
  from Hugging Face; the earlier models remain usable from a legacy list.
- Method, sets and figures: [docs/RAG_EVALUATION.md](docs/RAG_EVALUATION.md).

### What Alice remembers about you

- Memory is laid out in fields by category, with Setup and Experience added
  and a category for notes you ask Alice to keep. Each fact can be edited or
  deleted on its own, a whole category can be cleared or paused, and one
  action forgets everything.
- Amounts, balances and exchange account names are refused on capture, in
  addition to addresses, keys and recovery words. There is no longer a cap on
  the number of facts; in the phone code, which reaches users with the next
  Android build, memory beyond what the keychain holds moves to an encrypted
  file.
- "Remember that ..." keeps the sentence as you wrote it, only on an explicit
  request.
- The website gains a page that explains what is kept, where, and how to
  remove it, and the repository carries the same account in
  [docs/ALICE_USER_MEMORY.md](docs/ALICE_USER_MEMORY.md).

### Private Cloud billing

- The proxy counted the bytes of the encrypted stream as output, about a
  hundred times the text, so a paid month ran out after a few dozen answers.
  Output now has its own ratio and plan budgets follow the catalog.

### Dependencies

- The audit baseline is renewed and the advisories published on 2026-10-06
  are moved past; web client boundary checks carried over from the validated
  application work.

## 0.2.1

A desktop repair release. The Android build is unchanged and stays on `0.2.0`.

### Desktop: the installed app can reach the servers it needs

The packaged app declares which servers it is allowed to contact, and that
list had never grown past the AI services. Every chain endpoint was missing,
so the Explorer returned nothing at all in the installed app while the same
code worked in a browser, and Learn cover art never loaded. The list now
carries the Explorer's default nodes and their fallbacks, the Arkade
endpoints, the packs CDN, and Intel's certificate services, which the Private
Cloud verification uses as a fallback.

A node a user configures themselves is still refused by that list. Moving
these requests outside the webview, which also opens the way to Tor, is the
next step rather than a wider list.

### Private Cloud: a refusal says which refusal

"Security verification is temporarily unavailable" covered three different
failures, and two of them never repair themselves, so the advice to wait was
false. They are now distinguished: a service in difficulty, a request that
never completed, and an answer that could not be used. Each carries one line
of technical cause under the message, drawn from a closed vocabulary that can
never include a server message, a prompt, a response or a key, so a report can
name the cause instead of the symptom.

### macOS install instructions

The download notice and the beta guide described the right-click Open
shortcut, which macOS 15 removed. They now describe the dialog people actually
see and the Privacy & Security path that grants the permission.

## 0.2.0

The beta grows from a chat with a wallet into a companion with rooms. This
entry covers the full span since `0.1.0`.

### Alice App: three new sections

- **Explorer.** Blocks, transactions, addresses and xpubs inside the app,
  explained by Alice. Entity attribution is served from its own database.
- **Learn.** The Plan ₿ Network educational corpus (CC BY-SA 4.0): courses
  with quizzes, tutorials, per-language packs. English and French ship in the
  app; 27 more languages download on demand from the public packs repository,
  pinned to one corpus commit. Course anchors link Learn and Explorer in both
  directions; a deterministic suggestion card under chat answers proposes the
  matching course; an Ask Alice panel reads the open course as context; Alice
  never rewrites the teaching text.
- **Playground** (formerly "test wallet", old links redirect). A practice
  wallet on Mutinynet with real wallet mechanics: backup flow identical to
  mobile, Sparrow-style single-view send with the transaction dissected,
  BIP21 receive with payment detection, coin control. An Alice faucet grants
  2,100 practice sats once per installation, no IP-based identity, IP is
  only day-bucketed for rate limiting. Bridges from chat, Learn and the
  resources block lead into it.

### Chat and retrieval

- **Semantic search left "Android only".** Retrieval is now hybrid (keyword +
  on-device embedding model) on Android, Alice App web and Desktop. The model
  downloads on the first question, never on a data-saving connection; a
  Settings section shows its state and can force or remove it. The desktop
  installer bundles model and ONNX runtime (~164 MB), so an installed build
  asks neither Hugging Face nor jsDelivr. The Expo PWA stays lexical: its
  bundler still cannot load the ONNX runtime (re-verified, error documented).
- Alice actually reuses what her memory retains, and finishing a course
  teaches the learning profile.
- A "To go further" resources block under answers; sidebar sections for the
  app's rooms; settings reorganized into tabs; a typography and color pass
  (pixel floor, palette-driven accents, contrast guard).

### Accounts, plans and payments

- Email is now account data, stored encrypted; sign-in back by email code;
  passwords actually gate the account; a session can no longer turn into
  another user's. Usernames are picked in three visible parts and can be
  changed later.
- Paid Cloud plan purchasable through BTCPay (prices pinned in satoshis, the
  euro shown as a landmark, not a price), with a persistent pending state. An
  exhausted quota reads as an offer, not an outage. The free path meters
  bytes without billing anything.
- Cloud+ and Deep Research were pulled from sale rather than left dormant.

### Wallet

- MAX sends everything, fees taken from the coins; each output is charged at
  its real size; reset is blocked while a swap is still recoverable.
- Lightning swaps work again: Satora now requires its client to declare the
  server API it was built for, and the SDK the wallet shipped with predated
  that rule. Updated to the current SDK, so 0.1.0 users should update.
- Paying a Lightning invoice quotes the exact routing fee for that invoice
  (Satora's dedicated endpoint) instead of an average, so the amount you
  confirm is the amount the swap charges: the recipient gets the invoice
  amount, fees ride on top and are shown before sending. Satora's own
  refusals are now shown as such ("invoices must expire within 24 hours",
  "this invoice already has a swap") instead of a false "server unreachable",
  and the wallet checks the invoice lifetime before asking. Only refusals
  the wallet recognises are shown in Satora's terms; any other server
  message is replaced by a generic refusal with its status and kept, without
  URLs, in the diagnostic log.
- Creating a wallet shows the welcome at once; connecting to the Ark server
  happens in the background, as Arkade Wallet does, instead of holding the
  screen until the server answers.
- A new wallet is created offline. Its keys never needed the network; only
  the balance does, and the home screen says "offline" at once instead of
  waiting out a connection timeout, then fetches it once a connection exists.
- Creating a wallet after an abandoned import now really creates a new
  wallet. The app could keep serving the previously imported wallet while
  the stored phrase, and the backup screen, already held the new one; every
  new phrase now starts from nothing (backend, local index, swap records).
  A connection still in progress when the phrase changes is discarded on
  arrival rather than stored, so the window between "Create" and the
  server's answer cannot bring the previous wallet back either.
- Recovery scans the SDK's default window of 20 unused addresses first,
  shows the wallet as soon as something is found, and still runs the deep
  window of 100 in the background (at once, and blocking, when nothing
  turned up), so funds beyond a wider gap are never missed. It retries its
  network scan when some lookups fail instead of stopping at "discovery
  handlers failed", says so plainly if it still cannot finish, and the
  screen says "restoring" rather than "generating keys" while it runs. An
  imported wallet counts as onboarded only once its recovery finished. A
  deep pass that did not finish is remembered: the home screen shows
  "Recovery scan incomplete" with a retry, the scan resumes at the next
  launch, and the address page only says "rescan complete" once the deep
  window really ran. The welcome screen no longer jumps to the wallet on
  its own; the Start button is the only way forward.
- The welcome after key creation (Alice, her message, the Start button) now
  actually appears on Android. A layout signal could stop the fill animation
  mid-way and leave the screen blue with the welcome at opacity zero.
- "View in explorer" opens Alice Explorer, Bitcoin or Arkade view, instead
  of a third-party site. Alice Explorer accepts a subject in its URL for
  that: `/explorer?tx=<id>&network=<mainnet|arkade|mutinynet>`, also
  `address=`, `block=`, `xpub=`.
- Secondary texts (receive hints, model descriptions, theme hints, address
  buttons, coin-control counters) move to the body font, readable at a
  glance; the pixel font is kept for titles and actions.
- Less work on the JS thread, so taps answer faster: the home screen
  refreshes in one sequential pass every 30 s instead of three racing chains
  every 10 s, the history only polls while a transaction is still moving,
  and the knowledge corpus (2 000+ chunks) loads after the first
  interactions rather than at launch. The first question to Alice pays that
  load once. Offline, the home screen stops polling and refreshes the moment
  the connection is back; the Send scanner stops when another screen covers
  it.

### Site

- alicebtc.com carries the app in the page: interactive hero chat, a guided
  tour that mirrors the real UI (phone captures on mobile, with a wallet
  step), two-button nav (Open Alice / Download) with both products' platforms,
  a pricing page for the AI only, and Trust, Privacy and vs-ChatGPT pages
  that state only what is true.

### Worker and security

- Closed an installation-id replay that could drain the Venice balance, and
  the attestation gate no longer exposes its key to hammering.
- The public-snapshot script refuses to publish a tree naming local tooling,
  strips design-tool metadata from PNGs, and records which private commit
  produced each public branch.
- The npm-audit gate carries four reviewed fast-uri advisories, all on the
  same prebuild-only chain.

### Breaking for 0.1.0 testers: a new Android application id

The wallet's Android identifier moves from the maintainer's company name to
`com.alicebtc.wallet`. Android treats this as a different app: 0.2.0 does
not install over 0.1.0. Write down your recovery phrase in 0.1.0, install
0.2.0, import the phrase, then uninstall 0.1.0. Nothing on the server side
depends on the identifier.

### Known limits, updated

- Paying a Lightning invoice through Satora requires an invoice that expires
  within 24 hours. Some wallets (Spark-based ones among them) issue longer
  invoices by default; ask the recipient for a shorter one. An invoice issued
  by Satora itself cannot be paid through Satora.

- The `0.1.0` limit "semantic RAG validated on Android only" is superseded as
  described above; result quality remains validated on Android, the web
  engine runs the same model over the same index.
- Private Cloud attestation and single-shot E2EE turns: unchanged, see
  `0.0.1`.

## 0.1.0

First closed-beta release built from a validated public source tree.

- All official Web deployments now build from the public `alice` repository.
- Android release builds use `https://proxy.alicebtc.com` and contain no
  provider API key or bundled local language model.
- Alice Memory questions use local memories without triggering unrelated
  Bitcoin retrieval or pedagogical context.
- Labeled raw hexadecimal private keys are blocked before any model call,
  while explicitly labeled transaction IDs remain accepted.
- The Desktop production build uses the official Private Cloud proxy by
  default and still allows an explicit development override.
- Local benchmark diagnostics expose only numeric timing and throughput
  metrics, with no conversation or wallet content.
- The local admin allowlist is loaded from a quoted `.dev.vars` value so the
  username separator cannot be interpreted as a dotenv comment.
- The `v0.0.1` public snapshot has a completed OpenTimestamps proof anchored
  in Bitcoin block `961792`.

## 0.0.1

First frozen and publicly tagged baseline. The distributable Android build was
still produced before the public snapshot; `0.1.0` is the first release that
closes that provenance gap.

### All surfaces

- **Sign-in reduced to one path.** Email with a verification code, a username
  and a password. Passkey, Nostr and account-key sign-in were removed: 12
  Worker routes, 9 client modules, 4127 lines. Checked against production
  first: two identities, both email, zero passkey credentials.
- **21 free Private Cloud requests without an account**, and the remaining
  balance is now visible. It was fetched and then discarded for anonymous
  users, who are precisely the ones spending it.
- **Learning profile** (`What Alice knows about you`) on every surface, stored
  only on the device, holding counters and never any text from a question.
- **Privacy page** rewritten to describe what Alice actually stores.
- **No model ships with any app.** A local model is downloaded from Settings
  when the user chooses one. Removed a 769 MB GGUF from the Desktop bundle and
  another from every EAS upload.

### Wallet (Android)

- Private Cloud no longer answers every past question at once, in whichever
  language most of them were in. Venice does not encrypt assistant turns, so
  Alice drops them; the model now knows those replies existed.
- The keyboard no longer covers the message field and the send button.
- The microphone permission is gone. Alice has no audio dependency and records
  nothing; the permission only made the store listing claim otherwise.
- Wallet work carried in this baseline: coin control, address archives,
  delegated renewal, emergency exit, swap registry, VTXO lifecycle controls,
  live Arkade VTXO minimum, individually masked recovery words.

### Alice Web and Desktop

- Desktop opens on Private Cloud like every other surface. It used to open on
  the local backend with no model installed, wait fifteen seconds for a server
  nobody had started, then report a bundled model that no longer existed.
- Desktop keeps its downloadable local model, from Settings.
- Local AI stays unavailable on Alice Web: the browser cannot run it.

### Worker and admin console

- **Privacy-first admin console**, absent from production by construction:
  it runs only when `ADMIN_CONSOLE_ENABLED` is set, which it is not in
  production. Launched locally from a Desktop shortcut.
- Aggregate analytics only: day-resolution counters keyed by event, platform
  and app version. No per-user event stream, no durable IP record, no
  third-party analytics service.
- The console can never show a conversation, a seed, a wallet key, an account
  private key, a password or the content of an AI request. The internal user id
  is never exposed; the public username is the support identifier.
- Admin access is enforced by the server on all 18 routes, proven by
  adversarial tests from three attacker positions.
- Promo codes are admin-side only during the beta. Testers are given requests
  by adjusting credits on their account, which is recorded in the audit log.

### Database

Migrations `0001` through `0009` are applied to production D1. The release adds
no pending migration: every table the code reads exists, and none is orphaned.
Deploying the Worker for this baseline needs no migration step.

### Known limits

- Private Cloud attestation is at `attested-unpinned`, not `full`. Venice has
  not published the reference measurements. Full E2EE is required before any
  opening beyond the closed beta.
- Private Cloud remembers what was asked, not what Alice answered. A follow-up
  like "expand on that" stays approximate. Carrying an encrypted summary of the
  conversation is the real fix and is post-beta.
- Semantic RAG is validated on Android. Alice Web, the installable PWA and
  Desktop use lexical retrieval over the same knowledge base in this beta.
- `npm audit` reports transitive vulnerabilities in the frozen build stack,
  none critical. The reviewed baseline, per-chain exposure analysis and
  expiry date are maintained in `docs/security/dependency-audit.md`.
