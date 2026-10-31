---
type: "project_note"
id: "satoshi"
title: "Understanding satoshis"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["fundamentals"]
aliases: ["Satoshi", "Comprendre les satoshis"]
parent_ids: []
related_ids: ["transaction-fees", "bitcoin-network-vs-asset", "satoshi-nakamoto"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc102 — Getting your first bitcoins"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Understanding satoshis

## Questions covered

- Can one hold less than 1 bitcoin?

## Short answer

The satoshi, abbreviated sat, is a unit of bitcoin. 1 BTC is worth 100,000,000 sats. It is therefore not necessary to hold 1 whole bitcoin to use Bitcoin.

## Explanation

An amount of 0.001 BTC corresponds to 100,000 sats. Changing the display unit changes neither the funds held nor their value. It is comparable to displaying a sum in euros or in cents.

Sats make small amounts more readable and are common in payment interfaces. They are also used to express fees. A total amount in sats must then be distinguished from a rate in sats per unit of transaction size. The wallet converts the units, but the user needs to know which one they are reading.

## Limits and confusions

The satoshi is the smallest unit of amount on the base layer. Other layers can use finer accounting units internally. A fee rate is not the total cost of a payment. Depending on the context, the word "satoshi" can also refer to the pseudonym of Bitcoin's creator.

## Further reading

- [[transaction-fees.en|Transaction fees]].
- [[bitcoin-network-vs-asset.en|Bitcoin, network and currency]].
- [[satoshi-nakamoto.en|Satoshi Nakamoto]].

## References

- PlanB btc102 — Getting your first bitcoins.
