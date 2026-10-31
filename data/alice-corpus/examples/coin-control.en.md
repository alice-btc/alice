---
type: "project_note"
id: "coin-control"
title: "Choosing the funds to spend"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Coin Control", "Choisir les fonds à dépenser"]
parent_ids: []
related_ids: ["coin-selection-tradeoffs", "utxo-labeling", "change-privacy-linking"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc204 — Privacy on Bitcoin", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Choosing the funds to spend

## Questions covered

- What is coin control for?

## Short answer

Coin control lets you choose which UTXOs will fund a transaction instead of leaving the decision to the wallet alone. This choice can influence the fees and the links publicly created between funds.

## Explanation

UTXOs can come from different contexts. Combining them in a payment lets an observer assume common control. Origin labels help in understanding what is being brought together, and in tracking the change produced by a spend.

The number of inputs also counts for the weight. Selecting many small funds can increase the fees; choosing too large an amount can create a new change output.

## Limits and confusions

Manual selection is not automatically better than the software's. It requires understanding the amounts, the fees and the privacy consequences. Avoiding one grouping does not guarantee the absence of other links through addresses, servers or external data. This note sets out the trade-offs rather than a universal selection rule.

## Further reading

- [[coin-selection-tradeoffs.en|UTXO selection and trade-offs]].
- [[utxo-labeling.en|Labeling your UTXOs]].
- [[change-privacy-linking.en|Change and privacy links]].

## References

- PlanB btc204 — Privacy on Bitcoin.
- PlanB Extraction — 2026-05-23.
