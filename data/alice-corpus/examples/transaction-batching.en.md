---
type: "project_note"
id: "transaction-batching"
title: "Grouping several payments"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Transaction Batching", "Regrouper plusieurs paiements"]
parent_ids: []
related_ids: ["bitcoin-transaction-output", "transaction-fees", "consolidation-transaction"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc303 — Bitcoin Development Philosophy", "PlanB Extraction — 2026-05-23 — lnp404"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Grouping several payments

## Questions covered

- Why send to several people in 1 transaction?

## Short answer

Batching groups several payments into a single transaction. It makes it possible to share certain common data and to reduce the space and fees per payment.

## Explanation

A transaction can create several outputs for different recipients. A business that makes many settlements can thus prepare a batch rather than an independent transaction for each beneficiary. The recipients obtain distinct outputs within the same transaction.

The gain depends on the structure of the inputs and outputs as well as on the fee rate. It does not remove competition for block space; it uses that space more efficiently. All the payments in the batch share its inclusion in a block.

## Limits and confusions

Grouping can reveal that several recipients were paid together. That does not prove they belong to the same person. Batching differs from a consolidation, which gathers the payer's funds, and from a collaborative transaction such as CoinJoin. The potential savings must not overshadow individual control of amounts and destinations.

## Further reading

- [[bitcoin-transaction-output.en|The outputs of a transaction]].
- [[transaction-fees.en|Transaction fees]].
- [[consolidation-transaction.en|UTXO consolidation]].

## References

- PlanB btc303 — Bitcoin Development Philosophy.
- PlanB Extraction — 2026-05-23 — lnp404.
