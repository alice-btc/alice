---
type: "project_note"
id: "pruned-node-history"
title: "Pruning and access to history"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["nodes"]
aliases: ["pruning", "blocs élagués", "Élagage et accès à l’historique"]
parent_ids: ["bitcoin-node"]
related_ids: ["node-initial-sync"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://bitcoincore.org/en/releases/0.11.0/#block-file-pruning", "https://bitcoincore.org/en/doc/30.0.0/rpc/blockchain/getblockfrompeer/"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Pruning and access to history

## Questions covered

- Why can my pruned node not find an old block?
- Does pruned mean incomplete verification?

## Short answer

Pruning reduces the block files that are kept. By itself, it does not turn a fully validating node into a light client.

## Explanation

After processing the blocks, the node keeps the state needed for current validation and can delete old data. A request for a deleted block cannot be served from that missing local file. A historical operation can therefore require fetching data again.

Looking up a specific block must be distinguished from an operation that needs a long period of history. Bitcoin Core 30.0 documents `getblockfrompeer`, which makes it possible to request a block from a connected peer when its header is known. This can avoid redoing the whole chain for that single lookup. The request does not guarantee that the peer will provide the block; a response saying the request is scheduled is not a confirmation of receipt.

An operation covering many old transactions may require more blocks, the use of another source of history or a broader re-download. The extent depends on the need, the data kept and the capabilities of the software. One should therefore claim neither that a single block is always enough, nor that every historical request requires re-downloading the entire chain.

## Limits and confusions

Recovery and indexing possibilities depend on the software and its version. The historical source cited documents the principle; its software limits from 2015 are not presented as current capabilities.

According to the Bitcoin Core 30.0 documentation, a block fetched from a peer can be pruned again as soon as it is received. This fetch does not recreate the block's undo data, which limits the uses that depend on it. Fetching a block therefore does not turn the node into an archival node and does not automatically rebuild all the history needed for another operation.

## Further reading

- [[node-initial-sync.en|Understanding the initial synchronization]] (node-initial-sync) — distinguishing the initial synchronization from the storage kept.

## References

- [Bitcoin Core 0.11.0, historical introduction of pruning](https://bitcoincore.org/en/releases/0.11.0/#block-file-pruning).
- [Bitcoin Core 30.0, targeted fetch of a block from a peer and its limits](https://bitcoincore.org/en/doc/30.0.0/rpc/blockchain/getblockfrompeer/).
