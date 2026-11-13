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
reviewed_at: "2026-11-06"
review_due: null
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture", "PlanB Extraction — 2026-05-23", "https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The optional passphrase

## Questions covered

- Is a passphrase simply a password?
- Is my recovery phrase enough if I also set a passphrase?

## Short answer

The BIP39 passphrase is an optional secret that modifies the seed derived from the recovery words. It is not limited to unlocking the interface like an application password.

## Explanation

BIP39 combines the mnemonic words and the exact passphrase to derive a seed, from which private keys are derived. Every passphrase, including the empty string, produces a valid seed. BIP39 does not report whether that is the originally intended wallet. With the same words, changing the passphrase normally changes the keys and addresses; that fact alone does not diagnose an empty display.

A device PIN or local application password controls access to the device or application. The BIP39 passphrase instead participates in key derivation. Resetting a local password does not reconstruct the forgotten passphrase; the mnemonic alone does not recreate the same passphrase-protected wallet.

A zero balance or empty display is not, by itself, evidence that a different wallet was derived, that the passphrase is correct or that funds were lost. The passphrase may differ, but a different derivation path, account or network, or incomplete synchronization, can also explain the display. Compare known public wallet details, such as a previously used address, locally with the appropriate recovery settings. Do not disclose the mnemonic or passphrase to an assistant, website or support contact.

BIP39 supplies no reset mechanism and recovery is not guaranteed. Its feasibility depends on what remains known and the passphrase's strength. Checking a limited set of known candidates can sometimes work; an unknown strong secret may be infeasible to reconstruct. Neither certain success nor universal mathematical impossibility follows from a forgotten passphrase alone.

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

- https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
