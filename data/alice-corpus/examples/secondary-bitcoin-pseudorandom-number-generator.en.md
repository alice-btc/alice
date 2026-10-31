---
type: "project_note"
id: "secondary-bitcoin-pseudorandom-number-generator"
title: "Cryptographic pseudorandom number generators"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Pseudorandom Number Generator", "Les générateurs pseudo-aléatoires cryptographiques"]
parent_ids: ["entropy", "bitcoin-private-key"]
related_ids: ["entropy", "bitcoin-private-key"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp302 — Modern Cryptography Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Cryptographic pseudorandom number generators

## Questions covered

- Can a pseudorandom generator be used to create keys?

## Short answer

A cryptographic pseudorandom number generator expands a secret state into values that are unpredictable to an attacker. The quality of its seeding is essential.

## Explanation

- It must be suitable for cryptographic use, not only for statistical use.
- The seed must have enough entropy.
- Predictable outputs can reveal keys or nonces.
- It is different from a non-secure pseudorandom generator used for simulations.

## Limits and confusions

A generator that is statistically satisfactory is not necessarily suitable for Bitcoin keys.

## Further reading

- [[entropy.en|The randomness keys need]] — back to the basic concept.
- [[bitcoin-private-key.en|The private key]] — back to the basic concept.

## References

- PlanB cyp302 — Modern Cryptography Fundamentals
