---
type: "project_note"
id: "cold-storage"
title: "Offline storage"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Cold Storage", "La conservation hors ligne"]
parent_ids: []
related_ids: ["watch-only-wallet", "partially-signed-bitcoin-transaction", "secure-backups", "secondary-bitcoin-paper-wallet"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc102 — Getting your first bitcoins", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Offline storage

## Questions covered

- What does keeping your keys offline mean?

## Short answer

Offline storage seeks to isolate the signing keys from connected environments. It mainly aims to reduce exposure to remote attacks.

## Explanation

A dedicated signing device is one option; other arrangements also separate preparation from signing. The public information can stay in a watch-only wallet while the secret is used only during an authorization.

Security depends on the whole chain. Key generation, their backup, the transfer of the data to be signed and the verification of the destination must be consistent. A secret that was exposed at the start does not become unknown to attackers again simply because the device is disconnected afterwards.

## Limits and confusions

Offline does not mean invulnerable. Loss, destruction, recovery errors and physical access remain possible. An overly complicated arrangement can create a lock-out risk greater than the one it seeks to reduce. The terms cold storage and hardware wallet partly overlap, but refer respectively to a storage arrangement and to a category of devices.

## Further reading

- [[watch-only-wallet.en|Watching without being able to spend]].
- [[partially-signed-bitcoin-transaction.en|Preparing and signing a transaction with PSBT]].
- [[secure-backups.en|The risks that threaten a backup]].

- [[secondary-bitcoin-paper-wallet.en|Old-style paper wallets]].

## References

- PlanB btc102 — Getting your first bitcoins.
- PlanB Extraction — 2026-05-23.
