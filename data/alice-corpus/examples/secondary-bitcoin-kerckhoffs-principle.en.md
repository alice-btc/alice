---
type: "project_note"
id: "secondary-bitcoin-kerckhoffs-principle"
title: "Kerckhoffs's principle"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Kerckhoffs Principle", "Le principe de Kerckhoffs"]
parent_ids: ["encryption", "software-integrity-verification"]
related_ids: ["encryption", "software-integrity-verification"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp302 — Modern Cryptography Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Kerckhoffs's principle

## Questions covered

- How can a public algorithm remain secure?

## Short answer

According to Kerckhoffs, the security of a cryptographic system must be able to rest on the secrecy of the keys even when the algorithm is public.

## Explanation

- Security must not depend on keeping the algorithm secret.
- Public algorithms can be examined and attacked by the community.
- The secret is concentrated in the keys.
- This principle justifies the open review of modern primitives.

## Limits and confusions

A public algorithm is not automatically secure; it must be analyzed and correctly implemented.

## Further reading

- [[encryption.en|Encryption and signatures]] — back to the basic concept.
- [[software-integrity-verification.en|Verifying a download]] — back to the basic concept.

## References

- PlanB cyp302 — Modern Cryptography Fundamentals
