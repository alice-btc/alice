---
type: "project_note"
id: "secondary-lightning-bolts"
title: "The BOLT specifications of Lightning"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["BOLTs", "Les spécifications BOLT de Lightning"]
parent_ids: ["lightning-network", "bitcoin-improvement-proposal"]
related_ids: ["lightning-network", "bitcoin-improvement-proposal"]
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
# The BOLT specifications of Lightning

## Questions covered

- The BOLT specifications of Lightning — what is the mechanism and what are its limits?

## Short answer

The BOLTs are the technical specifications that define the interoperable behavior of Lightning implementations.

## Explanation

- BOLT stands for Basis of Lightning Technology.
- They describe messages, channels, onion routing, invoices and protocol rules.
- Lightning interoperability depends on compliance with these specifications.
- The BOLTs allow LND, Core Lightning and Eclair to talk to one another.

## Limits and confusions

A specification can define optional features or evolve before every piece of software supports them. Publishing a text and widespread deployment are distinct.

## Further reading

- [[lightning-network.en|Understanding Lightning]] — to place this mechanism in context.
- [[bitcoin-improvement-proposal.en|BIP proposals]] — to place this mechanism in context.

## References

- PlanB lnp202 — Set up Your First Lightning Node
