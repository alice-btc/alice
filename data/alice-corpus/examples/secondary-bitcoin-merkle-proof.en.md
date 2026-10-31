---
type: "project_note"
id: "secondary-bitcoin-merkle-proof"
title: "Merkle proofs"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Merkle Proof", "Les preuves de Merkle"]
parent_ids: ["merkle-tree", "spv-node"]
related_ids: ["merkle-tree", "spv-node"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro202 — Programming Bitcoin"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Merkle proofs

## Questions covered

- What does the inclusion of a transaction in a block prove?

## Short answer

A Merkle proof makes it possible to verify that a piece of data belongs to the tree associated with a known root, without downloading all the leaves.

## Explanation

- The size of the proof grows logarithmically with the number of transactions.
- Light clients can use it together with block headers.
- On its own it does not prove that the transaction is valid, only that it is included in a given block.
- Taproot reuses the idea to reveal only one branch of spending conditions.

## Limits and confusions

The inclusion of a transaction in a block does not by itself prove the validity of the block or the absence of a double spend.

## Further reading

- [[merkle-tree.en|Merkle trees]] — back to the basic concept.
- [[spv-node.en|Lightweight verification]] — back to the basic concept.

## References

- PlanB pro202 — Programming Bitcoin
