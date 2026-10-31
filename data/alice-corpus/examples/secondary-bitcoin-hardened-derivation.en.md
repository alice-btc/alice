---
type: "project_note"
id: "secondary-bitcoin-hardened-derivation"
title: "Hardened key derivation"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Hardened Derivation", "La dérivation renforcée des clés"]
parent_ids: ["derivation-path", "extended-public-key"]
related_ids: ["derivation-path", "extended-public-key"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Hardened key derivation

## Questions covered

- What does hardened mean in a derivation path?

## Short answer

Hardened derivation requires the parent private key and prevents that branch from being derived from the parent xpub alone.

## Explanation

- It is written with an apostrophe or an h in paths.
- It better protects certain boundaries in the hierarchy.
- It prevents a parent xpub from deriving that branch.
- It is generally used at the upper levels such as purpose, coin type and account.

## Limits and confusions

It does not protect against a leak of the branch's private key or against a compromised backup.

## Further reading

- [[derivation-path.en|The derivation path]] — back to the basic concept.
- [[extended-public-key.en|The extended public key]] — back to the basic concept.

## References

- PlanB cyp201 — Bitcoin Wallet Architecture
