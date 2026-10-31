---
type: "project_note"
id: "outbound-liquidity"
title: "Sending capacity"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Outbound Liquidity", "La capacité d’envoi"]
parent_ids: []
related_ids: ["lightning-liquidity-path", "lightning-routing"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB lnp202 — Set up Your First Lightning Node"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Sending capacity

## Questions covered

- How much can I send through a channel?

## Short answer

Outbound liquidity is the capacity to send sats through your Lightning channels. It depends on the funds available on your side, and then on the routes that reach the recipient.

## Explanation

Funding a channel generally gives sending capacity to the party that provides the funds. When they pay, the split moves toward the peer; when they receive, funds come back to their side. The channel's total capacity can stay the same during these exchanges.

The gross local share must be distinguished from the amount that can actually be sent. Channel reserves, required fees and payments already in flight can limit immediate sending. A wallet may already account for these constraints in what it displays, depending on the indicator chosen.

## Limits and confusions

Having enough funds at the origin does not guarantee that every route has enough liquidity all the way to the recipient. Conversely, a failure does not necessarily mean the funds have disappeared.

The reserve is not a sum confiscated by the other participant. It remains tied to the channel's settlement but limits certain payments while the channel is open. For a real operation, use the sendable amount indicated by the software and examine the fee estimate.

## Further reading

- [[lightning-liquidity-path.en|Lightning liquidity and payment paths]] — liquidity and paths — distinguishing local funds from availability
- [[lightning-routing.en|Routing a payment]] — understanding intermediate routes

## References

- PlanB lnp202 — Set up Your First Lightning Node (reference from the source note, not re-consulted directly for this adaptation).
