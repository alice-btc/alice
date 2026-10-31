---
type: "project_note"
id: "atomic-swap"
title: "Atomic swaps"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Ark and other layers"]
aliases: ["Atomic Swap", "Les échanges atomiques"]
parent_ids: []
related_ids: ["counterparty-risk", "bitcoin-layered-architecture", "secondary-addresses-hashlock", "secondary-bitcoin-adaptor-signature", "secondary-bitcoin-dlc", "secondary-lightning-submarine-swap"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/BlockstreamResearch/scriptless-scripts/blob/master/md/atomic-swap.md", "https://docs.lightning.engineering/the-lightning-network/multihop-payments/hash-time-lock-contract-htlc"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Atomic swaps

## Questions covered

- What does it mean to exchange without either party being able to keep both assets?

## Short answer

An atomic swap links the payments of 2 parties so that either the full exchange completes or the funds are recovered, according to the protocol's conditions. It reduces the need to entrust the funds simultaneously to an intermediary.

## Explanation

The mechanisms can use contracts based on a secret and timelocks, or adaptor signatures. The choice depends on the available primitives and on the compatibility of the systems. The conditions organize settlement and the recourses if one party stops cooperating.

Atomicity concerns the link between the spends. It does not guarantee that the counterparty will agree to start, that liquidity will be available or that the experience will be instant. Participants must keep their data and be able to act on the networks concerned within the deadlines.

## Limits and confusions

An abandoned attempt can lock up funds and cost fees, even if the principal remains recoverable. An implementation flaw or a badly chosen deadline can undermine the expected security.

Adaptor signatures are neither a universal replacement for the other mechanisms nor a proof of anonymity. To compare a concrete service, check the protocol actually used, its assumptions and who can trigger a recovery.

## Further reading

- [[counterparty-risk.en|Counterparty risk]] — distinguish reducing the risk from removing it
- [[bitcoin-layered-architecture.en|Bitcoin's layers]] — situate exchanges between systems

- [[secondary-addresses-hashlock.en|Secret-based spending conditions]].
- [[secondary-bitcoin-adaptor-signature.en|Adaptor signatures]].
- [[secondary-bitcoin-dlc.en|DLC contracts and their oracles]].
- [[secondary-lightning-submarine-swap.en|Moving between Bitcoin and Lightning with a swap]].

## References

- [Blockstream Research — adaptor-signature swap protocol and compatibility assumptions](https://github.com/BlockstreamResearch/scriptless-scripts/blob/master/md/atomic-swap.md).
- [Lightning Labs — HTLC, timelocks and refunds](https://docs.lightning.engineering/the-lightning-network/multihop-payments/hash-time-lock-contract-htlc).
