---
type: "project_note"
id: "descriptor-wallet"
title: "Descriptor wallets"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Descriptor Wallet", "Les portefeuilles à descripteurs"]
parent_ids: []
related_ids: ["wallet-backup", "multisig", "watch-only-wallet"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki", "https://github.com/bitcoin/bitcoin/blob/v31.1/doc/descriptors.md"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Descriptor wallets

## Questions covered

- Why can a backup contain descriptors?

## Short answer

A descriptor explicitly describes how to find a wallet's outputs from scripts, keys and paths. It makes the wallet's configuration more reproducible across compatible tools.

## Explanation

The wallet needs to know which spending conditions to look for on the chain. A descriptor provides this description instead of leaving the software to guess the address type and the derivation. It is especially useful for multisig setups and for preparing transactions.

A public descriptor can be enough to track funds or build addresses. Signatures still require access to the private keys demanded by the spending conditions.

## Limits and confusions

It is transactions that are signed, not addresses. A descriptor therefore does not automatically replace backup secrets. Some descriptors can contain private information; their sensitivity depends on their content. In multisig, keeping the complete configuration and the number of keys required remains essential, even if a piece of software already knows how to display the balance.

## Further reading

- [[wallet-backup.en|Preparing a backup]].
- [[multisig.en|Multisig]].
- [[watch-only-wallet.en|Watching without being able to spend]].

## References

- [Public reference kept from the source note](https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki).
- [Public reference kept from the source note](https://github.com/bitcoin/bitcoin/blob/v31.1/doc/descriptors.md).
