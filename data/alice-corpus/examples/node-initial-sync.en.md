---
type: "project_note"
id: "node-initial-sync"
title: "Understanding the initial synchronization"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["nodes"]
aliases: ["IBD", "initial block download", "Comprendre la première synchronisation"]
parent_ids: ["bitcoin-node"]
related_ids: ["pruned-node-history"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/p2p_network.html", "https://bitcoincore.org/en/releases/0.14.0/", "https://bitcoincore.org/en/releases/28.0/", "https://github.com/bitcoin/bitcoin/blob/v28.0/doc/design/assumeutxo.md"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Understanding the initial synchronization

## Questions covered

- Why does an initial synchronization take so long?
- Why does pruning not remove all of the initial work?

## Short answer

The initial synchronization builds the chain state the node needs from the network's data. It involves downloading and local processing.

## Explanation

The duration depends on the processor, the disk, the connection, the available memory and the cache configuration. A larger cache can reduce disk access during validation, within the limits of the memory actually available. Reducing the retention of old blocks does not automatically remove their processing. Optimized startup mechanisms must be distinguished from the classic path and assessed according to their assumptions.

Bitcoin Core notably offers 2 distinct mechanisms.

- `assumevalid` makes it possible, under certain conditions, to skip re-verifying the scripts and signatures of old blocks preceding a reference block considered valid. The blocks are still downloaded and the other rules are still checked. This mechanism reduces computational work; it does not replace the history with a downloaded state. It can be disabled to verify those scripts too.
- AssumeUTXO makes it possible to load a snapshot of the UTXO set at a height recognized by the software. Its hash must match the one recorded in Bitcoin Core. The node can then reach the chain tip from that state while another synchronization processes the history in the background. The reconstructed state is compared with the expected state once that historical verification is complete. Bitcoin Core 28.0 documents this possibility on mainnet at height 840,000.

## Limits and confusions

No universal duration is guaranteed. A progress percentage does not always predict a constant remaining time. This note does not claim that every configuration runs exactly the same historical checks.

With AssumeUTXO, faster availability and completed historical verification are 2 distinct stages. The historical work is not removed. Block downloading, indexes and temporary disk space remain constraints; a snapshot does not by itself provide a wallet's transaction history. These descriptions concern the mechanisms documented in Bitcoin Core, without claiming that Alice configures or uses them.

## Further reading

- [[pruned-node-history.en|Pruning and access to history]] (pruned-node-history) — understanding what remains stored after processing.

## References

- [Bitcoin Developer Guide, network and synchronization](https://developer.bitcoin.org/devguide/p2p_network.html).
- [Bitcoin Core 0.14.0, introduction of `assumevalid`](https://bitcoincore.org/en/releases/0.14.0/#introduction-of-assumed-valid-blocks).
- [Bitcoin Core 28.0, AssumeUTXO support on mainnet](https://bitcoincore.org/en/releases/28.0/).
- [Bitcoin Core 28.0, how AssumeUTXO works and its limits](https://github.com/bitcoin/bitcoin/blob/v28.0/doc/design/assumeutxo.md).
