---
type: "project_note"
id: "replace-by-fee"
title: "Raising fees with RBF"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Replace-By-Fee", "Augmenter les frais avec RBF"]
parent_ids: []
related_ids: ["transaction-fees", "bitcoin-mempool-policy", "bitcoin-transaction-confirmation"]
reviewed_at: "2026-11-06"
review_due: null
sources: ["https://raw.githubusercontent.com/bitcoin/bitcoin/v28.0/doc/release-notes.md", "https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Raising fees with RBF

## Questions covered

- Can a pending transaction be sped up?

## Short answer

RBF makes it possible to propose replacing an unconfirmed transaction with another one that pays more fees. This can improve its chances of being included soon.

## Explanation

The wallet prepares and signs a competing transaction that uses funds already committed in the previous one. Nodes decide whether to accept it according to their replacement policy and its conditions. Replacement is thus part of managing pending transactions.

A full-RBF policy can accept this replacement even if the original transaction did not signal it. The practical possibility also depends on the wallet software and the signing means available.

## Limits and confusions

RBF policy does not guarantee preservation of output recipients or amounts. The signer may change them in the replacement. A recipient must check the actual replacement and its confirmation state; appearing in a wallet does not guarantee settlement.

Raising fees does not guarantee immediate inclusion. RBF does not allow freely modifying a transaction already confirmed in the chain. The absence of RBF signaling is not a security guarantee for an unconfirmed payment. This explanation is not an instruction for replacing a real payment; the amounts, destination and cost proposed by the wallet must be checked.

## Further reading

- [[transaction-fees.en|Transaction fees]].
- [[bitcoin-mempool-policy.en|Local rules and consensus]].
- [[bitcoin-transaction-confirmation.en|Confirmations]].

## References

- [Public reference kept from the source note](https://raw.githubusercontent.com/bitcoin/bitcoin/v28.0/doc/release-notes.md).

- [BIP125](https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki).
