---
type: "project_note"
id: "miner-transaction-selection"
title: "How miners choose transactions"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Sélection des transactions", "Transaction selection", "Block template", "Taux de frais des mineurs"]
parent_ids: []
related_ids: ["transaction-fees", "bitcoin-mempool", "bitcoin-mempool-policy", "child-pays-for-parent", "replace-by-fee"]
reviewed_at: "2026-11-13"
review_due: null
sources: ["https://github.com/bitcoin/bitcoin/blob/master/src/consensus/consensus.h", "https://github.com/bitcoin/bitcoin/blob/master/src/node/miner.cpp", "https://github.com/bitcoin/bitcoin/blob/master/src/kernel/mempool_options.h"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# How miners choose transactions

## Questions covered

- How does a miner choose which transactions go into its block?
- Why do miners prioritize transactions with high fees?
- What happens to a transaction that pays much less than the others?
- Do miners sort transactions by the amount sent?

## Short answer

Block space is limited. To maximize their revenue, miners generally pick the transactions that pay the best fee rate, in sats per virtual byte (sat/vB), not those that send the largest amount.

## Explanation

A block cannot exceed 4,000,000 weight units, about 1,000,000 virtual bytes. The miner builds its block template from the waiting transactions it knows about and favours those that earn the most per virtual byte used.

Related transactions are evaluated together: a child paying a high fee can pull its low-fee parent into the block, which is the principle of CPFP. Bitcoin Core groups dependent transactions before ranking them by fee rate.

A transaction paying much less than the others waits as long as better-paying transactions fill the blocks. It can confirm when demand falls, or be dropped by nodes if it waits too long (2 weeks by default in Bitcoin Core) or if their memory fills up. Depending on the wallet, it can be sped up with RBF or CPFP.

## Limits and confusions

This ordering is an economic strategy and a policy of the miner's software, not a consensus rule: a miner may include or exclude what it wants as long as the block is valid. The amount sent does not drive the fee; the transaction's size and fee rate do. No fee rate guarantees confirmation within a precise time.

## Further reading

- [[transaction-fees.en|Transaction fees]].
- [[bitcoin-mempool.en|The mempool]].
- [[child-pays-for-parent.en|Speeding up with CPFP]].

## References

- https://github.com/bitcoin/bitcoin/blob/master/src/consensus/consensus.h.
- https://github.com/bitcoin/bitcoin/blob/master/src/node/miner.cpp.
- https://github.com/bitcoin/bitcoin/blob/master/src/kernel/mempool_options.h.
