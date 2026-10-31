---
type: "project_note"
id: "secondary-bitcoin-cryptographic-commitment"
title: "Cryptographic commitments"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Cryptographic Commitment", "Les engagements cryptographiques"]
parent_ids: ["cryptographic-hash-function", "liquid-network"]
related_ids: ["cryptographic-hash-function", "liquid-network"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB sid302 — Liquid Bootcamp Essentials"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Cryptographic commitments

## Questions covered

- How can you commit to a value without revealing it right away?

## Short answer

A cryptographic commitment makes it possible to fix a value while keeping it hidden, then to demonstrate later which value had been chosen.

## Explanation

- It combines a hiding property and a binding property.
- Pedersen commitments are one form used in confidential transactions.
- This primitive makes it possible to verify constraints without revealing the raw data.

## Limits and confusions

The exact hiding and binding properties depend on the construction.

## Further reading

- [[cryptographic-hash-function.en|The cryptographic hash]] — back to the basic concept.
- [[liquid-network.en|Understanding Liquid]] — back to the basic concept.

## References

- PlanB sid302 — Liquid Bootcamp Essentials
