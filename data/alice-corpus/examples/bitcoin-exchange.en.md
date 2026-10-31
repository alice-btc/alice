---
type: "project_note"
id: "bitcoin-exchange"
title: "The role of exchanges"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Uses and comparisons"]
aliases: ["Bitcoin Exchange", "Le rôle des plateformes d’échange"]
parent_ids: []
related_ids: ["counterparty-risk", "p2p-bitcoin-acquisition"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc102 — Getting your first bitcoins"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The role of exchanges

## Questions covered

- What is an exchange for?

## Short answer

An exchange makes it easier to buy and sell bitcoin against a currency or another asset. It may also hold the funds, but the exchange function and the custody function are distinct.

## Explanation

A centralized service often combines a user account, market orders and an internal balance. Trades between customers do not necessarily correspond to as many on-chain payments. Withdrawing to an address controlled by the user is a separate operation.

To understand the costs, look at the commissions, the spread between buy and sell prices, withdrawal fees and any conversion fees. Liquidity also influences the price actually obtained. Identity collection and access conditions vary by service.

## Limits and confusions

A visible balance does not by itself demonstrate that funds are available for all withdrawals. The user depends on the solvency, security and decisions of the operator as long as the operator holds the keys.

A P2P or non-custodial service reduces some dependencies but can add other constraints. Alice must not rank exchanges solely by their popularity, nor present a service as safe without examining its structure and its current conditions.

## Further reading

- [[counterparty-risk.en|Counterparty risk]] — understand custody risk
- [[p2p-bitcoin-acquisition.en|Peer-to-peer trades]] — compare person-to-person exchange

## References

- PlanB btc102 — Getting your first bitcoins (reference from the source note, not re-consulted directly for this adaptation).
