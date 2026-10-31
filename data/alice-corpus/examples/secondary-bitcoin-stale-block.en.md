---
type: "project_note"
id: "secondary-bitcoin-stale-block"
title: "Valid blocks that are not kept"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Stale Block", "Les blocs valides non retenus"]
parent_ids: ["bitcoin-transaction-confirmation", "bitcoin-mining"]
related_ids: ["bitcoin-transaction-confirmation", "bitcoin-mining"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Valid blocks that are not kept

## Questions covered

- Why can a valid block end up outside the active chain?

## Short answer

A stale block is a valid block that ultimately does not belong to the chain that is kept, for example after a race between 2 blocks found close together.

## Explanation

- The phenomenon increases when blocks propagate or validate slowly.
- Miners lose the reward of blocks that become stale.
- Fear of stale blocks can encourage validationless mining or centralization towards better-connected pools.
- The term is often more precise than "orphan block" for modern Bitcoin.

## Limits and confusions

The transactions can be confirmed again elsewhere; the coinbase reward of the abandoned block is not kept in the active chain.

## Further reading

- [[bitcoin-transaction-confirmation.en|Confirmations]] — back to the basic concept.
- [[bitcoin-mining.en|Understanding mining]] — back to the basic concept.

## References

- PlanB btc303 — Bitcoin Development Philosophy
