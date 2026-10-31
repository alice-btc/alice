---
type: "project_note"
id: "secondary-lightning-onion-routing"
title: "Lightning's onion routing"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Onion Routing", "Le routage en oignon de Lightning"]
parent_ids: ["lightning-routing", "lightning-privacy-tradeoff"]
related_ids: ["lightning-routing", "lightning-privacy-tradeoff"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB lnp201 — Lightning Network Theory"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Lightning's onion routing

## Questions covered

- Lightning's onion routing — what is the mechanism and what are its limits?

## Short answer

Lightning's onion routing makes it possible to forward a payment through several intermediate nodes without any of them knowing the whole path. Each node sees only the previous hop, the next hop and the instructions meant for it.

## Explanation

- Onion routing partially protects the privacy of the path.
- It does not make Lightning perfectly anonymous.
- Intermediate nodes know the amounts and fees relevant to their hop.
- Privacy also depends on topology, liquidity, probing and the behavior of the endpoints.

## Limits and confusions

The reduced visibility of each relay does not prevent inferences from amounts, timing, topology or collusion. The endpoints know different information than the relays do.

## Further reading

- [[lightning-routing.en|Routing a payment]] — to place this mechanism in context.
- [[lightning-privacy-tradeoff.en|Privacy on Lightning]] — to place this mechanism in context.

## References

- PlanB lnp201 — Lightning Network Theory
