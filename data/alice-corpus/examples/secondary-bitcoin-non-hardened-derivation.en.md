---
type: "project_note"
id: "secondary-bitcoin-non-hardened-derivation"
title: "Public derivation of child keys"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Non-Hardened Derivation", "La dérivation publique des clés enfants"]
parent_ids: ["extended-public-key", "watch-only-wallet"]
related_ids: ["extended-public-key", "watch-only-wallet"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Public derivation of child keys

## Questions covered

- How can an xpub generate addresses without knowing the private keys?

## Short answer

Non-hardened derivation makes it possible to compute child public keys from an extended public key without having the parent private key.

## Explanation

- An extended public key makes it possible to prepare addresses without transferring the private keys to the receiving system.
- This convenience has privacy and compartmentalization limits that should be understood before sharing an xpub.

## Limits and confusions

Combining a parent xpub with a non-hardened child private key can compromise the parent; keep secrets separated.

## Further reading

- [[extended-public-key.en|The extended public key]] — back to the basic concept.
- [[watch-only-wallet.en|Watching without being able to spend]] — back to the basic concept.

## References

- PlanB cyp201 — Bitcoin Wallet Architecture
