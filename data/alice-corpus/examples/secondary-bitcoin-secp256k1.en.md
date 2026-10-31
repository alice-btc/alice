---
type: "project_note"
id: "secondary-bitcoin-secp256k1"
title: "The secp256k1 curve"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["secp256k1", "La courbe secp256k1"]
parent_ids: ["digital-signature", "bitcoin-public-key"]
related_ids: ["digital-signature", "bitcoin-public-key"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# The secp256k1 curve

## Questions covered

- What does secp256k1 refer to in Bitcoin?

## Short answer

secp256k1 is the curve used in Bitcoin for ECDSA and Schnorr. The public key is derived from a valid private key through an operation on this curve.

## Explanation

- The private key corresponds to a valid scalar, and the public key to a point obtained by multiplying a reference point.
- ECDSA and Schnorr use this same curve in Bitcoin, but their signing procedures differ.

## Limits and confusions

Understanding its name is not enough to implement a wallet's cryptography yourself.

## Further reading

- [[digital-signature.en|Digital signatures]] — back to the basic concept.
- [[bitcoin-public-key.en|The public key]] — back to the basic concept.

## References

- PlanB cyp201 — Bitcoin Wallet Architecture
