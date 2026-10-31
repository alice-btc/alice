---
type: "project_note"
id: "secondary-bitcoin-mining-variance"
title: "The irregularity of mining results"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Mining Variance", "L’irrégularité des résultats du minage"]
parent_ids: ["solo-bitcoin-mining", "mining-pool"]
related_ids: ["solo-bitcoin-mining", "mining-pool"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB min101 — Introduction to Bitcoin mining"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# The irregularity of mining results

## Questions covered

- Why can a miner wait a very long time without finding a block?

## Short answer

Block discovery is random; a small miner can wait a very long time despite having a computable expected return.

## Explanation

- An expected time to discovery is a statistical average, not a deadline that guarantees the next block.
- Pools share revenue according to their rules and reduce the irregularity borne directly by participants.

## Limits and confusions

More hashrate or a pool mainly reduces the relative uncertainty of revenue, not necessarily its absolute variance.

## Further reading

- [[solo-bitcoin-mining.en|Solo mining]] — back to the basic concept.
- [[mining-pool.en|Mining pools]] — back to the basic concept.

## References

- PlanB min101 — Introduction to Bitcoin mining
