# What Alice remembers about the user

> **Alice can get this wrong.** She may misread a sentence and keep something she should not have kept, and the filters described here can miss a case they did not anticipate. They are a safeguard, not a guarantee. Do not fully trust what is shown as remembered or as forgotten. The real protection is to give Alice only the minimum your question needs, and never an address, a key, a recovery phrase, an amount or anything that identifies you. What you type in the conversation remains your responsibility.

This page describes what the code does today (package `alice-ai`, the "What Alice remembers" screens on web and desktop), as shipped in Alice App 0.2.7 on the web and on desktop. Decisions that are taken but not shipped are listed at the end under [Coming](#coming-not-shipped) and nowhere else. The plain-language version of this page is on the website at `/memory/`.

## Overview

Two separate memories live on the device. The **personal memory** holds short facts the user stated about themselves, in eight categories, and the sentences the user explicitly asked Alice to keep, in a ninth. The **learning profile** holds how familiar the user is with fourteen Bitcoin concepts. Neither is stored off the device, and neither is a source of truth for Alice: they only adjust how she answers.

```mermaid
flowchart LR
  M["User message"] --> P["Fixed patterns (code)\n'I prefer', 'I am working on',\n'my goal is', 2 at most"]
  M --> Q["Explicit request (code)\n'remember that', 'retiens que',\nkept word for word"]
  M --> L["The model proposes 0 to 3 facts\nin a hidden block after its answer,\nnever inferred"]
  P --> F["Five filters (code)\n1. seed and key detector\n2. raw values\n3. amounts\n4. exchange accounts\n5. forbidden subjects"]
  Q --> F
  L --> F
  F -->|refused| R["Nothing is written;\nan explicit request or an edit\nis told why"]
  F -->|accepted| S["Memory on the device\nno cap, 160 characters, 9 categories\nlocal storage, encrypted by the app"]
  S --> N["Next conversation\npreferences, constraints, requested notes first,\nthe rest ranked by overlap with the message,\n10 at most, dated, the conversation comes first"]
  S --> G["'What Alice remembers' screen\nwarning, switch, one field per category,\nEdit and Delete, Pause and Delete all here,\nForget per concept, Forget everything"]
```

The learning profile is a separate store: fourteen concepts, and per concept a familiarity state (`unseen`, `introduced`, `exploring`, `familiar`), signal counts, dates rounded to the day, and the level declared by the user, which the model must respect.

## 1. What is captured

Three paths produce candidates for the personal memory. All of them go through the same filters (section 2) before anything is written. The categories, in the display order of `ALICE_MEMORY_CATEGORIES` (`packages/alice-ai/src/alice-memory-core.ts`), are `preference`, `setup`, `experience`, `goal`, `project`, `interest`, `constraint`, `background` and `requested-note`.

- **Fixed patterns in the code**, `explicitMemoryCandidates` in `packages/alice-ai/src/turn-planner.ts`. Sentence shapes matched on the message, with no model involved: "I prefer concise / short / brief answers" or "I prefer detailed / in depth / long answers" (a `preference`), "I am building…", "I'm working on…" (a `project`), "my goal is…", "I want to…", "I would like to…" (a `goal`), and their French forms. At most two facts per message come out of this path. There is no fixed pattern for `setup` or `experience` yet.
- **Explicit request to remember**, `requestedNoteInMessage` in `turn-planner.ts`. "retiens que", "retenez que", "souviens-toi que", "rappelle-toi que", "retiens ceci :", "peux-tu retenir…", "remember that", "remember this:", "please remember", "can you remember…", optionally after "Alice,", "ok" or "please". The first sentence after the trigger is kept as written, minus quotes and final punctuation, in the `requested-note` category. It must contain a first-person word (I, my, me, je, mon, ma, mes, j', m'), and a question inside it cancels the path: "Remember that the halving happens every four years" stays an ordinary turn. "Note that" and "keep in mind that" are not triggers. When the request is the whole message, the turn is answered without retrieval or model (`turn-engine.ts`): a refused sentence gets `aliceMemoryRefusalMessage`, which names what the filter caught; an accepted one gets `directRequestedNoteResponse`, which says "Noted: …" ("Retenu : …") only when the write succeeded and the note is in the store, and otherwise says that memory is off, that Requested notes are paused, or that the save failed. When the request comes with a question, the note rides along as an explicit candidate, and a refused note is dropped without a message. A learning declaration inside the note ("souviens-toi que je débute avec Lightning") still updates the learning profile.
- **The model's proposal.** When memory is enabled, the prompt carries `ALICE_MEMORY_CAPTURE_INSTRUCTION` (`alice-memory-core.ts`): after the visible answer, append exactly one `<alice_memory>{"items":[…]}</alice_memory>` block with zero to three items, each with a `category` among the eight other than `requested-note` and a short `text`, with one kept and one refused example for `setup` and for `experience`. The instruction forbids inferring identity, personality, beliefs, expertise or circumstances, and forbids saving message text, wallet data, financial activity, amounts in any unit, exchange or platform accounts, direct identifiers, location, health, politics, religion, sexuality, secrets, addresses, balances, transactions or credentials; what the user knows belongs to the learning profile, not here. `parseAliceMemoryResponse` reads the block, drops any `requested-note` item, keeps at most `MAX_CANDIDATES_PER_TURN = 3`, and strips the block before the answer is displayed; an incomplete block at the end of a stream is also removed.
- **Learning profile**, `packages/alice-ai/src/pedagogical-profile-core.ts`. The concepts a question touches count as signals (`inferPedagogicalConcepts`), and a declaration such as "I am comfortable with UTXOs" or "I am a beginner" sets a declared level (`declaredFamiliarityInMessage`). In Learn (`apps/app-web/src/components/LearnPanel.tsx`), reading a new chapter counts as a signal (`recordCourseStudy`), and finishing a course sets the level to `exploring` for a beginner course and `familiar` above, never lower than a level already declared (`recordCourseCompletion`). The fourteen concepts are `bitcoin-basics`, `bitcoin-cryptography`, `transactions-utxo`, `keys-self-custody`, `mining-proof-of-work`, `bitcoin-economics`, `bitcoin-game-theory`, `lightning-basics`, `lightning-routing`, `privacy`, `scaling-ark`, `scaling-covenants`, `sidechains`, `history-philosophy`.

Two guards act upstream of the patterns and the model, in `turn-planner.ts`:

- A message that asks for the balance, the history, a payment or a live network value is answered deterministically and produces no memory candidate (`explicitMemoryCandidates` is skipped when the turn is guarded, and the model is not called).
- A conditional clause ("if I run a node") is neither a personal statement nor a declared level.

## 2. How a fact is refused

Every candidate passes `aliceMemoryRefusalReason` in `alice-memory-core.ts`: through `isSafeCandidate` on capture and each time the store is read, and directly when a fact is edited. One refusal is enough and nothing is written. The checks run in this order, and the first match gives the reason (`AliceMemoryRefusalReason`): length (`too-short` under `MIN_TEXT_LENGTH = 3`, `too-long` over `MAX_TEXT_LENGTH = 160` characters, after whitespace is normalized), then five filters.

1. **Sensitive input detector** (`secret`), `detectSensitiveInput` in `packages/alice-ai/src/ai-sensitive-input.ts`: twelve or more consecutive words from the English BIP39 list (checked as runs of 12, 15, 18, 21 or 24 words, checksum not required), WIF private keys (`5…`, `K…`, `L…`), extended private keys (`xprv`, `yprv`, `zprv`, `tprv`, `uprv`, `vprv`), and a 64-hex string within 80 characters after the words "private key", "secret key" or "clé privée".
2. **Raw values**, `FORBIDDEN_RAW_VALUE`: email addresses (`identity`); bech32 Bitcoin addresses (`bc1`, `tb1`, `bcrt1`), legacy and script addresses (`1…`, `3…`, `m…`, `n…`, `2…`), Lightning invoices (`lnbc`, `lntb`, `lnbcrt`) and Nostr entities (`nsec1`, `npub1`, `note1`, `nevent1`, `nprofile1`) (`address`); extended keys of every family (`xpub`, `ypub`, `zpub`, `tpub`, `upub`, `vpub`, `xprv`, `yprv`, `zprv`, `tprv`, `uprv`, `vprv`) and 64-character hexadecimal strings with or without `0x` (`secret`); `name#1234` style identifiers, UUIDs and phone-number shaped digit runs (`identity`).
3. **Amounts** (`amount`), `AMOUNT_PATTERNS`: a number (digits, with space, dot, comma or apostrophe separators) or a number word in English or French ("two", "twenty", "half", "a few", "deux", "mille", "quelques"…), optionally followed by `k` or `m`, then a unit: `btc`, `xbt`, `bitcoin(s)`, `sat(s)`, `satoshi(s)`, `msat(s)`, `€`, `eur`, `euro(s)`, `$`, `usd`, `dollar(s)`, `£`, `gbp`, `pound(s)`, `chf`, `franc(s)`, `¥`, `yen`, `jpy`, `cad`, `aud`, `cny`, `yuan`, unless the unit is followed by a counted noun ("two bitcoin wallets", "five bitcoin books"); a currency symbol or code (`€`, `$`, `£`, `¥`, `eur`, `usd`, `gbp`, `chf`, `btc`, `xbt`) followed by a number; "half a bitcoin", "un demi-bitcoin". A bare number stays allowed: "since 2021", "2-of-3".
4. **Exchange accounts** (`exchange`), `isExchangeAccount`. Refused on sight: Binance, Kraken, Coinbase, Bitstamp, Bitfinex, Bitpanda, Bitvavo, Paymium, OKX, Bybit, KuCoin, Bitget, Bittrex, Poloniex, Huobi, HTX, MEXC, Gate.io, CEX.IO, eToro, Robinhood, Crypto.com, Upbit, Bithumb. Refused only with an account word in the same text (compte, account, wallet, portefeuille, kyc, exchange, plateforme, platform, login, identifiant, verified, vérifié): Gemini, Strike, River, Swan, Relai, Revolut, N26, PayPal, Cash App, Bull Bitcoin, Ledger Live.
5. **Forbidden subjects**, `FORBIDDEN_MEMORY`: seed phrase, recovery phrase, mnemonic, private key, clé privée, phrase de récupération, phrase secrète, xprv, nsec (`secret`); address, adresse, invoice, facture (`address`); txid, transaction, balance, solde, sat, sats (`activity`); email, e-mail, phone number, numéro de téléphone, user id, username, password, mot de passe, my name, name is, named, first name, last name, je m'appelle, mon nom, prénom, nom de famille (`identity`); health, medical, diagnosis, disease, maladie, malade, santé, sexual, religion, politics, politique (`sensitive`); lives at, habite à, habite au, home address, adresse personnelle, gps, coordinates, coordonnées (`location`). "Phone" alone is allowed, so "only has a phone, no computer" is a valid constraint. Before filters 4 and 5 run, the text is folded by `foldForMatching` (lower case, accents removed through NFD with the combining marks dropped, œ and æ spelled out, typographic apostrophes straightened), so "santé", "Santé", "SANTÉ", "clé privée", "habite à" and "vérifié" are caught whatever their accents or capitals. Plurals are matched ("transactions", "clés privées", "mots de passe", "addresses"), and the sensitive terms that have derivatives are stems: `politi` catches "politics", "political", "politique" and "politicien"; `diagnos` catches "diagnosis" and "diagnostic"; `sexual` catches "sexuality" and "sexualité"; `religi` catches "religious" and "religieux"; `health` catches "healthy"; `medica`, `medicin` and `medec` catch "medical", "médicament", "medication", "medicine" and "médecin"; `malade` and `maladie` take a plural. Chosen limits, each pinned by a test: "polite" is not politics, "Santa" is not "santé", "maladroit" is not "malade", the Medici are not medical, "lives in" is not a street address, the French "soldes" (sales) is not a balance (only the singular "solde" is), and "politique" followed by a Bitcoin policy word (monétaire, de frais, de mempool, de relais, de script, de confidentialité, de sécurité) is a policy, not politics, and is let through. A word the list does not contain still slips past; that is one of the cases the warning at the top is about.

On top of the filters: a mandatory category from the set of nine, deduplication on the normalized text (`normalizedKey`, which also folds "prefers…" and "working on…" variants), and no new fact in a paused category. There is no cap on the store: nothing is dropped to make room (`writeAliceCandidatesToStorage` keeps every item). Each write adds at most `MAX_CANDIDATES_PER_TURN = 3` facts.

`aliceMemoryRefusalMessage` turns a reason into one sentence, in English or French: "Alice cannot keep this sentence: it contains an amount. Addresses, keys, recovery phrases, amounts and identity details are never kept, even on request, because a filter can be wrong and none of it helps her answer better." It is shown in the chat for a standalone "remember that" request and under the edit field on the screen. Every other refusal is silent.

The learning profile has its own bound: it holds only the fourteen concept ids, per-concept counters and states, and day-rounded dates. It never stores message text.

## 3. Where it is stored

| Platform | Store | Key | Protection |
| --- | --- | --- | --- |
| Web, `app.alicebtc.com` | `window.localStorage`, `packages/alice-ai/src/alice-memory-storage.ts` | `alice_personal_memory_v1` | Browser storage of that origin, on that device, encrypted by the app (AES-256-GCM, context string `alice_personal_memory_v1`) under a non-extractable WebCrypto key the browser keeps in IndexedDB (`alice-local-cipher`), see `packages/alice-ai/src/local-cipher.ts`; encrypted values carry the `v1:` prefix, a value written in clear by an earlier release is read and re-encrypted on its next write |
| Desktop, Alice App 0.2.7 (Tauri) | Same `localStorage` key | `alice_personal_memory_v1` | Value encrypted by the app through `chat_storage_encrypt` and read back through `chat_storage_decrypt` (`apps/app-desktop/src-tauri/src/keychain_storage.rs`): AES-256-GCM with the context string `alice_personal_memory_v1`, key held in the operating-system keychain; encrypted values carry the `v1:` prefix |
| Learning profile | Same stores, `pedagogical-profile-storage.ts` | `alice_learning_profile_v3` | Same protection as the memory on each platform |
| Server | Nothing | | No sync, no export to the account. See below for what travels with a Private Cloud message |

The stored value is format `version: 2` (`enabled`, `items`, `pausedCategories`); format 1 is still read, and a stored item that no longer passes the filters is skipped on read and leaves the store at the next write.

When the user chats through Private Cloud, the memory block of section 4 (ten facts at most) and the learning profile hints travel inside the encrypted body of the turn, with the message (`turn-engine.ts`, the comment above the `memoryContext` call). The proxy relays that body without being able to decrypt it. Alice verifies the enclave hardware before every message, but cannot yet verify which software runs inside it: the reachable assurance level is "attested-unpinned", explained on the website at `/trust/`. In Local mode the memory stays on the device: it is never sent with the messages. With a custom server the user configured, the same context goes to that server with the message.

## 4. How Alice uses it, and does not

At every turn, `turn-engine.ts` adds the output of `aliceMemoryContext` (`alice-memory-core.ts`) to the generation context, on every backend. The block is headed "Personal memory: short facts the user stated in earlier conversations on this device, each with the day it was noted. Use one only when it helps. What the user says in the current conversation always comes first: never present a remembered fact as something said in this conversation, and never ask the user to choose between a memory and what they just said." Each line carries the day it was last updated: `- (noted 2026-10-29) …`. Selection:

- `preference`, `constraint` and `requested-note` items come first (`ALWAYS_RELEVANT`), newest first.
- `setup`, `experience`, `goal`, `project`, `interest` and `background` items are scored by overlap of content words (four letters or more, accents stripped) with the current message; the items that overlap come next, best score first, and any seats left go to the newest of the rest.
- `MEMORY_CONTEXT_ITEMS = 10` items at most, however many are stored.

The system prompt carries `ALICE_MEMORY_PROFILE_RULES` (`packages/alice-content/src/prompts.ts`): the personal memory may hold only short facts the user stated (the categories above, plus notes asked for in so many words) and never raw message text, financial activity, amounts, exchange accounts, identifiers, precise location, health, politics, religion, sexuality, wallet data or credentials; the learning profile adapts only vocabulary, prerequisites, examples and depth, and is never a source of facts or a substitute for retrieved knowledge; declared levels are authoritative; profile data stays separate from wallet data. `ALICE_PAYMENT_AUTHORITY_RULES`, in the same prompt, keep the wallet code as the only authority for payment details and outcomes. These are prompt rules, enforced by the model's compliance. The filters of section 2 are enforced by code. The warning at the top of this page is about that difference.

## 5. See, edit and erase

Screen "What Alice remembers": `apps/app-web/src/components/settings/AliceMemoryPanel.tsx` (reached from Settings, AI tab, "Alice memory", and mounted by the `/what-alice-knows/` route). From top to bottom:

- The warning `ALICE_MEMORY_WARNING`: "Alice can get this wrong: these filters are a safeguard, not a guarantee. Give her the minimum, never an address, a key, a recovery phrase or an amount."
- General switch (`setAliceMemoryEnabled`), for the personal memory only. Off, `aliceMemoryContext` returns nothing, the capture instruction is not sent, no candidate is written, and a standalone "remember that" request is answered that memory is off. Learning signals are not covered by the switch: `recordPedagogicalSignal` and `pedagogicalContext` run regardless, until a concept is forgotten or everything is cleared.
- One field per category, shown even when empty, with Pause or Resume (`setAliceMemoryCategoryPaused`: capture into that category stops, what it holds stays) and Delete all here (`clearAliceMemoryCategory`, after an inline confirmation that counts the older facts too).
- Each fact with Edit (`editAliceMemoryItem`: the new text goes through `aliceMemoryRefusalReason`, a refusal is shown under the field and nothing changes) and Delete (`forgetAliceMemoryItem`).
- Past the `ALICE_MEMORY_RECENT_LIMIT = 50` most recent facts, a folded "older facts" section with the same Edit and Delete.
- Learning signals per concept with a Forget button each (`forgetPedagogicalConcept`).
- Forget everything (`clearAliceMemory` and `clearPedagogicalProfile`), after an inline confirmation, which erases both stores on this device. Conversations and the wallet are untouched.

## 6. Recent changes

- 0.2.3: on the web, the memory and the learning profile rest encrypted under a non-extractable WebCrypto key, as they already did on desktop under the keychain key; the application's own stores (Explorer tabs, saved wallets, custom nodes, layer registries, Playground) join the same local vault. No PIN yet.
- 0.2.2: Setup, Experience and Requested notes categories, requested notes riding with preferences and constraints; explicit "remember that" requests; amount and exchange-account filters; refusal reasons shown in the chat and on the screen; no cap on the store, with the older section past 50; field screen with Edit, Pause and Delete all here; the warning at the top of the screen; up to three model proposals per answer instead of two; storage format 2, format 1 read without loss.
- A message that asks for the balance, the history, a payment or a network value receives a fixed reply and produces no memory candidate.
- A conditional clause ("if I run a node") is no longer a personal statement nor a declared level.
- The premise sentence of a question is now sent to retrieval (2026-10-06); this does not change what is memorized.

## Coming, not shipped

Decided on 2026-10-06 with the maintainer, not yet in the code or not yet in a build. Until they ship, nothing above should be read as if they were.

- **Capture notice.** Under the answer, "Alice remembers: …" with Keep and Forget, shown for every capture, with no option to hide it. Today a capture by the patterns or the model is visible only on the "What Alice remembers" screen; only a standalone "remember that" request gets an answer.
- **Fixed patterns for setup and experience.** "I have a multisig", "I use a Ledger", "I run a node" and their French forms. Today these facts reach the memory only through the model's proposal or an explicit request.

Out of scope, by decision: no copy off the device, no sync between devices, no export to the account.
