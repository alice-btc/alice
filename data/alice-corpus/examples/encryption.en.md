---
type: "project_note"
id: "encryption"
title: "Encryption and signatures"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Cryptography and protocol limits"]
aliases: ["Encryption", "Chiffrement et signature"]
parent_ids: []
related_ids: ["digital-signature", "alice-local-encryption", "secondary-bitcoin-authenticated-encryption", "secondary-bitcoin-kerckhoffs-principle", "secondary-bitcoin-message-authenticity", "secondary-privacy-file-encryption", "secondary-privacy-full-disk-encryption"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB cyp302 — Modern Cryptography Fundamentals"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Encryption and signatures

## Questions covered

- What is the difference between hiding a message and signing it?

## Short answer

Encryption protects the confidentiality of content by transforming it with a key. A signature is used to verify an authorization or authenticity; these functions are not interchangeable.

## Explanation

Encrypted content must be decrypted with the appropriate elements to become readable again. Depending on the system, a single secret key or a key pair may be involved. A signature, by contrast, can be verified publicly without revealing the private key that produced it.

Bitcoin uses signatures to authorize spending. This does not make public transactions secret. An application can also encrypt its data locally or protect the messages exchanged with a service; which content and which path are concerned needs to be specified.

## Limits and confusions

"Encrypted" does not mean "protected against everything". Key management, message integrity, the state of the device and the data that remains visible determine the actual protection. A system generally needs to combine confidentiality with appropriate authentication mechanisms.

Someone who controls the unlocked session or the software can access data while it is in use. Likewise, encrypting storage does not by itself demonstrate resistance to a complete copy of the profile or to a compromise of the device.

## Further reading

- [[digital-signature.en|Digital signatures]] — understanding verifiable authorization
- [[alice-local-encryption.en|Local data in Alice App]] — seeing a concrete protection perimeter

- [[secondary-bitcoin-authenticated-encryption.en|Authenticated encryption]].
- [[secondary-bitcoin-kerckhoffs-principle.en|Kerckhoffs's principle]].
- [[secondary-bitcoin-message-authenticity.en|Message authenticity]].
- [[secondary-privacy-file-encryption.en|Encrypting sensitive files]].
- [[secondary-privacy-full-disk-encryption.en|What disk encryption protects]].

## References

- PlanB cyp302 — Modern Cryptography Fundamentals (reference from the source note, not re-consulted directly for this adaptation).
