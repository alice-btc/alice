---
type: "project_note"
id: "secondary-bitcoin-message-integrity"
title: "Message integrity"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Message Integrity", "L’intégrité d’un message"]
parent_ids: ["cryptographic-hash-function", "software-integrity-verification"]
related_ids: ["cryptographic-hash-function", "software-integrity-verification"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp302 — Modern Cryptography Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Message integrity

## Questions covered

- How can a modification be detected, and why is a hash alone not always enough?

## Short answer

Integrity makes it possible to detect modifications to a message. A hash must be obtained through a trusted channel, or complemented by a signature or a MAC, to withstand malicious replacement.

## Explanation

- It can be protected by MACs, signatures or authenticated constructions.
- A hash alone is not always enough if the adversary can recompute the hash.
- It matters as much as secrecy in open protocols.
- Bitcoin depends on the integrity of transactions, blocks and states.

## Limits and confusions

Checking a hash published on the same compromised source does not prove the authenticity of the file.

## Further reading

- [[cryptographic-hash-function.en|The cryptographic hash]] — back to the basic concept.
- [[software-integrity-verification.en|Verifying a download]] — back to the basic concept.

## References

- PlanB cyp302 — Modern Cryptography Fundamentals
