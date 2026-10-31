---
type: "project_note"
id: "exchange-custody-risk"
title: "The risk of leaving funds on an exchange"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["security"]
aliases: ["Exchange Custody Risk", "Le risque de laisser ses fonds à une plateforme"]
parent_ids: []
related_ids: ["custodial-wallet", "self-custody", "kyc-data-leakage"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc102 — Getting your first bitcoins"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The risk of leaving funds on an exchange

## Questions covered

- Which risks remain when a service holds my keys?

## Short answer

When funds stay on an exchange, their availability depends on that intermediary. A displayed balance does not give the user direct control of the corresponding UTXOs.

## Explanation

The exchange can suffer an attack, run short of funds or restrict withdrawals. The technical, economic and regulatory reasons are distinct, but all of them can affect access. Protecting one's password does not resolve the solvency or the obligations of the service.

Self-custody replaces this risk with other responsibilities, notably backing up and securing the keys. Comparing the models therefore requires identifying who can actually spend, and under what conditions the user can recover their funds.

## Limits and confusions

Reputation, a working interface or a partial proof of reserves do not by themselves demonstrate the custodian's whole situation. Identification services also expose personal data. This note describes custody risks; it makes no up-to-date judgement on any specific exchange and does not recommend any financial operation.

## Further reading

- [[custodial-wallet.en|Custodial wallets]].
- [[self-custody.en|Self-custody of keys]].
- [[kyc-data-leakage.en|Exposed identification data]].

## References

- PlanB btc102 — Getting your first bitcoins.
