---
type: "project_note"
id: "bitcoin-payments-for-merchants"
title: "Accepting a Bitcoin payment"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Uses and comparisons"]
aliases: ["Bitcoin Payments for Merchants", "Accepter un paiement Bitcoin"]
parent_ids: []
related_ids: ["btcpay-server", "unit-of-account", "secondary-bitcoin-bitcoin-circular-economy", "secondary-bitcoin-bitcoin-payment-conversion-policy", "secondary-bitcoin-btc-map", "secondary-bitcoin-btcpay-invoices", "secondary-bitcoin-exchange-rate-risk", "secondary-bitcoin-self-hosted-payment-processor"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://docs.btcpayserver.org/BTCPayVsOthers/"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Accepting a Bitcoin payment

## Questions covered

- Which questions should a merchant ask themselves?

## Short answer

A merchant can accept Bitcoin directly or through a provider, on-chain or via Lightning. Making it work requires organizing the price, the reception, the tracking and any refunds.

## Explanation

The merchant first chooses who controls the funds and whether to keep them in BTC or convert them. They then need to define the lifetime of an invoice, the expected amount and the conditions under which the payment is considered received. On Lightning, availability and inbound liquidity matter; on-chain, confirmations and fees come into play.

Costs can include network, hosting, liquidity, conversion and the provider's commission. BTCPay Server is an example of software with no software processing commission, but the infrastructure and operations can still cost.

## Limits and confusions

"Accepting Bitcoin" does not mean that all solutions have the same custody model or the same fees. Automatic conversion can make some uses easier while adding an intermediary.

Invoicing and accounting obligations depend on the jurisdiction and the activity. Keeping the amount, the date, the fees and the rate used may be necessary, but no generic list replaces checking the applicable framework.

## Further reading

- [[btcpay-server.en|Understanding BTCPay Server]] — understand an invoicing infrastructure
- [[unit-of-account.en|The unit of account]] — separate the displayed price from the asset received

- [[secondary-bitcoin-bitcoin-circular-economy.en|Bitcoin circular economies]].
- [[secondary-bitcoin-bitcoin-payment-conversion-policy.en|Keeping or converting payments received]].
- [[secondary-bitcoin-btc-map.en|Finding merchants with BTC Map]].
- [[secondary-bitcoin-btcpay-invoices.en|BTCPay invoices]].
- [[secondary-bitcoin-exchange-rate-risk.en|Exchange-rate risk during a payment]].
- [[secondary-bitcoin-self-hosted-payment-processor.en|Self-hosting your payment processing]].

## References

- [BTCPay Server, comparison of payment models](https://docs.btcpayserver.org/BTCPayVsOthers/).
