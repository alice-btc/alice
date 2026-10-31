---
type: "project_note"
id: "bitcoin-seed"
title: "From the phrase to the keys"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Bitcoin Seed", "De la phrase aux clés"]
parent_ids: []
related_ids: ["wallet-recovery-phrase", "hd-wallet", "derivation-path", "secondary-bitcoin-pbkdf2", "secondary-bitcoin-random-number-generation"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# From the phrase to the keys

## Questions covered

- What is the difference between the phrase, the seed and the private key?

## Short answer

The seed is a binary secret used to build the key tree of a deterministic wallet. In BIP39, it is derived from the recovery phrase and the optional passphrase.

## Explanation

The words are a practical representation for human backup; the seed is data used by the computations. BIP32 then organizes the derivation of many keys from this starting point. The phrase, the seed and each private key therefore play different roles.

This explains why 1 backup can recover many addresses, and why the same set of words combined with another passphrase leads to another wallet.

## Limits and confusions

BIP32 does not require using BIP39. A seed therefore does not necessarily come from a recovery phrase. Holding the starting secret is not always enough to recover the funds in any software; paths, script types and coordination information can matter. Compromise of the starting secret affects all the keys it allows to be derived.

## Further reading

- [[wallet-recovery-phrase.en|The recovery phrase]].
- [[hd-wallet.en|Deterministic wallets]].
- [[derivation-path.en|The derivation path]].

- [[secondary-bitcoin-pbkdf2.en|BIP39 derivation with PBKDF2]].
- [[secondary-bitcoin-random-number-generation.en|Generating random secrets]].

## References

- [Public reference kept from the source note](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki).
- [Public reference kept from the source note](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki).
