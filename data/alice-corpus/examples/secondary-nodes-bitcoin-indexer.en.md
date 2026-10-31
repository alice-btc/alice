---
type: "project_note"
id: "secondary-nodes-bitcoin-indexer"
title: "Bitcoin indexers"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["nodes"]
aliases: ["Bitcoin Indexer", "Les indexeurs Bitcoin"]
parent_ids: ["wallet-node-connection", "bitcoin-core"]
related_ids: ["wallet-node-connection", "bitcoin-core"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB btc202 — Setting up your first Bitcoin node"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Bitcoin indexers

## Questions covered

- Why do some wallets need an indexer in addition to the node?

## Short answer

A Bitcoin indexer builds additional indexes to quickly find the transactions, addresses or scripts relevant to a wallet or an application. By default, Bitcoin Core does not provide every index that is practical for an external wallet.

## Explanation

- An indexer makes it easier to look up history by address or script.
- Electrs is a popular solution for serving Electrum-compatible wallets.
- Adding an indexer increases storage, CPU and operational surface.
- The indexer can improve independence if the wallet uses it locally.

## Limits and confusions

The indexes and resources needed vary with the queries; not every wallet needs one.

## Further reading

- [[wallet-node-connection.en|Connecting a wallet to your node]] — to go back to the basic notion.
- [[bitcoin-core.en|The Bitcoin Core software]] — to go back to the basic notion.

## References

- PlanB btc202 — Setting up your first Bitcoin node
