---
type: "project_note"
id: "secondary-bitcoin-paper-wallet"
title: "Old-style paper wallets"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Paper Wallet", "Les anciens portefeuilles papier"]
parent_ids: ["cold-storage", "wallet-backup"]
related_ids: ["cold-storage", "wallet-backup"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB his203 — Bitcoin’s Pioneering Era"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Old-style paper wallets

## Questions covered

- Is a paper wallet the same thing as a seed phrase written on paper?

## Short answer

A historical paper wallet often holds a single, isolated private key on paper. A seed phrase written on paper is a wallet backup of a different kind.

## Explanation

- An isolated private key does not necessarily provide the deterministic recovery of a modern wallet with several addresses.
- A paper backup must also withstand physical loss and the exposure of secrets during its creation or use.

## Limits and confusions

Printing, generation, import and change outputs can all create risks; the paper does not prove that the secret was never exposed.

## Further reading

- [[cold-storage.en|Offline storage]] — back to the basic concept.
- [[wallet-backup.en|Preparing a backup]] — back to the basic concept.

## References

- PlanB his203 — Bitcoin’s Pioneering Era
