---
type: "project_note"
id: "bitcoin-uri"
title: "Payment requests and QR codes"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Bitcoin URI", "Les demandes de paiement et QR codes"]
parent_ids: []
related_ids: ["bitcoin-address", "address-spoofing", "hardware-wallet"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bips/blob/master/bip-0321.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Payment requests and QR codes

## Questions covered

- What does a Bitcoin payment QR code contain?

## Short answer

A Bitcoin URI is a payment request link, often placed in a QR code. It can pass an address, an amount and additional information to the wallet.

## Explanation

The simple form starts with bitcoin:. An amount given in the amount parameter is expressed in BTC, with a decimal point. The link avoids entering each field separately; the wallet then interprets the instructions it supports.

The corrected notes distinguish BIP21, the historical format, from BIP321, which specifies in particular additional instructions and the modern formats. A documented standard does not mean that all of its possibilities work in every wallet.

## Limits and confusions

Scanning a QR code does not prove that its content is honest. The link prepares a request; it does not replace verifying the destination, the amount and the fees before signing. A name or a message in the link does not certify the recipient's identity. With a hardware wallet, the information on the device must be checked against a destination known in a reliable way.

## Further reading

- [[bitcoin-address.en|Understanding a Bitcoin address]].
- [[address-spoofing.en|Address substitution]].
- [[hardware-wallet.en|The role of a signing device]].

## References

- [Public reference kept from the source note](https://github.com/bitcoin/bips/blob/master/bip-0321.mediawiki).
- [Public reference kept from the source note](https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki).
