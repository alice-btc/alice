---
type: "project_note"
id: "address-reuse"
title: "Address reuse"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Address Reuse", "La réutilisation des adresses"]
parent_ids: []
related_ids: ["hd-wallet", "silent-payments", "address-spoofing", "secondary-privacy-bip47-reusable-payment-codes"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc204 — Privacy on Bitcoin", "PlanB Extraction — 2026-05-24 — Glossary"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Address reuse

## Questions covered

- Why avoid reusing an address?

## Short answer

Reusing an address for several incoming payments makes it easy to link those payments to the same identifier. This can reveal a history to people who only knew about a single interaction.

## Explanation

A customer or a donor who knows an address can observe the other transactions associated with it. An HD wallet makes it possible to create new addresses without creating a new backup secret for each one.

Keeping addresses separate limits this immediate grouping. Reusable receiving mechanisms, such as Silent Payments, also try to avoid always publishing the same destination on-chain, with their own support constraints.

## Limits and confusions

A new address does not erase the other links. Spending several funds together, or sending information to a server, can still reveal their relationship. An old address does not automatically become invalid after use; the question is mostly one of privacy. Address rotation does not, on its own, protect against clipboard substitution.

## Further reading

- [[hd-wallet.en|Deterministic wallets]].
- [[silent-payments.en|Understanding Silent Payments]].
- [[address-spoofing.en|Address substitution]].

- [[secondary-privacy-bip47-reusable-payment-codes.en|BIP47 reusable payment codes]].

## References

- PlanB btc204 — Privacy on Bitcoin.
- PlanB Extraction — 2026-05-24 — Glossary.
