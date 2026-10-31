---
type: "project_note"
id: "proof-of-work"
title: "Proof of work"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["mining"]
aliases: ["Proof of Work", "La preuve de travail"]
parent_ids: []
related_ids: ["bitcoin-mining", "hashrate", "mining-difficulty", "secondary-bitcoin-merged-mining", "secondary-bitcoin-rpow", "secondary-bitcoin-sha-256", "secondary-economics-proof-of-stake"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bitcoin/blob/v28.0/src/pow.cpp", "https://bitcoin.org/bitcoin.pdf"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Proof of work

## Questions covered

- Why produce a proof of work?

## Short answer

Proof of work lets miners propose blocks by providing a result that is costly to produce and easy to verify. Nodes keep the valid chain that represents the most accumulated work.

## Explanation

Miners try variants of the block header until they obtain a hash lower than or equal to the target. They have no shortcut that guarantees them the next success. Nodes can then check the result and the validity of the block with far less computation.

Rewriting a history requires producing competing work. The difficulty sets the expected frequency of successes according to the observed production conditions.

## Limits and confusions

Miners propose blocks, but cannot force on nodes a block that breaks their rules. Holding BTC does not directly give a vote in this mechanism. Capital can, however, fund hardware and energy; proof of work does not remove economic power. Producing blocks and verifying them as a node have distinct costs.

## Further reading

- [[bitcoin-mining.en|Understanding mining]].
- [[hashrate.en|Hashrate]].
- [[mining-difficulty.en|Mining difficulty]].

- [[secondary-bitcoin-merged-mining.en|Merged mining]].
- [[secondary-bitcoin-rpow.en|Hal Finney's reusable proofs of work]].
- [[secondary-bitcoin-sha-256.en|SHA-256 and proof of work]].
- [[secondary-economics-proof-of-stake.en|Comparing proof of stake and proof of work]].

## References

- [Public reference kept from the source note](https://github.com/bitcoin/bitcoin/blob/v28.0/src/pow.cpp).
- [Public reference kept from the source note](https://bitcoin.org/bitcoin.pdf).
