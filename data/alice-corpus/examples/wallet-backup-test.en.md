---
type: "project_note"
id: "wallet-backup-test"
title: "Testing your backup"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Wallet Backup Test", "Vérifier sa sauvegarde"]
parent_ids: []
related_ids: ["watch-only-wallet", "wallet-backup", "multisig"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Testing your backup

## Questions covered

- How do I know whether my backup is usable?

## Short answer

A backup test verifies that a recovery actually works. Finding the right addresses again is useful, but a complete test also has to demonstrate access to the keys needed to sign.

## Explanation

A watch-only wallet can display the balance and the history without holding any spending secret. It therefore validates part of the restore, not all of it. In a multisig setup, the conditions and the coordination information also have to be recovered.

The test has to be adapted to the hardware and software, in a safe environment. Its documentation describes what was verified, without copying the words or the secrets into a report. A written procedure and a procedure that has actually been verified are 2 different states.

## Limits and confusions

Testing a backup does not justify exposing a phrase on a website or an unknown computer. A test signature does not prove every condition of a complex scenario. Trials have to avoid putting significant funds at stake. This note explains the goal of verification, without imposing a universal procedure on every wallet.

## Further reading

- [[watch-only-wallet.en|Watching without being able to spend]].
- [[wallet-backup.en|Preparing a backup]].
- [[multisig.en|Multisig]].

## References

- [Public reference kept from the source note](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki).
- [Public reference kept from the source note](https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki).
