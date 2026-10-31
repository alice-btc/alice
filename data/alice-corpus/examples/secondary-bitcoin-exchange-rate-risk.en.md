---
type: "project_note"
id: "secondary-bitcoin-exchange-rate-risk"
title: "Exchange-rate risk during a payment"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Exchange Rate Risk", "Le risque de change lors d’un paiement"]
parent_ids: ["bitcoin-payments-for-merchants", "bitcoin-volatility"]
related_ids: ["bitcoin-payments-for-merchants", "bitcoin-volatility"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pos305 — Mastering BTC Pay Server"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Exchange-rate risk during a payment

## Questions covered

- Can the price change between the invoice and the conversion of the bitcoins?

## Short answer

The price of bitcoin can change between the quote, the payment and any later conversion; an expiring invoice limits how long a quoted rate stays valid.

## Explanation

- A merchant can set prices in a currency and compute the amount of BTC requested at the time of the invoice.
- After the payment is received, the value of the BTC kept continues to fluctuate against that currency.

## Limits and confusions

The invoice expiry does not stabilize the value of bitcoins already received.

## Further reading

- [[bitcoin-payments-for-merchants.en|Accepting a Bitcoin payment]] — back to the basic concept.
- [[bitcoin-volatility.en|Bitcoin's volatility]] — back to the basic concept.

## References

- PlanB pos305 — Mastering BTC Pay Server
