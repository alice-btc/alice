---
type: "project_note"
id: "bitcoin-private-key"
title: "The private key"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Bitcoin Private Key", "La clé privée"]
parent_ids: []
related_ids: ["bitcoin-public-key", "wallet-recovery-phrase", "wallet-backup", "secondary-bitcoin-casascius-physical-bitcoins", "secondary-bitcoin-extended-private-key", "secondary-bitcoin-pseudorandom-number-generator"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki", "https://developer.bitcoin.org/devguide/transactions.html"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The private key

## Questions covered

- What is a private key for?

## Short answer

A private key is a digital secret used to produce signatures. These signatures serve to satisfy the spending conditions of the associated outputs.

## Explanation

The network verifies a signature using public information, without needing to know the secret. Many wallets derive several keys from a seed rather than asking the user to keep each key separately.

Protection aims to prevent a third party from signing in the holder's place, while keeping a way to recover. The recovery phrase can therefore be as sensitive as the keys it allows to be reconstructed.

## Limits and confusions

Losing 1 copy or 1 device does not make the funds permanently inaccessible if a backup allows the necessary means to be recovered. In multisig, the ability to spend depends on the threshold and the planned conditions. An address or a public key alone does not replace a private key. No legitimate support needs the secret phrase simply to look into a receiving problem.

## Further reading

- [[bitcoin-public-key.en|The public key]].
- [[wallet-recovery-phrase.en|The recovery phrase]].
- [[wallet-backup.en|Preparing a backup]].

- [[secondary-bitcoin-casascius-physical-bitcoins.en|Casascius physical coins]].
- [[secondary-bitcoin-extended-private-key.en|Extended private keys]].
- [[secondary-bitcoin-pseudorandom-number-generator.en|Cryptographic pseudorandom number generators]].

## References

- [Public reference kept from the source note](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki).
- [Public reference kept from the source note](https://developer.bitcoin.org/devguide/transactions.html).
