---
type: "project_note"
id: "secondary-bitcoin-preimage-resistance"
title: "Preimage resistance"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Preimage Resistance", "La résistance à la préimage"]
parent_ids: ["cryptographic-hash-function"]
related_ids: ["cryptographic-hash-function"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp302 — Modern Cryptography Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Preimage resistance

## Questions covered

- Can data be recovered from its hash?

## Short answer

Preimage resistance makes it impractical to find an input that produces a given hash.

## Explanation

- It protects commitments and certain password constructions.
- It depends on the output size and the design of the hash.
- It differs from collision resistance.
- Bitcoin relies on this property in several contexts.

## Limits and confusions

A small set of predictable inputs can still be tested; hashing does not turn a weak password into a strong secret.

## Further reading

- [[cryptographic-hash-function.en|The cryptographic hash]] — back to the basic concept.

## References

- PlanB cyp302 — Modern Cryptography Fundamentals
