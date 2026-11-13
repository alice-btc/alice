---
type: "project_note"
id: "chain-reorganization"
title: "Chain reorganizations (reorg)"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Reorg", "Réorganisation de chaîne", "Chain reorganization", "Bloc orphelin", "Orphan block"]
parent_ids: []
related_ids: ["bitcoin-transaction-confirmation", "bitcoin-finality", "secondary-bitcoin-stale-block"]
reviewed_at: "2026-11-13"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/block_chain.html"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Chain reorganizations (reorg)

## Questions covered

- What is a reorg?
- What happens when a block is orphaned or replaced by another one?
- Can a reorganization undo a transaction that was already confirmed?
- Why does a block explorer show an abandoned block?

## Short answer

A chain reorganization, or reorg, happens when nodes drop the last block or blocks of their active chain to follow another valid branch that carries more accumulated work.

## Explanation

Two miners can find 2 valid blocks at the same height almost at the same time. Nodes provisionally follow the one they received first, then switch to the branch with the most accumulated work when a following block arrives. The dropped block becomes a valid but abandoned block, often called an orphan or stale block. It was neither invalid nor hacked.

The transactions of the dropped block do not all disappear: those already included in the winning branch stay confirmed, the others become unconfirmed again and can be included in a later block. During that window, a conflicting transaction spending the same funds can confirm instead.

This is why a transaction with 1 confirmation can become unconfirmed again. Each block added afterwards makes such a reversal less likely, which is why large amounts wait for several confirmations.

## Limits and confusions

A 1-block reorg happens occasionally; deep reorgs are rare and require a lot of hashing power. The number of confirmations to wait for is a prudence convention, not a protocol rule. The reward of the miner whose block is dropped is not kept.

## Further reading

- [[bitcoin-transaction-confirmation.en|Confirmations]].
- [[bitcoin-finality.en|Payment finality]].
- [[secondary-bitcoin-stale-block.en|Valid blocks that are not kept]].

## References

- https://developer.bitcoin.org/devguide/block_chain.html.
