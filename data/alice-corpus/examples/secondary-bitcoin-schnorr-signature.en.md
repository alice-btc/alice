---
type: "project_note"
id: "secondary-bitcoin-schnorr-signature"
title: "Schnorr signatures"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Schnorr Signature", "Les signatures Schnorr"]
parent_ids: ["taproot", "digital-signature"]
related_ids: ["taproot", "digital-signature"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Schnorr signatures

## Questions covered

- What do the Schnorr signatures used by Taproot bring?

## Short answer

Taproot uses Schnorr signatures, which make certain multi-signer constructions easier.

## Explanation

- The algebraic properties of Schnorr make protocols such as MuSig easier, where several signers take part in a joint signature.
- Any privacy gain comes from the complete construction and how it is used, not from the signature algorithm alone.

## Limits and confusions

Aggregation is not automatic for all the inputs of a transaction and requires an appropriate protocol.

## Further reading

- [[taproot.en|bc1p addresses and Taproot]] — back to the basic concept.
- [[digital-signature.en|Digital signatures]] — back to the basic concept.

## References

- PlanB cyp201 — Bitcoin Wallet Architecture
