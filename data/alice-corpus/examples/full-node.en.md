---
type: "project_note"
id: "full-node"
title: "Full validation"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["nodes"]
aliases: ["Full Node", "La validation complète"]
parent_ids: []
related_ids: ["pruned-node", "node-initial-sync", "wallet-node-connection", "secondary-bitcoin-validationless-mining"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/p2p_network.html", "https://bitcoincore.org/en/releases/0.11.0/#block-file-pruning"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Full validation

## Questions covered

- What does a full node verify?

## Short answer

A full node verifies the rules for blocks and transactions, instead of delegating that validation to a server. Storing the entire history is a separate question.

## Explanation

The node notably checks spends, monetary issuance and proof of work. It maintains the state needed to verify new blocks. A wallet connected to this node can use the information the node has verified itself.

An archival node keeps old blocks. A pruned node can delete some files after processing them while remaining a fully validating node. The word "full" should therefore not automatically be set in opposition to "pruned".

## Limits and confusions

Startup and synchronization optimizations require specifying which checks are performed and when. A node does not protect against the theft of a wallet's keys or against an approved malicious address. The wallet actually has to be connected to the node to benefit from its data; simply running one somewhere else is not enough.

## Further reading

- [[pruned-node.en|Pruned nodes]].
- [[node-initial-sync.en|Understanding the initial synchronization]].
- [[wallet-node-connection.en|Connecting a wallet to your node]].

- [[secondary-bitcoin-validationless-mining.en|Mining without having validated the previous block]].

## References

- [Public reference kept from the source note](https://developer.bitcoin.org/devguide/p2p_network.html).
- [Public reference kept from the source note](https://bitcoincore.org/en/releases/0.11.0/#block-file-pruning).
