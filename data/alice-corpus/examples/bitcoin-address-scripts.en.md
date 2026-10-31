---
type: "project_note"
id: "bitcoin-address-scripts"
title: "Addresses, scripts and spending conditions"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["transactions"]
aliases: ["types de sorties", "SegWit imbriqué", "P2WPKH", "P2WSH", "P2TR", "Adresses, scripts et conditions de dépense"]
parent_ids: ["legacy-address", "bitcoin-address", "segwit-address", "taproot"]
related_ids: []
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/transactions.html", "https://github.com/bitcoin/bips/blob/master/bip-0013.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Addresses, scripts and spending conditions

## Questions covered

- Does an address starting with `3` necessarily use an old spending type?
- What is the difference between P2WPKH, P2WSH and P2TR?
- What can be inferred from an address, and what stays hidden?

## Short answer

The address encoding, the output type and the conditions that will allow it to be spent must be distinguished. Several constructions can share the same address prefix. An address is not a complete description of the wallet nor of all its keys.

## Explanation

| Output type or construction | Usual marker on mainnet | Principle |
|---|---|---|
| P2PKH | `1…` | The spend provides a public key matching the hash and a valid signature. |
| P2SH | `3…` | The output commits to a script hash. The spend reveals the script and satisfies the applicable conditions. |
| P2SH-P2WPKH or P2SH-P2WSH | `3…` | A version 0 SegWit program is wrapped in P2SH. The P2SH prefix alone does not reveal this construction. |
| P2WPKH | `bc1q…` | Native version 0 SegWit with a 20-byte program, corresponding to a public key hash. |
| P2WSH | `bc1q…` | Native version 0 SegWit with a 32-byte program, corresponding to a script hash. The spend reveals and satisfies this script. |
| P2TR | `bc1p…` | Taproot uses a 32-byte version 1 witness program. A spend can go through the output key or through a script path committed to in that key. |

A Taproot key-path spend does not reveal any alternative scripts. A script-path spend reveals the script used and the elements needed to verify its commitment, without having to reveal all the other scripts. This does not automatically make transactions anonymous.

Bech32 is used for witness version 0. Bech32m is used for versions 1 to 16. The `bc1p` prefix indicates version 1; the length and the other rules make it possible to recognize a valid Taproot output. The additional versions provided for by the encoding are not all spending mechanisms that are already deployed.

The weight charged depends on the actual transaction. SegWit applies distinct treatment to witness data. The P2SH wrapper adds data compared with a comparable native construction. For Taproot, the path used and the conditions satisfied also count. Comparing only the prefixes therefore does not give a universal ranking of fees.

## Limits and confusions

This list covers the main addressable types used by wallets. Outputs such as P2PK or certain data outputs do not necessarily use a usual receiving address format. A Bitcoin transaction can therefore contain outputs that do not correspond to any row of this table.

P2SH and P2WSH can represent multisig, but their address is not enough to prove that this is the case. A Taproot key can also result from a construction involving several participants. The format does not replace the information needed for a backup or a restoration.

The markers in the table concern mainnet. On test networks, the prefixes change and some are shared. A wallet's compatibility must be checked for the network and the output type concerned.

## Further reading

- [[legacy-address.en|Comparing Bitcoin address formats]] (legacy-address) to return to the comparison intended for beginners.

## References

- [Bitcoin Developer Guide, transactions and common scripts](https://developer.bitcoin.org/devguide/transactions.html).
- [BIP 13, P2SH addresses](https://github.com/bitcoin/bips/blob/master/bip-0013.mediawiki).
- [BIP 141, witness programs and native or nested constructions](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki).
- [BIP 173, encoding of version 0 SegWit addresses](https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki).
- [BIP 341, Taproot spending conditions](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki).
- [BIP 350, distinction between Bech32 and Bech32m](https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki).
