---
type: "project_note"
id: "legacy-address"
title: "Comparing Bitcoin address formats"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["formats d’adresses", "adresse legacy", "P2PKH", "P2SH", "SegWit", "Taproot", "Comparer les formats d’adresses Bitcoin"]
parent_ids: []
related_ids: ["bitcoin-address", "segwit-address", "taproot", "bitcoin-address-scripts", "secondary-bitcoin-base58check-encoding"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/transactions.html", "https://github.com/bitcoin/bips/blob/master/bip-0013.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Comparing Bitcoin address formats

## Questions covered

- Why do Bitcoin addresses not all start the same way?
- What is the difference between the older formats, SegWit and Taproot?
- Does the address format change fees or compatibility?

## Short answer

An address encodes a payment destination corresponding to spending conditions. The common formats differ by output type and by network. They do not represent different bitcoins or inherently separate accounts.

## Explanation

On the main network, the main formats used by wallets can notably be recognized by the following beginnings.

| Usual beginning | Format | What to understand |
|---|---|---|
| `1…` | P2PKH, generally called legacy | Historical format tied to a public key hash. |
| `3…` | P2SH | Format tied to a script hash. It can serve several spending conditions, including multisig or nested SegWit. An address starting with `3` therefore does not necessarily mean the absence of SegWit. |
| `bc1q…` | Native SegWit version 0, in Bech32 | Can correspond to a public key hash or a script hash. It avoids the P2SH wrapper of nested SegWit. |
| `bc1p…` for Taproot | P2TR, version 1 with a 32-byte program, in Bech32m | Allows spending by key or, depending on the construction, by a script committed in the output. |

A wallet must support the format to create a payment correctly. Support for the newer formats depends on the software and its version.

Fees depend on the transaction weight and the chosen fee rate. The type of the inputs and outputs plays a part in that weight. SegWit can reduce the billed weight of certain comparable spends; Taproot does not guarantee the lowest fees for every transaction. A receiving address is not enough to know the total cost of the payment.

## Limits and confusions

These markers concern the common formats on mainnet, not every possible script or every future witness program version. The beginning of a string is not enough to validate an address. Its encoding, its checksum, its network and the support of its destination all need to be checked.

Test networks use other markers and can share some prefixes. A format proves neither the identity of the recipient, nor a multisig configuration, nor anonymity. A Lightning Address is a different mechanism and is not an on-chain address.

## Further reading

- [[bitcoin-address-scripts.en|Addresses, scripts and spending conditions]] (bitcoin-address-scripts) — distinguishing the technical types, nested SegWit and the limits of what an address reveals.

- [[secondary-bitcoin-base58check-encoding.en|Base58Check encoding]].

## References

- [Bitcoin Developer Guide, outputs and spending conditions](https://developer.bitcoin.org/devguide/transactions.html).
- [BIP 13, P2SH address format](https://github.com/bitcoin/bips/blob/master/bip-0013.mediawiki).
- [BIP 141, native and nested SegWit, transaction weight](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki).
- [BIP 173, Bech32 and SegWit version 0 addresses](https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki).
- [BIP 341, Taproot outputs](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki).
- [BIP 350, Bech32m for witness versions 1 and above](https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki).
