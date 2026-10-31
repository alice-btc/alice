---
type: "project_note"
id: "btcpay-server"
title: "Understanding BTCPay Server"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Uses and comparisons"]
aliases: ["BTCPay Server", "Comprendre BTCPay Server"]
parent_ids: []
related_ids: ["bitcoin-payments-for-merchants", "lightning-node-backup", "secondary-bitcoin-btcpay-extended-public-key", "secondary-bitcoin-btcpay-hardware-wallet-integration", "secondary-bitcoin-btcpay-hot-wallet", "secondary-bitcoin-btcpay-invoices", "secondary-bitcoin-btcpay-security", "secondary-bitcoin-self-hosted-payment-processor"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc102 — Getting your first bitcoins"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Understanding BTCPay Server

## Questions covered

- What is a self-hosted payment server for?

## Short answer

BTCPay Server is open-source software for accepting Bitcoin payments, in particular on-chain and Lightning. It can be self-hosted to keep more control over the merchant infrastructure.

## Explanation

The software organizes stores, payment requests and their tracking. It can be connected to the components needed to observe the chain and, for Lightning, to suitable infrastructure. Integration with a business can concern a point of sale, a website or invoices.

Controlling the hosting and the keys reduces some dependencies on a custodial processor. It also requires handling updates, availability, access and backups. Delegating part of the hosting does not remove the need to understand who sees the data and who controls the funds.

## Limits and confusions

Open-source software does not eliminate all costs. Hosting, network, Lightning liquidity or third-party services may be charged. Nor is it enough to ensure the accounting compliance of each activity.

The available features depend on the configuration and the version. This note is neither a deployment guide nor a test of a given installation. For a procedure, start from the documentation matching the environment actually in use.

## Further reading

- [[bitcoin-payments-for-merchants.en|Accepting a Bitcoin payment]] — prepare the merchant flow
- [[lightning-node-backup.en|Lightning backups]] — understand Lightning backup responsibilities

- [[secondary-bitcoin-btcpay-extended-public-key.en|Receiving with an extended public key in BTCPay]].
- [[secondary-bitcoin-btcpay-hardware-wallet-integration.en|Signing BTCPay spends with a dedicated device]].
- [[secondary-bitcoin-btcpay-hot-wallet.en|Private keys on a BTCPay server]].
- [[secondary-bitcoin-btcpay-invoices.en|BTCPay invoices]].
- [[secondary-bitcoin-btcpay-security.en|Securing a BTCPay installation]].
- [[secondary-bitcoin-self-hosted-payment-processor.en|Self-hosting your payment processing]].

## References

- PlanB btc102 — Getting your first bitcoins (reference from the source note, not re-consulted directly for this adaptation).
