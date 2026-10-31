---
type: "project_note"
id: "lightning-splicing"
title: "Changing a channel's funds with splicing"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["splicing", "splice-in", "splice-out", "Modifier les fonds d’un canal avec le splicing"]
parent_ids: ["lightning-channel", "lightning-liquidity", "lightning-network"]
related_ids: ["lightning-liquidity-path"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://docs.corelightning.org/reference/splice_init", "https://github.com/ACINQ/eclair/blob/master/docs/release-notes/eclair-v0.14.0.md", "https://docs.corelightning.org/reference/lightningd-config"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Changing a channel's funds with splicing

## Questions covered

- How can a channel's capacity be increased without closing it completely?
- What is the difference between splice-in and splice-out?
- Is receiving a Bitcoin payment enough to fund a channel?
- Does splicing solve every liquidity problem?

## Short answer

Splicing changes the funds of an existing Lightning channel using a Bitcoin transaction coordinated with the channel partner. A splice-in adds funds; a splice-out removes some to an on-chain output. The participants' software must support a compatible version of the mechanism.

## Explanation

A splicing transaction replaces the channel's funding. It makes it possible to change the capacity without a complete close followed by a new open. It requires on-chain fees and coordination between the participants.

When you bring your own funds through a splice-in, you increase your local liquidity, and so your capacity to send once those funds are usable. This does not automatically add funds on your partner's side and does not guarantee that you will be able to receive more.

A Bitcoin payment received in your on-chain wallet can provide funds for a splice-in. Merely receiving it does not automatically change the channel. Some wallets can arrange this operation for the user; that behavior depends on the product.

A splice-out makes it possible to move part of the channel's funds to a Bitcoin address. It reduces the funds left in the channel and can change its useful capacity.

## Limits and confusions

- Total capacity and the liquidity available in each direction remain 2 different notions.
- Splicing does not guarantee the liquidity of the other channels along a payment path.
- Fees, confirmations and behavior during the transition depend on the software and its configuration. The Eclair 0.14.0 documentation describes the use of added funds after confirmation. The Core Lightning documentation also describes limits on the usable balance while waiting; an immediately available amount must not be promised everywhere.
- Old prototypes and the standardized versions are not necessarily compatible. Check the versions of both participants.
- This note explains the mechanism. It does not confirm that it is enabled in Alice or in the user's own node.

## Further reading

- [[lightning-liquidity-path.en|Lightning liquidity and payment paths]] (lightning-liquidity-path) — understanding why increasing 1 channel does not guarantee a usable path.
- [[lightning-network.en|Understanding Lightning]] (lightning-network) — going back to the general introduction.

## References

- [Core Lightning, initiating a splice](https://docs.corelightning.org/reference/splice_init) for adding or removing funds, fees and the peer support conditions.
- [Eclair 0.14.0, release notes](https://github.com/ACINQ/eclair/blob/master/docs/release-notes/eclair-v0.14.0.md) for splice-in, splice-out, confirmations and compatibility with old prototypes.
- [Core Lightning, configuration](https://docs.corelightning.org/reference/lightningd-config) for the limits during the transition. The historical experimental-splicing section is marked as deprecated from 26.04; it must not become a current enabling instruction.
