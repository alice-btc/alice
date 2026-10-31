---
type: "project_note"
id: "secondary-bitcoin-coinbase-transaction"
title: "The coinbase transaction"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Coinbase Transaction", "La transaction coinbase"]
parent_ids: ["block-reward", "bitcoin-transaction-input"]
related_ids: ["block-reward", "bitcoin-transaction-input"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB min101 — Introduction to Bitcoin mining"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# The coinbase transaction

## Questions covered

- Why is the first transaction of a block special?

## Short answer

The coinbase is the first transaction in the block and does not use an ordinary input spending an earlier UTXO. It can allocate up to the permitted subsidy plus the block's fees.

## Explanation

- Ordinary inputs spend earlier outputs; the coinbase follows a special format tied to the block.
- The amount it can allocate is bounded by the subsidy at that height plus the block's fees; nodes check this limit.

## Limits and confusions

The miner can claim less than the maximum; the outputs are subject to maturity.

## Further reading

- [[block-reward.en|The block reward]] — back to the basic concept.
- [[bitcoin-transaction-input.en|The inputs of a transaction]] — back to the basic concept.

## References

- PlanB min101 — Introduction to Bitcoin mining
