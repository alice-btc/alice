---
type: "project_note"
id: "consolidation-transaction"
title: "UTXO consolidation"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Consolidation Transaction", "La consolidation des UTXO"]
parent_ids: []
related_ids: ["coin-control", "common-input-ownership-heuristic", "transaction-batching"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc204 — Privacy on Bitcoin", "PlanB Extraction — 2026-05-23 — btc303"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# UTXO consolidation

## Questions covered

- Why group UTXOs together, and which trade-offs does that involve?

## Short answer

A consolidation combines several UTXOs into a smaller number of outputs. It can simplify future spends, while creating a public link between funds that were previously separate.

## Explanation

Spending many small UTXOs requires several inputs. Grouping them can reduce the number of inputs needed for a later operation. The economic reasoning depends on the fees paid now and on those that would be paid later; future fees are not known with certainty.

From a privacy standpoint, the transaction explicitly associates these funds. An observer can apply the common-control assumption and link their histories.

## Limits and confusions

A consolidation is therefore not a simple optimization without downsides. It can also create change during a future payment. It must be distinguished from batching, which groups several payments to recipients. This note explains a general trade-off and does not recommend automatically combining all the funds of a wallet.

## Further reading

- [[coin-control.en|Choosing the funds to spend]].
- [[common-input-ownership-heuristic.en|The common-input ownership assumption]].
- [[transaction-batching.en|Grouping several payments]].

## References

- PlanB btc204 — Privacy on Bitcoin.
- PlanB Extraction — 2026-05-23 — btc303.
