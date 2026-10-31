---
type: "project_note"
id: "lightning-liquidity"
title: "Channel liquidity"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Lightning Liquidity", "La liquidité d’un canal"]
parent_ids: []
related_ids: ["lightning-liquidity-path", "inbound-liquidity", "outbound-liquidity", "lightning-splicing", "secondary-bitcoin-dual-funded-channels", "secondary-lightning-submarine-swap"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB lnp201 — Lightning Network Theory"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Channel liquidity

## Questions covered

- Why is having a balance not always enough to pay or receive?

## Short answer

Lightning liquidity is the effective capacity to send or receive. It depends on how funds are distributed across channels and on the existence of a usable path to the recipient.

## Explanation

A large total capacity is not enough. To send, usable funds are needed on the local side; to receive, funds must be able to come from the remote side. A payment changes this distribution.

Routing adds another condition. Each hop along the path must let the requested amount through, in the right direction. The wallet can look for another route or split a payment if the software allows it. Inbound channels, swaps or rebalancing can help manage these constraints, with their own costs and conditions.

## Limits and confusions

Your share in a channel, the amount you can send and the balance a wallet displays are not necessarily the same indicator. Reserves and payments in flight can reduce immediate availability without removing ownership of those funds.

In a custodial wallet, the operator often hides this management. The user then sees a claim on the service, which changes the custody model.

## Further reading

- [[lightning-liquidity-path.en|Lightning liquidity and payment paths]] — liquidity and paths — distinguishing reserves, balance and capacity
- [[inbound-liquidity.en|Receiving capacity]] — understanding receiving
- [[outbound-liquidity.en|Sending capacity]] — understanding sending

- [[lightning-splicing.en|Changing a channel's funds with splicing]].
- [[secondary-bitcoin-dual-funded-channels.en|Channels funded by both participants]].
- [[secondary-lightning-submarine-swap.en|Moving between Bitcoin and Lightning with a swap]].

## References

- PlanB lnp201 — Lightning Network Theory (reference from the source note, not re-consulted directly for this adaptation).
