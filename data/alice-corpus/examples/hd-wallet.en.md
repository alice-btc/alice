---
type: "project_note"
id: "hd-wallet"
title: "Deterministic wallets"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["HD Wallet", "Les portefeuilles déterministes"]
parent_ids: []
related_ids: ["derivation-path", "wallet-backup", "extended-public-key", "secondary-bitcoin-extended-private-key"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Deterministic wallets

## Questions covered

- How does 1 backup recover several addresses?

## Short answer

A hierarchical deterministic wallet, or HD wallet, derives many keys from a seed. It can thus create new addresses without requiring a separate backup of each key.

## Explanation

The organization resembles a tree. Branches notably distinguish accounts and uses; positions identify the successive keys. The derivation path indicates where to look in this tree. With the same starting data and the same rules, the computation reproduces the same keys.

This property makes backups more practical and makes it easier to separate a watching tool from a device that signs. It does not mean that all of the wallet's information is contained in the words.

## Limits and confusions

Restoring can require the passphrase, the paths, the script type and, in multisig, the cosigner configuration. Labels and other usage data may need their own backup. A wallet that appears empty after a restore therefore does not immediately prove that the funds are gone or that the phrase is wrong.

## Further reading

- [[derivation-path.en|The derivation path]].
- [[wallet-backup.en|Preparing a backup]].
- [[extended-public-key.en|The extended public key]].

- [[secondary-bitcoin-extended-private-key.en|Extended private keys]].

## References

- [Public reference kept from the source note](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki).
- [Public reference kept from the source note](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki).
- [Public reference kept from the source note](https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki).
