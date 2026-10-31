---
type: "project_note"
id: "secondary-lightning-lightning-gossip-protocol"
title: "Broadcasting the public Lightning graph"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Lightning Gossip Protocol", "La diffusion du graphe public Lightning"]
parent_ids: ["lightning-routing", "lightning-privacy-tradeoff"]
related_ids: ["lightning-routing", "lightning-privacy-tradeoff"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB lnp202 — Set up Your First Lightning Node"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Broadcasting the public Lightning graph

## Questions covered

- Broadcasting the public Lightning graph — what is the mechanism and what are its limits?

## Short answer

The Lightning gossip protocol broadcasts public information about nodes and channels in order to build a map of the network.

## Explanation

- It lets nodes discover payment routes.
- It does not reveal every private channel or exact balance.
- It publishes, among other things, the existence of channels and certain routing policies.
- The network map is used for pathfinding but remains imperfect.

## Limits and confusions

The public map does not give exact balances or guaranteed availability for each path. An unannounced channel can also leave clues for some participants.

## Further reading

- [[lightning-routing.en|Routing a payment]] — to place this mechanism in context.
- [[lightning-privacy-tradeoff.en|Privacy on Lightning]] — to place this mechanism in context.

## References

- PlanB lnp202 — Set up Your First Lightning Node
