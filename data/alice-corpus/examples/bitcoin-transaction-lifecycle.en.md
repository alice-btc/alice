---
type: "project_note"
id: "bitcoin-transaction-lifecycle"
title: "The journey of a transaction"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Bitcoin Transaction Lifecycle", "Le parcours d’une transaction"]
parent_ids: []
related_ids: ["bitcoin-mempool", "bitcoin-transaction-confirmation", "replace-by-fee"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc101 — The Bitcoin Journey"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The journey of a transaction

## Questions covered

- What happens between sending and confirmation?

## Short answer

A transaction is prepared by a wallet, signed, broadcast and then possibly included in a block. It gets its 1st confirmation when that block belongs to the chain followed by the nodes.

## Explanation

The wallet chooses the funds to spend and the new outputs, including any change. The signatures authorize the spend according to the conditions of those funds. After broadcast, nodes verify the transaction and can pass it on to their peers.

A miner selects transactions for its candidate block. If the block is found and accepted, the spent outputs are replaced in the ledger's state by the new outputs. The following blocks add confirmations.

## Limits and confusions

Signing does not mean broadcasting, and broadcasting does not mean confirming. Mempools are not identical, and a transaction can be replaced, evicted or remain pending for a long time. A wallet displaying "sent" must therefore be interpreted according to what its indicator actually means. 1 confirmation is not an absolute guarantee against a reorganization.

## Further reading

- [[bitcoin-mempool.en|The transaction queue]].
- [[bitcoin-transaction-confirmation.en|Confirmations]].
- [[replace-by-fee.en|Raising fees with RBF]].

## References

- PlanB btc101 — The Bitcoin Journey.
