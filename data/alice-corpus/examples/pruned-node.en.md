---
type: "project_note"
id: "pruned-node"
title: "Pruned nodes"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["nodes"]
aliases: ["Pruned Node", "prune", "espace disque d’un nœud", "Le nœud élagué"]
parent_ids: []
related_ids: ["full-node", "pruned-node-history", "node-initial-sync"]
reviewed_at: "2026-11-02"
review_due: null
sources: ["https://bitcoincore.org/en/releases/0.11.0/#block-file-pruning", "https://ycharts.com/indicators/bitcoin_blockchain_size", "PlanB btc202 — Setting up your first Bitcoin node", "PlanB Extraction — 2026-05-23 — lnp404"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "reviewed"
---
# Pruned nodes

## Questions covered

- Can Bitcoin be verified without storing all the old blocks?
- How much disk space does a pruned node need?

## Short answer

A pruned node downloads and verifies the whole chain like a full node, then deletes the old block files to fit in a few tens of GB at most. It keeps the state needed to validate new blocks and trusts no server.

## Explanation

Pruning is not enabled by default in Bitcoin Core: it is requested with the `prune` setting, in MiB, with a minimum of 550 so that at least the latest blocks are kept. Once enabled, the node deletes the oldest block files as the target is exceeded.

The initial synchronization stays complete: the node downloads every block from the genesis block, validates it, updates the set of unspent outputs, and only then discards the file. Synchronization time and network traffic are those of a full node; only the final disk space changes. The full chain weighed about 760 GB in the summer of 2026 and grows by several tens of GB a year. A pruned node keeps only the chosen target, plus the set of unspent outputs and its indexes, about fifteen GB with the minimum target. A laptop with 100 GB free is more than enough.

## Limits and confusions

Pruned does not mean SPV: validation is the same. Recovering an old block depends on peers, on the software and on their availability. Depending on the operation, a specific block may be enough or more history may be needed. A pruned node cannot serve the full history to other nodes or to an explorer, and importing an old wallet may require downloading blocks again. The chain size quoted is a dated order of magnitude, not a current value.

## Further reading

- [[full-node.en|Full validation]].
- [[pruned-node-history.en|Pruning and access to history]].
- [[node-initial-sync.en|Understanding the initial synchronization]].

## References

- [Bitcoin Core 0.11.0, introduction of block file pruning](https://bitcoincore.org/en/releases/0.11.0/#block-file-pruning).
- [Bitcoin blockchain size, daily series](https://ycharts.com/indicators/bitcoin_blockchain_size).
- PlanB btc202 — Setting up your first Bitcoin node.
- PlanB Extraction — 2026-05-23 — lnp404.
