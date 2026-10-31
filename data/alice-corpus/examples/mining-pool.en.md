---
type: "project_note"
id: "mining-pool"
title: "Mining pools"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Mining and energy"]
aliases: ["Mining Pool", "Les pools de minage"]
parent_ids: []
related_ids: ["solo-bitcoin-mining", "mining-centralization", "secondary-bitcoin-mining-shares", "secondary-bitcoin-mining-variance", "secondary-bitcoin-no-kyc-mining-rewards", "secondary-bitcoin-pool-payout-methods", "secondary-bitcoin-stratum-mining-protocol"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB min101 — Introduction to Bitcoin mining", "PlanB min304 — Heat your home while mining bitcoins"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Mining pools

## Questions covered

- Why do miners group together?

## Short answer

A mining pool pools the contributions of several miners and distributes the revenue according to its rules. It generally makes payouts more regular than solo mining.

## Explanation

A small miner can wait a very long time before finding a block alone. In a classic pool, the miner submits partial proofs of work, called shares, which make it possible to estimate their contribution. The payout method specifies how that contribution is paid and which risks remain borne by the miner or by the pool.

The pool can supply the candidate blocks the machines work on. This separates ownership of the hardware from the power to select transactions. Several machine owners can thus depend on the same operator for building blocks.

## Limits and confusions

A pool does not create additional bitcoin for the same amount of work. It mainly changes the distribution of revenue and its variability, with its own fees and conditions.

A "solo pool" service provides infrastructure but does not necessarily pool the gains. The payout method, the withdrawal thresholds and the handling of blocks should be examined, rather than the name of the service.

## Further reading

- [[solo-bitcoin-mining.en|Solo mining]] — comparing the variability of gains
- [[mining-centralization.en|Mining centralization]] — separating hardware from block building

- [[secondary-bitcoin-mining-shares.en|Pool mining shares]].
- [[secondary-bitcoin-mining-variance.en|The irregularity of mining results]].
- [[secondary-bitcoin-no-kyc-mining-rewards.en|Receiving rewards without KYC]].
- [[secondary-bitcoin-pool-payout-methods.en|Pool payout methods]].
- [[secondary-bitcoin-stratum-mining-protocol.en|The Stratum protocol]].

## References

- PlanB min101 — Introduction to Bitcoin mining (reference from the source note, not re-consulted directly for this adaptation).
- PlanB min304 — Heat your home while mining bitcoins (reference from the source note, not re-consulted directly for this adaptation).
