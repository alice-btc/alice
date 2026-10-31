---
type: "project_note"
id: "secondary-lightning-lightning-public-channel"
title: "Announced Lightning channels"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Lightning Public Channel", "Les canaux Lightning annoncés"]
parent_ids: ["lightning-channel", "lightning-routing"]
related_ids: ["lightning-channel", "lightning-routing"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB lnp404 — Navigating Your Node with Terminal"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Announced Lightning channels

## Questions covered

- Announced Lightning channels — what is the mechanism and what are its limits?

## Short answer

A public Lightning channel is announced to the network graph, allowing third parties to route payments through that channel.

## Explanation

- It can generate routing fees.
- It exposes more topological information than a private channel.
- It requires uptime, liquidity and a competitive fee policy.
- It is suited to routing nodes.

## Limits and confusions

A public announcement guarantees neither traffic nor revenue. A payment can fail even though the channel is present in the graph.

## Further reading

- [[lightning-channel.en|Lightning channels]] — to place this mechanism in context.
- [[lightning-routing.en|Routing a payment]] — to place this mechanism in context.

## References

- PlanB lnp404 — Navigating Your Node with Terminal
