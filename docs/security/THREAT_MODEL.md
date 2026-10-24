# Alice threat model

This repository holds Alice App (web and desktop), the website, the Private
Cloud proxy Worker and the Playground, a practice wallet on Mutinynet with
worthless test coins. Alice App holds no real funds. Alice Wallet, the
self-custodial wallet, lives in `alice-btc/alice-wallet` with its own threat
model. This document summarises the security boundaries of this repository. It
is a map of the system, not a claim that all risks are eliminated.

## Assets that must remain private

- Wallet recovery phrase and derived wallet private keys
- Wallet signing state and locally held transaction data
- Alice account passwords and session tokens
- Chat content and the locally stored learning profile
- Worker secrets, including Venice, Resend and session-signing keys

## Trust boundaries

### Playground custody

The Playground creates and holds its practice seed on the device, for
Mutinynet coins only. Alice account credentials never derive, wrap, encrypt,
decrypt, restore, or export that seed. The AI code cannot import the
Playground's custody or payment modules, and the deterministic Playground code
still requires explicit user confirmation to send.

### Alice account service

The Worker holds only account and quota data needed for Private Cloud access.
It does not receive the wallet seed, wallet private keys, or chat plaintext.
The internal `user_id` is not a public identifier. Passwords are stored as
password hashes, never plaintext.

### Private Cloud

Private Cloud encrypts messages on the client before they cross Alice's proxy.
The proxy relays ciphertext and attaches the Venice API key, but does not
decrypt prompts or responses. The current assurance is **attested-unpinned**:
Alice verifies a genuine, current, non-debug TDX attestation and key binding,
but Venice has not published the reference measurements needed to identify the
exact enclave image. It must not be described as full E2EE.

### Local AI

Local AI runs on the device. The learning profile is local only and stores
bounded topic-level counters, not a copy of a user message. Semantic retrieval
runs on Alice App web and Desktop (an on-device embedding model, bundled with
the desktop installer, downloaded on the web).

### Third-party services

Esplora (the Playground's on-chain lookups and faucet rails), the Explorer's
providers (Esplora mirrors, Arkade, Bark, Spark, Liquid), Venice and
Cloudflare are external services with their own availability and privacy
boundaries. Alice should fail clearly when one is unavailable rather than
silently switching to another server or downgrading Private Cloud to
plaintext.

## Non-goals and known limits

- Nothing in this repository holds real funds: the Playground runs on Mutinynet
  only. Limits on real funds belong to Alice Wallet's threat model.
- Private Cloud does not currently provide full measurement-pinned E2EE.
- The Worker does not provide a cloud backup of wallet seeds or chats.
- The admin console is local and aggregate by design. It cannot expose a seed,
  wallet key, password, conversation, or AI request body.

## Related documents

- [Private Cloud trust model](private-cloud-e2ee.md)
- [Local chat encryption](local-chat-encryption.md)
- [Admin dashboard privacy model](admin-dashboard.md)
