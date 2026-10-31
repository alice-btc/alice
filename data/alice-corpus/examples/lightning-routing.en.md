---
type: "project_note"
id: "lightning-routing"
title: "Routing a payment"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Lightning Routing", "Le routage d’un paiement"]
parent_ids: []
related_ids: ["lightning-liquidity-path", "multi-path-payment", "secondary-lightning-lightning-gossip-protocol", "secondary-lightning-lightning-public-channel", "secondary-lightning-onion-routing"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB lnp201 — Lightning Network Theory"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Routing a payment

## Questions covered

- How does a payment cross several channels?

## Short answer

Lightning routing looks for 1 or several paths of channels between the payer and the recipient. They do not need to have a direct channel between them.

## Explanation

Nodes have information about part of the topology and about fee policies. The wallet looks for a route compatible with the amount and its constraints, then can retry if the route fails.

A channel's announced capacity does not reveal all of its usable liquidity in each direction. A path that looks possible may therefore not allow the payment at the moment of the attempt. Multi-part payments split the amount across paths to make better use of fragmented liquidity. They also require coordination at the destination.

## Limits and confusions

Having an open channel does not guarantee being able to pay every recipient at every moment. Unavailable nodes, fee policies or poorly distributed liquidity can prevent the route.

Onion routing limits the information visible to each intermediary, but does not make all metadata invisible. To explain a failure, distinguish the funds available at the origin, receiving at the destination and the constraints of the intermediate paths.

## Further reading

- [[lightning-liquidity-path.en|Lightning liquidity and payment paths]] — liquidity and paths — examining the bottlenecks
- [[multi-path-payment.en|Multi-path payments]] — understanding the parts of a payment

- [[secondary-lightning-lightning-gossip-protocol.en|Broadcasting the public Lightning graph]].
- [[secondary-lightning-lightning-public-channel.en|Announced Lightning channels]].
- [[secondary-lightning-onion-routing.en|Lightning's onion routing]].

## References

- PlanB lnp201 — Lightning Network Theory (reference from the source note, not re-consulted directly for this adaptation).
