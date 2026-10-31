---
type: "project_note"
id: "secondary-bitcoin-coinbase-maturity"
title: "Block reward maturity"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Coinbase Maturity", "La maturité des récompenses de bloc"]
parent_ids: ["block-reward", "bitcoin-transaction-confirmation"]
related_ids: ["block-reward", "bitcoin-transaction-confirmation"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB min101 — Introduction to Bitcoin mining"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Block reward maturity

## Questions covered

- When can a miner spend the outputs of its coinbase transaction?

## Short answer

A coinbase output created at height h cannot be spent in a block before h + 100.

## Explanation

- The outputs of the coinbase transaction have a specific delay before they can be spent, distinct from ordinary payments.
- This delay reduces some of the consequences of a reward disappearing in a recent reorganization.

## Limits and confusions

This rule does not make a deeper reorganization impossible, and it does not apply to ordinary outputs in general.

## Further reading

- [[block-reward.en|The block reward]] — back to the basic concept.
- [[bitcoin-transaction-confirmation.en|Confirmations]] — back to the basic concept.

## References

- PlanB min101 — Introduction to Bitcoin mining
