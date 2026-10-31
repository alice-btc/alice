---
type: "project_note"
id: "wallet-recovery-phrase"
title: "The recovery phrase"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Wallet Recovery Phrase", "La phrase de récupération"]
parent_ids: []
related_ids: ["bitcoin-seed", "bip39-passphrase", "wallet-backup", "secondary-lightning-lnd-aezeed"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc102 — Getting your first bitcoins", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The recovery phrase

## Questions covered

- What are the backup words for?

## Short answer

The recovery phrase is a sequence of words used by many wallets to rebuild their keys. It has to be treated as a secret that can potentially allow the funds to be spent.

## Explanation

The wallet turns this information into starting data to find the keys and addresses again. This allows recovery after the loss or failure of a device, subject to compatibility and the parameters used.

A photo, a copy in a cloud or typing it into a fake site can expose this secret. Protection also has to cover physical accidents, loss and future access by authorized people. A backup has to remain usable, not merely hidden.

## Limits and confusions

Not every wallet uses the same format. Any passphrase, the derivation paths and the information of a multisig setup may also be needed. A phrase does not necessarily restore every piece of metadata or every state of a complementary protocol. No support team needs to receive it in order to explain a problem.

## Further reading

- [[bitcoin-seed.en|From the phrase to the keys]].
- [[bip39-passphrase.en|The optional passphrase]].
- [[wallet-backup.en|Preparing a backup]].

- [[secondary-lightning-lnd-aezeed.en|LND's aezeed recovery format]].

## References

- PlanB btc102 — Getting your first bitcoins.
- PlanB Extraction — 2026-05-23.
