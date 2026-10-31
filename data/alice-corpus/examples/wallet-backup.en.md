---
type: "project_note"
id: "wallet-backup"
title: "Preparing a backup"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Wallet Backup", "Préparer une sauvegarde"]
parent_ids: []
related_ids: ["wallet-backup-test", "descriptor-wallet", "secure-backups", "secondary-bitcoin-bitcoin-inheritance-support-protocol", "secondary-bitcoin-paper-wallet", "secondary-privacy-backup-3-2-1-method", "secondary-privacy-incident-response-after-infection"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki", "https://github.com/bitcoin/bitcoin/blob/v31.1/doc/descriptors.md"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Preparing a backup

## Questions covered

- What needs to be kept to restore a wallet?

## Short answer

A backup has to preserve the secrets and the information needed to find the funds again and sign a spend. Its content depends on the wallet's architecture.

## Explanation

For a BIP39 wallet, the words and any passphrase have to be exact. Derivation paths, script types or a descriptor can specify how to find the addresses again. In multisig, the threshold and the cosigners' information also have to remain available.

Metadata, such as fund labels, may deserve a separate backup. Complementary protocols sometimes have additional requirements; a basic Bitcoin backup must not be assumed sufficient for every Lightning or Liquid tool.

## Limits and confusions

A public, watch-only backup can show the funds without allowing signing. Full recovery therefore has to include access to the necessary secrets. Preserving 1 file does not demonstrate that it is usable or that it contains all the expected information. The instructions have to match the software actually used and remain understandable after its loss.

## Further reading

- [[wallet-backup-test.en|Testing your backup]].
- [[descriptor-wallet.en|Descriptor wallets]].
- [[secure-backups.en|The risks that threaten a backup]].

- [[secondary-bitcoin-bitcoin-inheritance-support-protocol.en|Helping relatives through a Bitcoin inheritance]].
- [[secondary-bitcoin-paper-wallet.en|Old-style paper wallets]].
- [[secondary-privacy-backup-3-2-1-method.en|The 3-2-1 backup method]].
- [[secondary-privacy-incident-response-after-infection.en|Responding to a potentially compromised device]].

## References

- [Public reference kept from the source note](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki).
- [Public reference kept from the source note](https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki).
- [Public reference kept from the source note](https://github.com/bitcoin/bitcoin/blob/v31.1/doc/descriptors.md).
