---
type: "project_note"
id: "double-spending"
title: "The double-spending problem"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["fundamentals"]
aliases: ["Double Spending", "Le problème de la double dépense"]
parent_ids: []
related_ids: ["bitcoin-utxo", "bitcoin-finality", "bitcoin-mempool"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB his201 — The History of Bitcoin's Creation"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The double-spending problem

## Questions covered

- Why can a digital payment not be copied?

## Short answer

Double spending consists of trying to use the same funds for 2 incompatible payments. Bitcoin prevents both from being accepted together in the same valid history.

## Explanation

A file can be copied without depriving its owner of the original. A currency must instead make it possible to determine which units are still spendable. Bitcoin references specific transaction outputs, the UTXOs. Once an output has been spent, another payment cannot spend it again in the same history.

Nodes enforce this rule. Proof of work and confirmations make it possible to decide between competing histories. A transaction that has merely been broadcast can still be replaced or never confirmed; having seen it on a screen is not enough to make it final.

## Limits and confusions

The mempool is not a shared, final ledger. Each node keeps its own pending transactions. The more confirmations a transaction accumulates, the lower the risk of it being undone by a reorganization, without any absolute guarantee. A copy of the file describing a transaction creates no additional bitcoin.

## Further reading

- [[bitcoin-utxo.en|Understanding UTXOs]].
- [[bitcoin-finality.en|Progressive finality]].
- [[bitcoin-mempool.en|The transaction queue]].

## References

- PlanB his201 — The History of Bitcoin's Creation.
