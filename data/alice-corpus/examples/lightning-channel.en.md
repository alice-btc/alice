---
type: "project_note"
id: "lightning-channel"
title: "Lightning channels"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Lightning Channel", "Les canaux Lightning"]
parent_ids: []
related_ids: ["lightning-liquidity-path", "lightning-splicing", "secondary-bitcoin-dual-funded-channels", "secondary-lightning-commitment-transaction", "secondary-lightning-lightning-private-channel", "secondary-lightning-lightning-public-channel", "secondary-lightning-revocation-key"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/lightning/bolts/blob/master/02-peer-protocol.md"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Lightning channels

## Questions covered

- What is a payment channel?

## Short answer

A Lightning channel lets 2 nodes exchange payments by updating the split of bitcoin committed on the chain. Each payment does not require a new public Bitcoin transaction.

## Explanation

The total capacity represents the funds committed in the channel. At any given moment, a share belongs to each participant. A payment shifts this split and new signed commitments replace the previous ones. On closing, settlement returns to the Bitcoin chain.

The amount that can be sent is not simply the total capacity. It depends on which side the funds are on, on reserves and on payments in flight. A series of payments in both directions can move a cumulative volume far greater than the initial capacity. A channel also serves as a hop for routing payments to other nodes.

## Limits and confusions

A reserve remains in its owner's share but can limit sending as long as the channel is open. It is not a confiscated amount. The "balance" label displayed depends on the software.

Opening confirmations, fees and closing conditions remain important. Adding funds through splicing, when the software allows it, requires a coordinated operation; an arbitrary on-chain payment is not enough.

## Further reading

- [[lightning-liquidity-path.en|Lightning liquidity and payment paths]] — liquidity and paths — going deeper into the constraints
- [[lightning-splicing.en|Changing a channel's funds with splicing]] — splicing — changing the channel capacity

- [[secondary-bitcoin-dual-funded-channels.en|Channels funded by both participants]].
- [[secondary-lightning-commitment-transaction.en|Lightning commitment transactions]].
- [[secondary-lightning-lightning-private-channel.en|Unannounced Lightning channels]].
- [[secondary-lightning-lightning-public-channel.en|Announced Lightning channels]].
- [[secondary-lightning-revocation-key.en|Reacting to a revoked channel state]].

## References

- [Verification reference 1](https://github.com/lightning/bolts/blob/master/02-peer-protocol.md).
