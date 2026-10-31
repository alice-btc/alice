---
type: "project_note"
id: "secondary-lightning-just-in-time-lightning-channel"
title: "Channels opened on demand"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Just-in-Time Lightning Channel", "Les canaux ouverts à la demande"]
parent_ids: ["lightning-service-provider", "inbound-liquidity"]
related_ids: ["lightning-service-provider", "inbound-liquidity"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB dev303 — Learning Rust with Bitcoin"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Channels opened on demand

## Questions covered

- Channels opened on demand — what is the mechanism and what are its limits?

## Short answer

A Lightning service can offer to open a channel at the moment a payment needs to be received and inbound capacity is lacking. This just-in-time approach shifts part of liquidity management to the service.

## Explanation

- The opening responds to a concrete need to receive.
- The service can automate operations the user would otherwise have prepared.
- The conditions on fees, confirmation and availability have to be specified by the implementation.

## Limits and confusions

The opening involves fees and conditions specific to the service. Accepting before confirmation adds distinct assumptions; the user still needs to understand the custody model.

## Further reading

- [[lightning-service-provider.en|Lightning service providers]] — to place this mechanism in context.
- [[inbound-liquidity.en|Receiving capacity]] — to place this mechanism in context.

## References

- PlanB dev303 — Learning Rust with Bitcoin
