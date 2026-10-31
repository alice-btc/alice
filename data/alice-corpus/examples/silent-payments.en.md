---
type: "project_note"
id: "silent-payments"
title: "Understanding Silent Payments"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Silent Payments", "Comprendre les Silent Payments"]
parent_ids: []
related_ids: ["address-reuse", "taproot", "bitcoin-pseudonymity", "secondary-privacy-bip47-reusable-payment-codes"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bips/blob/master/bip-0352.mediawiki"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Understanding Silent Payments

## Questions covered

- What is a silent payment address for?

## Short answer

Silent Payments make it possible to publish a reusable receiving instruction while obtaining different on-chain outputs for each payment. The mechanism reduces the visible link with a static receiving address.

## Explanation

The payer uses information from the recipient and data tied to the inputs to build the payment's destination. The recipient then has to detect their outputs by examining the necessary chain data. The protocol notably separates the needs of scanning from those of spending.

This arrangement can be useful for repeated public receiving. It does not require a dedicated notification transaction and uses Taproot outputs. It does, however, add detection work and software constraints.

## Limits and confusions

The status of the BIP352 specification does not prove that every wallet can send, receive and restore these payments. These functions have to be checked separately. Amounts remain public and other links may exist. The limits of collaborative transactions and the details of scanning belong to a deeper study specific to the software.

## Further reading

- [[address-reuse.en|Address reuse]].
- [[taproot.en|bc1p addresses and Taproot]].
- [[bitcoin-pseudonymity.en|Pseudonymous does not mean anonymous]].

- [[secondary-privacy-bip47-reusable-payment-codes.en|BIP47 reusable payment codes]].

## References

- [Public reference kept from the source note](https://github.com/bitcoin/bips/blob/master/bip-0352.mediawiki).
