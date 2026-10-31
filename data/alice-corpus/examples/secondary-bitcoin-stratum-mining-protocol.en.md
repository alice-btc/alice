---
type: "project_note"
id: "secondary-bitcoin-stratum-mining-protocol"
title: "The Stratum protocol"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Stratum Mining Protocol", "Le protocole Stratum"]
parent_ids: ["mining-pool", "asic-mining"]
related_ids: ["mining-pool", "asic-mining"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB min306 — Bitaxe Open Source Mining Mastery"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# The Stratum protocol

## Questions covered

- How do ASICs exchange their work with a pool?

## Short answer

Stratum connects miners to a pool server to distribute work and send back the shares found.

## Explanation

- The server assigns mining jobs, and the miner returns the results that meet the difficulty requested for shares.
- The choices around block construction and protection of the exchanges depend on the features actually used.

## Limits and confusions

Features and guarantees differ between versions and implementations; do not assume that every miner chooses its own transactions.

## Further reading

- [[mining-pool.en|Mining pools]] — back to the basic concept.
- [[asic-mining.en|Specialized mining machines]] — back to the basic concept.

## References

- PlanB min306 — Bitaxe Open Source Mining Mastery
