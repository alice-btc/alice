---
type: "project_note"
id: "secondary-lightning-lightning-node-implementation"
title: "Lightning implementations"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Lightning Node Implementation", "Les implémentations de Lightning"]
parent_ids: ["lightning-network", "lightning-node-backup"]
related_ids: ["lightning-network", "lightning-node-backup"]
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
# Lightning implementations

## Questions covered

- Lightning implementations — what is the mechanism and what are its limits?

## Short answer

A Lightning implementation is a piece of software that applies the specifications of the Lightning protocol.

## Explanation

- The main implementations include LND, Core Lightning and Eclair.
- They are interoperable because they follow the BOLTs.
- They differ in language, architecture, tooling and target audience.
- The choice of implementation influences backups, APIs, tools and the operator experience.

## Limits and confusions

Optional features, versions and backup procedures differ. Complying with a common base of specifications does not make every piece of software interchangeable.

## Further reading

- [[lightning-network.en|Understanding Lightning]] — to place this mechanism in context.
- [[lightning-node-backup.en|Lightning backups]] — to place this mechanism in context.

## References

- PlanB lnp202 — Set up Your First Lightning Node
