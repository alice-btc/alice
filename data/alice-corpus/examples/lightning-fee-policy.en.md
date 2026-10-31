---
type: "project_note"
id: "lightning-fee-policy"
title: "Lightning fees"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Lightning Fee Policy", "Les frais Lightning"]
parent_ids: []
related_ids: ["lightning-routing", "lightning-service-provider"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB lnp404 — Navigating Your Node with Terminal"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Lightning fees

## Questions covered

- Why can a Lightning payment have fees?

## Short answer

Lightning fees notably pay the intermediaries that route a payment. A routing policy often combines a fixed part and a part proportional to the amount forwarded.

## Explanation

The proportional part is commonly expressed in parts per million, or ppm. The wallet evaluates the fees of the possible paths and presents a cost or a limit before paying. Each channel traversed can have its own policy.

For an operator, these rates also serve to manage the scarcity of their liquidity. High prices can reduce traffic; prices that are too low can under-compensate the resources committed. Routing revenue has to be compared with the costs of opening, closing, rebalancing and operating.

## Limits and confusions

Lightning does not impose a universal, constant charge per payment. Routing fees are distinct from the fees of a custodial service, a conversion or a channel opened on demand.

Positive fee revenue does not prove that a node is profitable. A policy that works on one set of channels can fail elsewhere. Alice can explain the calculation and the trade-offs without promising passive income.

## Further reading

- [[lightning-routing.en|Routing a payment]] — understanding how fees add up along a route
- [[lightning-service-provider.en|Lightning service providers]] — identifying the fees of additional services

## References

- PlanB lnp404 — Navigating Your Node with Terminal (reference from the source note, not re-consulted directly for this adaptation).
