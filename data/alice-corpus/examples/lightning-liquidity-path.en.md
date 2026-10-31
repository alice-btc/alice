---
type: "project_note"
id: "lightning-liquidity-path"
title: "Lightning liquidity and payment paths"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["liquidité entrante", "liquidité sortante", "route", "Liquidité et chemins de paiement Lightning"]
parent_ids: ["lightning-network"]
related_ids: ["lightning-splicing"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/lightning/bolts/blob/master/02-peer-protocol.md", "https://github.com/lightning/bolts/blob/master/07-routing-gossip.md", "https://docs.corelightning.org/reference/listpeerchannels", "https://docs.lightning.engineering/the-lightning-network/multihop-payments/hash-time-lock-contract-htlc"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Lightning liquidity and payment paths

## Questions covered

- Why does a payment fail when I have enough sats?
- Why is the total capacity not enough?

## Short answer

A payment requires usable liquidity in the right direction, on 1 or several paths depending on the payment mode. A sufficient total balance does not guarantee that such a path exists.

## Explanation

To send, funds must be able to leave from your side. To receive, the peer that shares a channel with the wallet must be able to move funds from its side to that wallet. This possibility is the inbound liquidity. The share held by the peer does not necessarily match the amount that can be fully received, because the channel's reserves and limits also come into play. Each hop adds its own constraints, including fees and accepted limits. The network's public information does not reveal the exact balances of all channels.

The total amount of the channel, the share belonging to each participant and the amount currently sendable must be distinguished. The channel reserve requires keeping a minimum of one's share in the channel, so that funds remain exposed to a penalty if an old, revoked state is published. It can therefore reduce the sendable amount without removing those funds from the participant's share. Payments in flight, HTLC limits and certain fee provisions can also come into play.

Core Lightning provides separate indicators. `total_msat` represents the channel total; `to_us_msat` represents the share that belongs to us; `spendable_msat` estimates the sendable amount. The latter remains an estimate, notably because fees and the state of payments can change. An interface can display a gross balance, an available amount or several indicators. A reserve must not be deducted a second time if it is already taken into account in the amount displayed.

## Limits and confusions

A failure proves neither a loss of funds nor a single liquidity shortfall. It can also come from an expired invoice or an unavailable participant. A payment can also remain pending, with funds temporarily committed in HTLCs. They can be released after a failure or recovered through the procedure provided after expiry, possibly with a close and an on-chain settlement. The duration depends on the timeouts and the state of the channel; waiting does not mean the funds are lost. Diagnosis must start from the information actually known.

The reserve is neither a confiscation nor an amount to transfer to the partner. On closing, the amount recovered depends notably on the last valid state, payments in flight, fees and the type of close; any delays are a separate question. The amount sendable over Lightning and the amount recoverable on-chain are therefore not interchangeable indicators. This note does not presume what a particular wallet displays and does not present a reserve percentage as a universal rule.

## Further reading

- [[lightning-splicing.en|Changing a channel's funds with splicing]] (lightning-splicing) — going deeper into adding or removing funds from the channel.
- [[lightning-network.en|Understanding Lightning]] (lightning-network) — going back to channels and the role of Lightning.

## References

- [BOLT 2, channel protocol](https://github.com/lightning/bolts/blob/master/02-peer-protocol.md).
- [BOLT 7, routing information](https://github.com/lightning/bolts/blob/master/07-routing-gossip.md).
- [Core Lightning, indicators for local share, reserve and sendable amount](https://docs.corelightning.org/reference/listpeerchannels).

- [Lightning Labs, HTLCs, expiry and pending funds](https://docs.lightning.engineering/the-lightning-network/multihop-payments/hash-time-lock-contract-htlc).
