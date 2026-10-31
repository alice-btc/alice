---
type: "project_note"
id: "secondary-bitcoin-mining-shares"
title: "Pool mining shares"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Mining Shares", "Les parts de travail des pools"]
parent_ids: ["mining-pool", "hashrate"]
related_ids: ["mining-pool", "hashrate"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB min101 — Introduction to Bitcoin mining"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Pool mining shares

## Questions covered

- What does a share sent to a mining pool represent?

## Short answer

A share is a proof meeting a difficulty chosen by the pool to estimate the miner's contribution. Most shares do not meet the difficulty required for a Bitcoin block.

## Explanation

- A share meets a difficulty lower than the network difficulty.
- The pool uses shares to distribute payments.
- The more valid shares a miner submits, the higher its estimated contribution.
- Shares make measurable a kind of work that would otherwise produce blocks only rarely.

## Limits and confusions

Shares measure a statistical contribution; each one is not a block reward.

## Further reading

- [[mining-pool.en|Mining pools]] — back to the basic concept.
- [[hashrate.en|Hashrate]] — back to the basic concept.

## References

- PlanB min101 — Introduction to Bitcoin mining
