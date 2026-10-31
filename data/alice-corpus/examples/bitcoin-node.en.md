---
type: "project_note"
id: "bitcoin-node"
title: "The role of a Bitcoin node"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["nodes"]
aliases: ["nœud Bitcoin", "node", "Le rôle d’un nœud Bitcoin"]
parent_ids: []
related_ids: ["pruned-node-history", "node-initial-sync", "secondary-bitcoin-eclipse-attack", "secondary-nodes-node-in-a-box"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/operating_modes.html", "https://developer.bitcoin.org/devguide/p2p_network.html", "https://bitcoincore.org/en/releases/0.11.0/#block-file-pruning"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The role of a Bitcoin node

## Questions covered

- What is a node for if I do not mine?
- Does a full node have to keep every block?

## Short answer

A validating node verifies blocks and transactions according to the rules it enforces. It lets you check the data you receive instead of depending solely on the result provided by a service.

## Explanation

Mining and verifying are 2 different functions. A node can verify without taking part in mining. Full validation does not require keeping the old block files forever: a pruned node can delete them after processing.

## Limits and confusions

Running a node does not mean that every application uses it. Their connection must be configured. A node does not replace a backup of the keys.

## Further reading

- [[pruned-node-history.en|Pruning and access to history]] (pruned-node-history) to distinguish validation from the availability of old data.
- [[node-initial-sync.en|Understanding the initial synchronization]] (node-initial-sync) to understand the synchronization work.

- [[secondary-bitcoin-eclipse-attack.en|Isolating a node with an eclipse attack]].
- [[secondary-nodes-node-in-a-box.en|Ready-to-install node solutions]].

## References

- [Bitcoin Developer Guide, verification modes](https://developer.bitcoin.org/devguide/operating_modes.html).
- [Bitcoin Developer Guide, P2P network and pruned nodes](https://developer.bitcoin.org/devguide/p2p_network.html).
- [Bitcoin Core 0.11.0, historical introduction of pruning](https://bitcoincore.org/en/releases/0.11.0/#block-file-pruning).
