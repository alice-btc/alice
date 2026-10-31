---
type: "project_note"
id: "secondary-bitcoin-ecdsa-signature"
title: "ECDSA signatures in Bitcoin"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["ECDSA Signature", "Les signatures ECDSA dans Bitcoin"]
parent_ids: ["digital-signature", "taproot"]
related_ids: ["digital-signature", "taproot"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# ECDSA signatures in Bitcoin

## Questions covered

- Does Bitcoin still use ECDSA since Taproot?

## Short answer

Bitcoin uses ECDSA for several spending formats and Schnorr for Taproot. Protecting the signature nonce is essential with ECDSA.

## Explanation

- Legacy formats and SegWit v0 keep using ECDSA; Taproot introduces Schnorr for its own spends.
- The signature makes it possible to verify that a spend is authorized, without encrypting the transaction or hiding its amounts.

## Limits and confusions

Taproot did not replace all existing ECDSA signatures.

## Further reading

- [[digital-signature.en|Digital signatures]] — back to the basic concept.
- [[taproot.en|bc1p addresses and Taproot]] — back to the basic concept.

## References

- PlanB cyp201 — Bitcoin Wallet Architecture
