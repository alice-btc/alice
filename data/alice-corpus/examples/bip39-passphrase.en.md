---
type: "project_note"
id: "bip39-passphrase"
title: "The optional passphrase"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["BIP39 Passphrase", "La passphrase optionnelle"]
parent_ids: []
related_ids: ["bitcoin-seed", "wallet-backup", "bitcoin-inheritance-plan", "secondary-bitcoin-pbkdf2"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The optional passphrase

## Questions covered

- Is a passphrase simply a password?

## Short answer

The BIP39 passphrase is an optional secret that modifies the seed derived from the recovery words. It is not limited to unlocking the interface like an application password.

## Explanation

With the same recovery phrase, a different passphrase produces a different wallet. The exact combination must therefore remain recoverable. A typing error can lead to different addresses rather than to a message reporting a wrong password.

This separation can limit the consequences of the words alone being discovered. It also introduces an additional risk of loss if the holder or their relatives no longer have the right passphrase.

## Limits and confusions

Adding a passphrase does not automatically improve security. Its value depends on its quality, on how it is kept and on understanding its role. It does not replace a complete backup nor the parameters needed for restoration. Presenting it simply as an "extra word" can hide how it works and its compatibility constraints.

## Further reading

- [[bitcoin-seed.en|From the phrase to the keys]].
- [[wallet-backup.en|Preparing a backup]].
- [[bitcoin-inheritance-plan.en|Preparing the handover]].

- [[secondary-bitcoin-pbkdf2.en|BIP39 derivation with PBKDF2]].

## References

- PlanB cyp201 — Bitcoin Wallet Architecture.
- PlanB Extraction — 2026-05-23.
