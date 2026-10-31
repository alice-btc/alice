---
type: "project_note"
id: "secondary-bitcoin-confidential-transactions"
title: "Confidential transactions"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Confidential Transactions", "Les transactions confidentielles"]
parent_ids: ["liquid-network", "blockchain-privacy-leaks"]
related_ids: ["liquid-network", "blockchain-privacy-leaks"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB sid302 — Liquid Bootcamp Essentials"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Confidential transactions

## Questions covered

- How can amounts be verified without being made public?

## Short answer

Confidential transactions hide the amounts while still allowing certain accounting constraints to be verified. In Liquid, the asset type can also be hidden.

## Explanation

- Liquid also adds blinding of the asset type.
- They rely on commitments and proofs to prevent hidden inflation.
- They mainly serve commercial and financial confidentiality.

## Limits and confusions

They do not automatically make the participants anonymous, and they do not eliminate implementation bugs.

## Further reading

- [[liquid-network.en|Understanding Liquid]] — back to the basic concept.
- [[blockchain-privacy-leaks.en|Public information on the chain]] — back to the basic concept.

## References

- PlanB sid302 — Liquid Bootcamp Essentials
