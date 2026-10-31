---
type: "project_note"
id: "secondary-bitcoin-elliptic-curve-cryptography"
title: "Elliptic curve cryptography"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Elliptic Curve Cryptography", "La cryptographie sur courbes elliptiques"]
parent_ids: ["bitcoin-public-key", "digital-signature"]
related_ids: ["bitcoin-public-key", "digital-signature"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Elliptic curve cryptography

## Questions covered

- How is a public key tied to a private key?

## Short answer

Elliptic curve cryptography ties together private keys, public keys and verifiable signatures. Bitcoin notably uses the secp256k1 curve.

## Explanation

- An operation on the curve makes it possible to compute a public key from a private key.
- Signatures then make it possible to demonstrate authorization without directly transmitting the secret.

## Limits and confusions

The impossibility of reversing the operation is an assumption of computational hardness given known means, not an absolute mathematical impossibility.

## Further reading

- [[bitcoin-public-key.en|The public key]] — back to the basic concept.
- [[digital-signature.en|Digital signatures]] — back to the basic concept.

## References

- PlanB cyp201 — Bitcoin Wallet Architecture
