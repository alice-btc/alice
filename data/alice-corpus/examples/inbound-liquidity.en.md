---
type: "project_note"
id: "inbound-liquidity"
title: "Receiving capacity"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Inbound Liquidity", "Lightning Inbound Liquidity Market", "La capacité de réception"]
parent_ids: []
related_ids: ["lightning-liquidity-path", "lightning-service-provider", "secondary-lightning-just-in-time-lightning-channel"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB lnp201 — Lightning Network Theory"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Receiving capacity

## Questions covered

- Why can I not receive this amount?

## Short answer

Inbound liquidity is the capacity to receive on Lightning. Funds located on the remote side of your channels must be able to be transferred to you.

## Explanation

When you fund a new channel on your own, the funds are mostly on your side. This gives sending capacity, but not automatically an equivalent receiving capacity. After an outgoing payment, part of the liquidity sits with your peer and can allow a later receipt.

Inbound capacity can also be obtained through a channel funded by another participant, a liquidity service or certain swap operations. These mechanisms have fees and dependencies that need to be understood. Receiving also requires a usable route to your channels.

## Limits and confusions

The theoretical sum of inbound capacities does not guarantee that a specific payment will go through. The distribution across channels and the constraints on routes matter. A multi-part payment can help without resolving every blockage.

A custodial service can handle all of this for the user; that simplicity does not demonstrate that the user holds the keys themselves. Liquidity management must be distinguished from custody of the funds.

## Further reading

- [[lightning-liquidity-path.en|Lightning liquidity and payment paths]] — liquidity and paths — seeing the constraints on receiving
- [[lightning-service-provider.en|Lightning service providers]] — understanding the help of a liquidity provider

- [[secondary-lightning-just-in-time-lightning-channel.en|Channels opened on demand]].

## References

- PlanB lnp201 — Lightning Network Theory (reference from the source note, not re-consulted directly for this adaptation).
