---
type: "project_note"
id: "bitcoin-public-key"
title: "The public key"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Bitcoin Public Key", "La clé publique"]
parent_ids: []
related_ids: ["bitcoin-private-key", "extended-public-key", "bitcoin-quantum-threat", "secondary-bitcoin-elliptic-curve-cryptography", "secondary-bitcoin-secp256k1"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The public key

## Questions covered

- What can someone do with my public key?

## Short answer

A public key makes it possible to verify signatures produced with the corresponding private key. Knowing it does not normally give the power to create those signatures or to spend the funds.

## Explanation

The public key is computed from the private key through Bitcoin's cryptographic operations. Addresses can be derived from a public key or represent more complex conditions. Public key and address are therefore not interchangeable terms.

Verifiers use the public data to check spending authorizations. This separation allows the secret to stay in the wallet or the signing device.

## Limits and confusions

Public does not mean without consequences for privacy. Public information can help link transactions together. An extended public key gives access to more information than an isolated key and deserves particular attention. This explanation relies on the security of the primitives in use; any quantum risk is treated separately, without claiming that a practical attack is available.

## Further reading

- [[bitcoin-private-key.en|The private key]].
- [[extended-public-key.en|The extended public key]].
- [[bitcoin-quantum-threat.en|Understanding the quantum risk]].

- [[secondary-bitcoin-elliptic-curve-cryptography.en|Elliptic curve cryptography]].
- [[secondary-bitcoin-secp256k1.en|The secp256k1 curve]].

## References

- PlanB cyp201 — Bitcoin Wallet Architecture.
- PlanB Extraction — 2026-05-23.
