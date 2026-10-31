---
type: "project_note"
id: "common-input-ownership-heuristic"
title: "The common-input ownership assumption"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Common Input Ownership Heuristic", "L’hypothèse des entrées communes"]
parent_ids: []
related_ids: ["coin-control", "coinjoin", "payjoin", "secondary-privacy-transaction-heuristics"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc204 — Privacy on Bitcoin"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The common-input ownership assumption

## Questions covered

- Why can spending several UTXOs together link them?

## Short answer

The common-input ownership heuristic assumes that funds spent together belong to the same actor. It is often useful for an ordinary transaction, but it is not a rule of the protocol.

## Explanation

A wallet commonly chooses several UTXOs to fund a payment. The observer infers that the same entity had the ability to mobilize them. A consolidation makes this link particularly visible, since it groups several funds together.

Bitcoin nevertheless allows building a transaction with several participants. They can each authorize their own inputs. A CoinJoin or a PayJoin can therefore combine funds that do not belong to the same payer.

## Limits and confusions

Valid signatures prove that the spending conditions were met, not the existence of a single human owner. The heuristic must not be phrased as "all the inputs necessarily belong to the same person". Knowledge of the context and of the transaction type is needed before an attribution. Labels kept by the holder can help avoid unwanted groupings.

## Further reading

- [[coin-control.en|Choosing the funds to spend]].
- [[coinjoin.en|Understanding CoinJoin]].
- [[payjoin.en|Understanding PayJoin]].

- [[secondary-privacy-transaction-heuristics.en|The clues used by chain analysis]].

## References

- PlanB btc204 — Privacy on Bitcoin.
