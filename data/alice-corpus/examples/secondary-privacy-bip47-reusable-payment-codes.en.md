---
type: "project_note"
id: "secondary-privacy-bip47-reusable-payment-codes"
title: "BIP47 reusable payment codes"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["privacy"]
aliases: ["BIP47 Reusable Payment Codes", "Les codes de paiement réutilisables BIP47"]
parent_ids: ["address-reuse", "silent-payments"]
related_ids: ["address-reuse", "silent-payments"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB btc204 — Privacy on Bitcoin"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# BIP47 reusable payment codes

## Questions covered

- How can several payments be received without reusing an address?

## Short answer

BIP47 defines reusable payment codes that make it possible to derive distinct payment addresses between compatible participants.

## Explanation

- BIP47 seeks to solve the practical problem of recurring receipt without address reuse.
- The recipient publishes a payment code, not a single address to be reused.
- The notification transaction introduces a cost and an on-chain footprint.
- PayNym is one of the known uses of this model.

## Limits and confusions

Notifications and usage can leave traces; a reusable code is not to be confused with a reused Bitcoin address.

## Further reading

- [[address-reuse.en|Address reuse]] — to go back to the basic notion.
- [[silent-payments.en|Understanding Silent Payments]] — to go back to the basic notion.

## References

- PlanB btc204 — Privacy on Bitcoin
