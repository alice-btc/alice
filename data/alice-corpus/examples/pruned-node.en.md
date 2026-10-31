---
type: "project_note"
id: "pruned-node"
title: "Pruned nodes"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["nodes"]
aliases: ["Pruned Node", "Le nœud élagué"]
parent_ids: []
related_ids: ["full-node", "pruned-node-history", "node-initial-sync"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc202 — Setting up your first Bitcoin node", "PlanB Extraction — 2026-05-23 — lnp404"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Pruned nodes

## Questions covered

- Can Bitcoin be verified without storing all the old blocks?

## Short answer

A pruned node verifies Bitcoin and then deletes part of the old block files to reduce disk space. It keeps the state needed to validate new blocks.

## Explanation

Pruning separates validation from keeping the history. The node does not turn old blocks into invalid elements; it simply stops keeping some of their data on its disk. This makes it possible to reduce storage needs without replacing validation with mere trust in a server.

This saving does, however, limit some historical lookups and some indexing services. The software has to find the deleted data elsewhere when a new use needs it.

## Limits and confusions

Pruned does not mean SPV. Recovering an old block depends on peers, on the software and on their availability. Depending on the operation, a specific block may be enough or more history may be needed. It is therefore imprecise to claim that everything always has to be downloaded again, or that an old block will always be immediately accessible.

## Further reading

- [[full-node.en|Full validation]].
- [[pruned-node-history.en|Pruning and access to history]].
- [[node-initial-sync.en|Understanding the initial synchronization]].

## References

- PlanB btc202 — Setting up your first Bitcoin node.
- PlanB Extraction — 2026-05-23 — lnp404.
