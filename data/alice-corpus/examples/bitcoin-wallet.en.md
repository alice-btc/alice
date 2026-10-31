---
type: "project_note"
id: "bitcoin-wallet"
title: "The role of a Bitcoin wallet"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Bitcoin Wallet", "Le rôle d’un portefeuille Bitcoin"]
parent_ids: []
related_ids: ["self-custody", "custodial-wallet", "wallet-node-connection"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc202 — Setting up your first Bitcoin node", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The role of a Bitcoin wallet

## Questions covered

- What does a wallet really contain?

## Short answer

A Bitcoin wallet manages keys or coordinates their use, prepares transactions and tracks funds. Bitcoins are not files stored in the phone; their state is described in the ledger.

## Explanation

The wallet computes addresses and looks for the outputs that match its spending conditions. To send, it chooses funds and organizes the signatures. A separate device can hold the keys, while the interface on the computer is used to prepare and view.

The wallet also needs information about the chain. It can obtain it from a personal node or from a third-party server. Managing your own keys and verifying the rules yourself are therefore 2 distinct functions.

## Limits and confusions

An application called a wallet can be a custody service in which the operator controls the funds. A watch-only wallet can display balances without being able to sign. Before comparing products, identify who holds the keys, how recovery works and where the displayed information comes from.

## Further reading

- [[self-custody.en|Self-custody of keys]].
- [[custodial-wallet.en|Custodial wallets]].
- [[wallet-node-connection.en|Connecting a wallet to your node]].

## References

- PlanB btc202 — Setting up your first Bitcoin node.
- PlanB Extraction — 2026-05-23.
