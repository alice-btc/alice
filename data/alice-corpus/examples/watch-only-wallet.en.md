---
type: "project_note"
id: "watch-only-wallet"
title: "Watching without being able to spend"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Watch-Only Wallet", "Observer sans pouvoir dépenser"]
parent_ids: []
related_ids: ["extended-public-key", "wallet-backup-test", "wallet-node-connection", "secondary-bitcoin-non-hardened-derivation"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Watching without being able to spend

## Questions covered

- Can a wallet be tracked without its private keys?

## Short answer

A watch-only wallet tracks addresses, transactions and a balance without holding the private keys needed to spend. It separates observation from signing.

## Explanation

It can use an extended public key or descriptors to find the relevant outputs. This makes it possible to view the funds on a connected device while the secrets stay elsewhere. Depending on the software, it can also prepare transactions to be signed by another tool.

This separation helps organize offline storage, but requires knowing where the real means of authorization are. Seeing your bitcoins does not mean holding the secrets that allow them to be recovered.

## Limits and confusions

Watch-only is not synonymous with non-sensitive data. The information used can reveal many addresses and a lot of history. A balance screen can also be fooled if its sources are malicious. A restore test limited to that screen therefore validates neither the ability to sign nor, necessarily, independent verification of the chain.

## Further reading

- [[extended-public-key.en|The extended public key]].
- [[wallet-backup-test.en|Testing your backup]].
- [[wallet-node-connection.en|Connecting a wallet to your node]].

- [[secondary-bitcoin-non-hardened-derivation.en|Public derivation of child keys]].

## References

- PlanB cyp201 — Bitcoin Wallet Architecture.
