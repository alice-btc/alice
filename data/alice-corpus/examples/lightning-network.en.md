---
type: "project_note"
id: "lightning-network"
title: "Understanding Lightning"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Lightning", "réseau Lightning", "Comprendre Lightning"]
parent_ids: []
related_ids: ["lightning-liquidity-path", "lightning-splicing", "secondary-lightning-bolts", "secondary-lightning-lightning-node-implementation", "secondary-lightning-nostr-wallet-connect", "secondary-tx-model-transaction-malleability"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/lightning/bolts/blob/master/02-peer-protocol.md", "https://github.com/lightning/bolts/blob/master/04-onion-routing.md", "https://github.com/lnbook/lnbook/blob/develop/01_introduction.asciidoc", "https://github.com/lightningnetwork/lnd/blob/master/docs/recovery.md", "https://docs.corelightning.org/docs/recovery", "https://github.com/lightning/bolts/blob/master/03-transactions.md"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Understanding Lightning

## Questions covered

- Why use Lightning rather than the base layer?
- Is a direct channel with every recipient needed?

## Short answer

Lightning is a network of payment channels built on top of Bitcoin. Payments can flow through it without each one being recorded in a new block. They can thus settle in a few seconds with low fees, which is useful for frequent or small payments.

## Explanation

Participants update their commitments in the channels. A payment can pass through several intermediaries, on 1 or several suitable paths. A direct channel with every recipient is therefore not necessary. The Bitcoin chain is still used, notably to establish or settle channels.

## Limits and confusions

Speed and fees depend on the situation. Availability, liquidity and the service's custody model matter. Lightning offers neither unlimited capacity nor guaranteed receiving.

In self-custody, the required backups depend on the software. The recovery phrase alone is not always enough to recover the funds in open channels; LND and Core Lightning provide specific data and procedures. Reusing an old state and then publishing a revoked transaction can lead to a penalty.

A force close can make some funds unavailable for a delay expressed in blocks, possibly several days. This delay depends on the channel, the output and the type of close; it does not apply uniformly to all funds.

## Further reading

- [[lightning-splicing.en|Changing a channel's funds with splicing]] (lightning-splicing) — going deeper into adding or removing funds from the channel.
- [[lightning-liquidity-path.en|Lightning liquidity and payment paths]] (lightning-liquidity-path) — understanding why a payment can fail despite an available balance.

- [[secondary-lightning-bolts.en|The BOLT specifications of Lightning]].
- [[secondary-lightning-lightning-node-implementation.en|Lightning implementations]].
- [[secondary-lightning-nostr-wallet-connect.en|Nostr Wallet Connect connections]].
- [[secondary-tx-model-transaction-malleability.en|Transaction malleability]].

## References

- [BOLT 2, channel protocol](https://github.com/lightning/bolts/blob/master/02-peer-protocol.md).

- [BOLT 4, routed payments and fragments](https://github.com/lightning/bolts/blob/master/04-onion-routing.md).

- [Mastering the Lightning Network, uses and fast payments](https://github.com/lnbook/lnbook/blob/develop/01_introduction.asciidoc).

- [LND, backups and recovery](https://github.com/lightningnetwork/lnd/blob/master/docs/recovery.md).

- [Core Lightning, recovery and precautions about old states](https://docs.corelightning.org/docs/recovery).

- [BOLT 3, closing outputs and delays](https://github.com/lightning/bolts/blob/master/03-transactions.md).
