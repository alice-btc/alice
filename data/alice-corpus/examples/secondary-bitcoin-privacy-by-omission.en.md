---
type: "project_note"
id: "secondary-bitcoin-privacy-by-omission"
title: "Privacy by publishing less data"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Privacy by Omission", "La confidentialité par réduction des données publiées"]
parent_ids: ["lightning-privacy-tradeoff", "non-blockchain-privacy-leaks"]
related_ids: ["lightning-privacy-tradeoff", "non-blockchain-privacy-leaks"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro101 — Bitcoin Development Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Privacy by publishing less data

## Questions covered

- Why can not publishing every payment improve privacy?

## Short answer

One way to preserve privacy is to avoid publishing every payment detail on the chain. Intermediate Lightning payments stay out of that public ledger.

## Explanation

- Lightning can reduce the information written to the blockchain for intermediate payments.
- Less public data can improve both scalability and privacy.
- This approach often depends on off-chain or client-side protocols.
- It does not remove all network or application metadata.

## Limits and confusions

Participants, service providers or network observers may still hold metadata.

## Further reading

- [[lightning-privacy-tradeoff.en|Privacy on Lightning]] — back to the basic concept.
- [[non-blockchain-privacy-leaks.en|Leaks outside the blockchain]] — back to the basic concept.

## References

- PlanB pro101 — Bitcoin Development Fundamentals
