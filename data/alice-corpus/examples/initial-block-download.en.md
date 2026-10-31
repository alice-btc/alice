---
type: "project_note"
id: "initial-block-download"
title: "The initial synchronization"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["nodes"]
aliases: ["Initial Block Download", "La synchronisation initiale"]
parent_ids: []
related_ids: ["node-initial-sync", "pruned-node", "utxo-set"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc202 — Setting up your first Bitcoin node"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The initial synchronization

## Questions covered

- Why does a new node have to synchronize?

## Short answer

The initial synchronization lets a new node reach a consistent state of the chain. It obtains the necessary data and performs the validation steps set by its configuration.

## Explanation

The time taken depends on the network, storage, processor, available memory and settings. The node has to rebuild and maintain the outputs that are still spendable, not merely copy a list of blocks. After this phase, following new blocks generally requires less work than processing the entire history.

The AssumeValid and AssumeUTXO mechanisms address different stages of this startup. Their role and their assumptions are explained in a secondary note, rather than lumped together under a vague promise of faster downloading.

## Limits and confusions

Reducing the space kept through pruning does not remove every synchronization step. A "ready" indication or a percentage must be interpreted according to what remains to be verified. Increasing the allocated memory only helps within the limits of the device and its other needs; no universal duration can be announced for all nodes.

## Further reading

- [[node-initial-sync.en|Understanding the initial synchronization]].
- [[pruned-node.en|Pruned nodes]].
- [[utxo-set.en|The state of unspent outputs]].

## References

- PlanB btc202 — Setting up your first Bitcoin node.
