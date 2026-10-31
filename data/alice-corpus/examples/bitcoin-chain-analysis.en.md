---
type: "project_note"
id: "bitcoin-chain-analysis"
title: "Chain analysis"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Bitcoin Chain Analysis", "L’analyse de chaîne"]
parent_ids: []
related_ids: ["common-input-ownership-heuristic", "coinjoin", "kyc-data-leakage", "secondary-bitcoin-dormant-bitcoin-address", "secondary-bitcoin-privacy-by-obfuscation", "secondary-privacy-transaction-heuristics"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc204 — Privacy on Bitcoin", "PlanB Extraction — 2026-05-24 — Glossary"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Chain analysis

## Questions covered

- How can transactions be linked together?

## Short answer

Chain analysis uses public transactions and external data to understand flows and propose links between actors. Its conclusions about ownership often rest on heuristics.

## Explanation

A heuristic is an interpretation rule that is often useful but can be wrong. Inputs spent together, an output that looks like change or a pattern of amounts can provide clues. External information, such as the identification of an account, can strengthen a link.

It is important to state what is observed directly and what is inferred. Transaction data is visible; the name of its owner does not automatically follow from a single computation.

## Limits and confusions

Some links are established by direct information, others remain uncertain. It would therefore be as misleading to present every attribution as a certainty as to present all the data as unusable. Collaborative transactions can contradict the usual assumptions. Multiplying dependent clues does not necessarily yield several independent proofs.

## Further reading

- [[common-input-ownership-heuristic.en|The common-input ownership assumption]].
- [[coinjoin.en|Understanding CoinJoin]].
- [[kyc-data-leakage.en|Exposed identification data]].

- [[secondary-bitcoin-dormant-bitcoin-address.en|When long-dormant bitcoins move]].
- [[secondary-bitcoin-privacy-by-obfuscation.en|Privacy through ambiguous links]].
- [[secondary-privacy-transaction-heuristics.en|The clues used by chain analysis]].

## References

- PlanB btc204 — Privacy on Bitcoin.
- PlanB Extraction — 2026-05-24 — Glossary.
