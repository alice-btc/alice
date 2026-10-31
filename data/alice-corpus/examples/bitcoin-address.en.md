---
type: "project_note"
id: "bitcoin-address"
title: "Understanding a Bitcoin address"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Bitcoin Address", "Comprendre une adresse Bitcoin"]
parent_ids: []
related_ids: ["legacy-address", "address-reuse", "address-spoofing", "bitcoin-address-scripts", "secondary-bitcoin-base58check-encoding", "secondary-bitcoin-confidential-address", "secondary-bitcoin-hash160"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Understanding a Bitcoin address

## Questions covered

- Is an address my Bitcoin account?

## Short answer

An address is a practical representation of the conditions intended for receiving bitcoins. It is neither a global personal account, nor a private key, nor the whole wallet.

## Explanation

The wallet can produce many addresses from its key information. A recipient shares an address; the payer uses it to build a transaction output. Spending it later will have to satisfy the conditions attached to that output.

Address formats have evolved. Different prefixes correspond to different families of outputs and to compatibility needs. Changing your receiving address therefore does not necessarily mean changing wallets.

## Limits and confusions

An address reveals information about the transactions associated with it. Publishing or reusing it can make linking easier. Its format does not prove the identity of its owner. For an operation with a hardware wallet, the address shown on the device must be compared in full with reliable information; a mere resemblance of the beginning and the end is not enough.

## Further reading

- [[legacy-address.en|Comparing Bitcoin address formats]].
- [[address-reuse.en|Address reuse]].
- [[address-spoofing.en|Address substitution]].

- [[bitcoin-address-scripts.en|Addresses, scripts and spending conditions]].
- [[secondary-bitcoin-base58check-encoding.en|Base58Check encoding]].
- [[secondary-bitcoin-confidential-address.en|Liquid confidential addresses]].
- [[secondary-bitcoin-hash160.en|The HASH160 function]].

## References

- PlanB cyp201 — Bitcoin Wallet Architecture.
- PlanB Extraction — 2026-05-23.
