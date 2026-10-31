---
type: "project_note"
id: "secondary-bitcoin-btcpay-hot-wallet"
title: "Private keys on a BTCPay server"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["BTCPay Hot Wallet", "Les clés privées sur un serveur BTCPay"]
parent_ids: ["btcpay-server", "hot-wallet"]
related_ids: ["btcpay-server", "hot-wallet"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pos305 — Mastering BTC Pay Server"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Private keys on a BTCPay server

## Questions covered

- What risk does a wallet connected to the merchant server add?

## Short answer

A wallet with private keys on the server can automate spending, but it exposes the funds to a compromise of that infrastructure.

## Explanation

- Keys on the server make automation easier but widen the impact of a compromised account or server.
- An architecture with no private keys on the server limits that spending power, at the cost of extra signing steps.

## Limits and confusions

The risk depends on access, backups and permissions; a "small amount" does not make a server safe.

## Further reading

- [[btcpay-server.en|Understanding BTCPay Server]] — back to the basic concept.
- [[hot-wallet.en|Hot wallets]] — back to the basic concept.

## References

- PlanB pos305 — Mastering BTC Pay Server
