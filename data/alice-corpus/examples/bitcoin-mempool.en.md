---
type: "project_note"
id: "bitcoin-mempool"
title: "The transaction queue"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Bitcoin Mempool", "La file d’attente des transactions"]
parent_ids: []
related_ids: ["bitcoin-mempool-policy", "replace-by-fee", "transaction-fees"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bips/blob/master/bip-0035.mediawiki", "https://github.com/bitcoin/bitcoin/blob/v31.1/src/net_processing.cpp", "https://bitcoincore.org/en/releases/0.19.0.1/"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The transaction queue

## Questions covered

- Where is an unconfirmed transaction?

## Short answer

The mempool is the local collection of unconfirmed transactions that a node keeps. There are mempools, not a single worldwide queue.

## Explanation

A node receives a transaction, verifies it and applies its local policy before accepting it and possibly relaying it. Its neighbours may know other transactions or apply other limits. Miners draw in particular on this information to prepare their blocks.

An explorer therefore shows a useful view, not a universal snapshot of the network. A transaction can disappear from a mempool without having been confirmed, for example after an eviction or a replacement.

## Limits and confusions

The order of arrival does not set a mandatory order of inclusion. Fee rates and dependencies between transactions matter. The P2P mempool message described by BIP35 requests information from a peer; it did not create the relaying of unconfirmed transactions. Access to this request may be limited and is not the same as a local node command.

## Further reading

- [[bitcoin-mempool-policy.en|Local rules and consensus]].
- [[replace-by-fee.en|Raising fees with RBF]].
- [[transaction-fees.en|Transaction fees]].

## References

- [Public reference kept from the source note](https://github.com/bitcoin/bips/blob/master/bip-0035.mediawiki).
- [Public reference kept from the source note](https://github.com/bitcoin/bitcoin/blob/v31.1/src/net_processing.cpp).
- [Public reference kept from the source note](https://bitcoincore.org/en/releases/0.19.0.1/).
