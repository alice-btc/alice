---
type: "project_note"
id: "secondary-lightning-commitment-transaction"
title: "Lightning commitment transactions"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Commitment Transaction", "Les transactions d’engagement Lightning"]
parent_ids: ["lightning-channel", "lightning-force-close"]
related_ids: ["lightning-channel", "lightning-force-close"]
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
# Lightning commitment transactions

## Questions covered

- Lightning commitment transactions — what is the mechanism and what are its limits?

## Short answer

In revocation-based Lightning channels, a commitment transaction represents a state that can be published on Bitcoin to close the channel. Updates replace the usable commitments and make previous states punishable.

## Explanation

- Each participant holds a commitment transaction matching their own perspective.
- Commitments normally stay off-chain as long as the channel is working.
- A force close publishes a commitment on Bitcoin.
- Revocation secrets and time conditions make it possible to react to the publication of a revoked state.

## Limits and confusions

An old state can be published because of an incorrect restore, without any intent to defraud. The reaction depends on the channel type and on the ability to act within the expected time window.

## Further reading

- [[lightning-channel.en|Lightning channels]] — to place this mechanism in context.
- [[lightning-force-close.en|Force closing]] — to place this mechanism in context.

## References

- PlanB lnp201 — Lightning Network Theory
