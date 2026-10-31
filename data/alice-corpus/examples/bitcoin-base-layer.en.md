---
type: "project_note"
id: "bitcoin-base-layer"
title: "Bitcoin's base layer"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["fundamentals"]
aliases: ["Bitcoin Base Layer", "La couche de base de Bitcoin"]
parent_ids: []
related_ids: ["transaction-fees", "bitcoin-finality", "lightning-network"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://bitcoin.org/bitcoin.pdf", "https://developer.bitcoin.org/devguide/block_chain.html"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Bitcoin's base layer

## Questions covered

- What does paying on-chain mean?

## Short answer

Paying on the base layer, or "on-chain", means having a transaction recorded in Bitcoin's blocks. Nodes verify its rules, and confirmations progressively strengthen its stability.

## Explanation

The space available in blocks is limited. Payments therefore compete for that space, in particular through their fee rate. The cost depends on the transaction's virtual size and on demand conditions, not simply on the amount sent.

Other protocols organize payments outside of each individual record on this chain. They can improve certain uses, but add their own conditions, dependencies and limits. The base layer then remains a settlement or exit point, depending on the protocol.

## Limits and confusions

The more confirmations a transaction accumulates, the lower the risk of it being reversed. No minimum usage amount is imposed by a rule reserving Bitcoin for large settlements. The choice between layers depends on fees, delays, needs and the trust model; "off-chain" does not by itself describe the level of security.

## Further reading

- [[transaction-fees.en|Transaction fees]].
- [[bitcoin-finality.en|Progressive finality]].
- [[lightning-network.en|Understanding Lightning]].

## References

- [Public reference kept from the source note](https://bitcoin.org/bitcoin.pdf).
- [Public reference kept from the source note](https://developer.bitcoin.org/devguide/block_chain.html).
