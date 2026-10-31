---
type: "project_note"
id: "secondary-lightning-revocation-key"
title: "Reacting to a revoked channel state"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Revocation Key", "Réagir à un état de canal révoqué"]
parent_ids: ["lightning-channel", "watchtower"]
related_ids: ["lightning-channel", "watchtower"]
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
# Reacting to a revoked channel state

## Questions covered

- Reacting to a revoked channel state — what is the mechanism and what are its limits?

## Short answer

The revocation key is a mechanism that makes it possible to punish the publication of an old Lightning channel state. When a new state is accepted, the old one is revoked by revealing data that lets the other party recover the funds if that old state is published.

## Explanation

- It solves the problem of a partner who would try to publish a more favorable but outdated state.
- It works with timelocks that leave time to react.
- It requires users or their services to monitor the chain.
- It justifies the existence of watchtowers in some models.

## Limits and confusions

The ability to penalize a revoked state depends on detecting it and on the response being confirmed in time. It does not remove the constraints of monitoring and fees.

## Further reading

- [[lightning-channel.en|Lightning channels]] — to place this mechanism in context.
- [[watchtower.en|The role of a watchtower]] — to place this mechanism in context.

## References

- PlanB lnp201 — Lightning Network Theory
