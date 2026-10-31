---
type: "project_note"
id: "bitcoin-protocol"
title: "Bitcoin's rules"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["fundamentals"]
aliases: ["Bitcoin Protocol", "Les règles de Bitcoin"]
parent_ids: []
related_ids: ["bitcoin-node", "bitcoin-core", "bitcoin-mempool-policy"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc101 — The Bitcoin Journey", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Bitcoin's rules

## Questions covered

- What defines Bitcoin?

## Short answer

The Bitcoin protocol is the set of rules that make it possible to build, exchange and verify transactions and blocks without a central administrator of the ledger.

## Explanation

A wallet prepares a transaction and the necessary signatures. Nodes verify that it respects their rules and can pass it on to their peers. Miners propose blocks; nodes reject those that break the consensus rules they enforce.

These rules govern in particular the authorized spends, the absence of double spending and the creation of new bitcoins. They are executed by software. Bitcoin Core is an important implementation, but the protocol is neither a company's account nor a database administered by its developers.

## Limits and confusions

The protocol, the software and the practices are not synonyms. Publishing new software does not force all users to adopt it. Some rules for transmitting transactions are local to nodes and are distinct from the rules that make a block valid. Changes therefore require specifying what changes and who enforces it.

## Further reading

- [[bitcoin-node.en|The role of a Bitcoin node]].
- [[bitcoin-core.en|The Bitcoin Core software]].
- [[bitcoin-mempool-policy.en|Local rules and consensus]].

## References

- PlanB btc101 — The Bitcoin Journey.
- PlanB Extraction — 2026-05-23.
