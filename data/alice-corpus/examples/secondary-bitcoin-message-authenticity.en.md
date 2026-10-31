---
type: "project_note"
id: "secondary-bitcoin-message-authenticity"
title: "Message authenticity"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Message Authenticity", "L’authenticité d’un message"]
parent_ids: ["digital-signature", "encryption"]
related_ids: ["digital-signature", "encryption"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp302 — Modern Cryptography Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Message authenticity

## Questions covered

- What does a signature on a message actually prove?

## Short answer

Authenticating a message makes it possible to verify its link to the expected key. A signature or a MAC can contribute to that verification.

## Explanation

- It can be symmetric, through a MAC.
- It can be asymmetric, through a digital signature.
- It is distinct from confidentiality.
- It is essential to prevent the injection or forgery of messages.

## Limits and confusions

The proof concerns the key; its association with a person, and the fact that it has not been compromised, remain to be established.

## Further reading

- [[digital-signature.en|Digital signatures]] — back to the basic concept.
- [[encryption.en|Encryption and signatures]] — back to the basic concept.

## References

- PlanB cyp302 — Modern Cryptography Fundamentals
