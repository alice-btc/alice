---
type: "project_note"
id: "secondary-bitcoin-pbkdf2"
title: "BIP39 derivation with PBKDF2"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["PBKDF2", "La dérivation BIP39 avec PBKDF2"]
parent_ids: ["bitcoin-seed", "bip39-passphrase"]
related_ids: ["bitcoin-seed", "bip39-passphrase"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# BIP39 derivation with PBKDF2

## Questions covered

- How do the recovery words and the passphrase produce a seed?

## Short answer

BIP39 uses PBKDF2-HMAC-SHA512 to derive a seed from the mnemonic phrase and an optional passphrase.

## Explanation

- The seed phrase and any passphrase serve as inputs to a deterministic derivation.
- A different passphrase produces a different seed; the mechanism cannot tell a typo from a deliberate choice.

## Limits and confusions

The iterations do not make a weak passphrase resistant to every attack; PBKDF2 also has other uses.

## Further reading

- [[bitcoin-seed.en|From the phrase to the keys]] — back to the basic concept.
- [[bip39-passphrase.en|The optional passphrase]] — back to the basic concept.

## References

- PlanB cyp201 — Bitcoin Wallet Architecture
