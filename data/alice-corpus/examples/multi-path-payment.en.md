---
type: "project_note"
id: "multi-path-payment"
title: "Multi-path payments"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Multi-Path Payment", "Le paiement en plusieurs chemins"]
parent_ids: []
related_ids: ["lightning-liquidity-path", "lightning-routing"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/lightning/bolts/blob/master/04-onion-routing.md#basic-multi-part-payments", "https://docs.lightning.engineering/lightning-network-tools/lnd/amp"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Multi-path payments

## Questions covered

- Can a payment be spread across several routes?

## Short answer

A multi-part Lightning payment splits the amount into several parts, possibly over different paths. This helps use liquidity that a single route could not mobilize.

## Explanation

The recipient gathers the parts for settlement. In basic MPP, they share the same payment hash. BOLT 4 requires waiting for the announced total before settling any part, then settling the whole if one part is settled. Presenting this mechanism as generally non-atomic would be incorrect.

AMP, a variant proposed in LND, uses distinct hashes and secret shares. Reconstructing them requires all of the parts. This cryptographic construction must be distinguished from the waiting rule of basic MPP.

## Limits and confusions

A split payment has no guarantee of success. Enough liquidity, reachable paths and coordination within the deadlines are still needed. An incomplete set must fail rather than let the recipient arbitrarily treat the total payment as received.

AMP is neither universally preferable nor compatible everywhere. MPP's shared hash can make some correlation easier; removing it does not guarantee anonymity. Proofs of payment also depend on the mechanism used.

## Further reading

- [[lightning-liquidity-path.en|Lightning liquidity and payment paths]] — liquidity and paths — understanding splitting
- [[lightning-routing.en|Routing a payment]] — placing the choice of routes

## References

- [BOLT 4, Basic Multi-Part Payments and recipient requirements](https://github.com/lightning/bolts/blob/master/04-onion-routing.md#basic-multi-part-payments).
- [Lightning Labs, AMP in LND](https://docs.lightning.engineering/lightning-network-tools/lnd/amp).
