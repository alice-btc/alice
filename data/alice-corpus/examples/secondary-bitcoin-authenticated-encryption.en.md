---
type: "project_note"
id: "secondary-bitcoin-authenticated-encryption"
title: "Authenticated encryption"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Authenticated Encryption", "Le chiffrement authentifié"]
parent_ids: ["encryption", "alice-local-encryption"]
related_ids: ["encryption", "alice-local-encryption"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp302 — Modern Cryptography Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Authenticated encryption

## Questions covered

- Why is encrypting not always enough to protect a message?

## Short answer

Authenticated encryption protects the content and makes it possible to detect certain unauthorized modifications. Associated data can be authenticated without being encrypted.

## Explanation

- It avoids cobbling together encryption and a MAC separately.
- AEAD modes often add associated data that is not encrypted but is authenticated.
- It is recommended for many modern protocols.
- It protects against active attacks that plain encryption does not address.

## Limits and confusions

Security also depends on the management of keys and nonces; it does not protect a device that is already unlocked and compromised.

## Further reading

- [[encryption.en|Encryption and signatures]] — going back to the basic notion.
- [[alice-local-encryption.en|Local data in Alice App]] — going back to the basic notion.

## References

- PlanB cyp302 — Modern Cryptography Fundamentals
