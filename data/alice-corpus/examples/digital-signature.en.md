---
type: "project_note"
id: "digital-signature"
title: "Digital signatures"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Cryptography and protocol limits"]
aliases: ["Digital Signature", "PGP Signature Verification", "La signature numérique"]
parent_ids: []
related_ids: ["bitcoin-script", "encryption", "secondary-bitcoin-adaptor-signature", "secondary-bitcoin-deterministic-ecdsa-nonce", "secondary-bitcoin-ecdsa-signature", "secondary-bitcoin-elliptic-curve-cryptography", "secondary-bitcoin-message-authenticity", "secondary-bitcoin-schnorr-signature", "secondary-bitcoin-secp256k1", "secondary-bitcoin-wallet-as-identity"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Digital signatures

## Questions covered

- How can one prove the authorization to spend without revealing the key?

## Short answer

A digital signature makes it possible to verify that a private key authorized specific data, without revealing that key. In Bitcoin, it takes part in verifying spending conditions.

## Explanation

The wallet prepares the information to be signed according to the transaction rules. The private key produces a signature; nodes can verify it using the public key and the corresponding conditions. An invalid signature does not satisfy the condition it is supposed to fulfill.

The signature therefore ties an authorization to a message, but does not necessarily hide that message. Bitcoin notably uses ECDSA and Schnorr depending on the spending type. A user does not need to master the computation to understand that the key must be protected and that what is being authorized must be checked.

## Limits and confusions

A valid signature does not prove the civil identity of the person behind the key, their informed consent or the legitimacy of a recipient. A compromised device can ask to sign the wrong operation.

With a hardware wallet, the information shown by the device must be compared with the trusted request from the recipient. The computer can transmit a transaction different from the original intention; the device does not guess that intention. Never share a key to allow a signature to be verified.

## Further reading

- [[bitcoin-script.en|Spending conditions]] — understanding the conditions that authorize a spend
- [[encryption.en|Encryption and signatures]] — distinguishing signing from confidentiality

- [[secondary-bitcoin-adaptor-signature.en|Adaptor signatures]].
- [[secondary-bitcoin-deterministic-ecdsa-nonce.en|Deterministic ECDSA nonces]].
- [[secondary-bitcoin-ecdsa-signature.en|ECDSA signatures in Bitcoin]].
- [[secondary-bitcoin-elliptic-curve-cryptography.en|Elliptic curve cryptography]].
- [[secondary-bitcoin-message-authenticity.en|Message authenticity]].
- [[secondary-bitcoin-schnorr-signature.en|Schnorr signatures]].
- [[secondary-bitcoin-secp256k1.en|The secp256k1 curve]].
- [[secondary-bitcoin-wallet-as-identity.en|The wallet as a means of authentication]].

## References

- PlanB cyp201 — Bitcoin Wallet Architecture (reference from the source note, not re-consulted directly for this adaptation).
