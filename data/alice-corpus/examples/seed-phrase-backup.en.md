---
type: "project_note"
id: "seed-phrase-backup"
title: "Backing up the recovery phrase"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Seed Phrase Backup", "sauvegarde de la seed", "phrase sur papier", "plaque métal", "Sauvegarder la phrase de récupération"]
parent_ids: []
related_ids: ["wallet-recovery-phrase", "wallet-backup", "wallet-backup-test", "secure-backups", "password-manager", "bip39-passphrase"]
reviewed_at: "2026-11-02"
review_due: null
sources: ["https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki", "PlanB btc102 — Getting your first bitcoins", "PlanB scu202 — Improve Your Personal Digital Security"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "reviewed"
---
# Backing up the recovery phrase

## Questions covered

- Can I keep a photo of my recovery phrase in my password manager?
- What should I write my recovery phrase on?
- How many copies of my phrase do I need, and where should I keep them?

## Short answer

The recovery phrase is written by hand on paper or stamped on metal, away from any connected device. Never as a photo, in a note, in an email, in a cloud file or in a password manager, even encrypted.

## Explanation

Whoever reads the phrase can spend all the funds, now and later. A connected device can be compromised by malware, an automatic backup, a sync or an account access; a digital copy stays exposed there for as long as it exists. Encryption moves the problem: it adds a password that must not be lost and does not protect against typing the phrase on a device that is already compromised. A password manager is right for passwords, not for a secret that must never go through a connected screen or keyboard.

Paper and metal have neither software nor network. Paper fears fire, water and time; a metal plate withstands them. At least two copies, in separate places, protect against the loss of one place. A copy kept with the signing device shares its fate in a theft or a disaster. A restore test, on a trusted device and with little money at stake, proves that the phrase is complete and readable before it is too late.

## Limits and confusions

The phrase alone is not always enough: a passphrase, the derivation paths or the configuration of a multisig may be needed, and must be backed up too. More copies mean more places where an intruder can read the secret; every copy has to be as protected as the first. No support team, no website and no assistant, Alice included, needs the phrase in order to help. This note describes neither secret sharing between several people nor inheritance arrangements.

## Further reading

- [[wallet-recovery-phrase.en|The recovery phrase]].
- [[wallet-backup.en|Preparing a backup]].
- [[wallet-backup-test.en|Testing your backup]].
- [[secure-backups.en|The risks that threaten a backup]].
- [[password-manager.en|Password managers]].

## References

- [BIP39, mnemonic phrases](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki).
- PlanB btc102 — Getting your first bitcoins.
- PlanB scu202 — Improve Your Personal Digital Security.
