---
type: "project_note"
id: "secondary-bitcoin-btcpay-hardware-wallet-integration"
title: "Signing BTCPay spends with a dedicated device"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["BTCPay Hardware Wallet Integration", "Signer les dépenses BTCPay avec un appareil dédié"]
parent_ids: ["btcpay-server", "hardware-wallet"]
related_ids: ["btcpay-server", "hardware-wallet"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pos305 — Mastering BTC Pay Server"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Signing BTCPay spends with a dedicated device

## Questions covered

- How can a hardware wallet be used with BTCPay?

## Short answer

A merchant can receive through BTCPay and sign spends with a separate device, in particular by using PSBTs.

## Explanation

- The server can prepare the spending data while the signing keys stay on a separate device.
- The signer must compare the recipients, amounts and fees shown by the device before authorizing the spend.

## Limits and confusions

Check the details on the trusted screen of the signing device; the computer or server may be compromised.

## Further reading

- [[btcpay-server.en|Understanding BTCPay Server]] — back to the basic concept.
- [[hardware-wallet.en|The role of a signing device]] — back to the basic concept.

## References

- PlanB pos305 — Mastering BTC Pay Server
