---
type: "project_note"
id: "secondary-privacy-transaction-heuristics"
title: "The clues used by chain analysis"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Transaction Heuristics", "Les indices utilisés par l’analyse de chaîne"]
parent_ids: ["bitcoin-chain-analysis", "common-input-ownership-heuristic"]
related_ids: ["bitcoin-chain-analysis", "common-input-ownership-heuristic"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB btc204 — Privacy on Bitcoin"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The clues used by chain analysis

## Questions covered

- Does analyzing a transaction prove who owns the funds?

## Short answer

Transaction heuristics are inference rules used to interpret a Bitcoin transaction: identifying the payment, the change, linked inputs, the wallet type or a specific behavior. They do not prove an identity, but they guide the analysis.

## Explanation

- Internal heuristics examine amounts, outputs, scripts, ordering, similarities and transaction shapes.
- External heuristics exploit KYC data, timing, reused addresses, public information or leaks.
- A heuristic can be fooled by collaborative transactions or by wallets that avoid standard patterns.
- Several heuristics combined can strongly reduce uncertainty.

## Limits and confusions

A correlation or an ownership estimate is not sufficient proof of identity.

## Further reading

- [[bitcoin-chain-analysis.en|Chain analysis]] — to go back to the basic notion.
- [[common-input-ownership-heuristic.en|The common-input ownership assumption]] — to go back to the basic notion.

## References

- PlanB btc204 — Privacy on Bitcoin
