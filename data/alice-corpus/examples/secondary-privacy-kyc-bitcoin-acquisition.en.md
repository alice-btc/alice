---
type: "project_note"
id: "secondary-privacy-kyc-bitcoin-acquisition"
title: "The traces left by a purchase with identity verification"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["privacy"]
aliases: ["KYC Bitcoin Acquisition", "Les traces laissées par un achat avec identification"]
parent_ids: ["kyc-data-leakage", "utxo-labeling"]
related_ids: ["kyc-data-leakage", "utxo-labeling"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB btc102 — Getting your first bitcoins", "PlanB min304 — Heat your home while mining bitcoins"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The traces left by a purchase with identity verification

## Questions covered

- The traces left by a purchase with identity verification — what is the mechanism and what are its limits?

## Short answer

A KYC bitcoin acquisition goes through a service that verifies the user's identity. It often simplifies buying with fiat, but creates a lasting link between identity, purchase history and potential holdings.

## Explanation

- KYC can make compliance, bank transfers and higher volumes easier.
- It creates sensitive data exposed to leaks, legal requests or commercial use.
- Withdrawing to self-custody does not erase the KYC history.
- Separating KYC and non-KYC UTXOs requires labels and coin control.

## Limits and confusions

Withdrawing funds does not erase the history kept by the service. A purchase without identity collection does not guarantee anonymity either.

## Further reading

- [[kyc-data-leakage.en|Exposed identification data]] — to place this mechanism in context.
- [[utxo-labeling.en|Labeling your UTXOs]] — to place this mechanism in context.

## References

- PlanB btc102 — Getting your first bitcoins
- PlanB min304 — Heat your home while mining bitcoins
