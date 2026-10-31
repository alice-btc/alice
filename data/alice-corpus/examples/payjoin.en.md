---
type: "project_note"
id: "payjoin"
title: "Understanding PayJoin"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["PayJoin", "Comprendre PayJoin"]
parent_ids: []
related_ids: ["common-input-ownership-heuristic", "coinjoin", "bitcoin-chain-analysis"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc204 — Privacy on Bitcoin", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Understanding PayJoin

## Questions covered

- How does a PayJoin change the reading of a payment?

## Short answer

A PayJoin is a collaborative payment in which the recipient also contributes an input. It thus contradicts the simple assumption that all inputs belong to the payer.

## Explanation

The participants prepare a joint transaction that keeps the purpose of the payment while combining their contributions. To an outside observer, this transaction can look like an ordinary payment rather than an operation explicitly dedicated to privacy.

This arrangement depends on the compatibility of the tools and on the coordination mechanism. It can also change the recipient's UTXO management, since the recipient takes part with their own funds.

## Limits and confusions

The amounts and the transaction remain public. The benefit concerns the interpretation of relationships, not their complete disappearance. The payer and the recipient know information tied to their own exchange; the other data channels still matter. Not every transaction with several inputs is a PayJoin, and not every wallet supports it.

## Further reading

- [[common-input-ownership-heuristic.en|The common-input ownership assumption]].
- [[coinjoin.en|Understanding CoinJoin]].
- [[bitcoin-chain-analysis.en|Chain analysis]].

## References

- PlanB btc204 — Privacy on Bitcoin.
- PlanB Extraction — 2026-05-23.
