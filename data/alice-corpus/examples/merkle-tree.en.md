---
type: "project_note"
id: "merkle-tree"
title: "Merkle trees"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Cryptography and protocol limits"]
aliases: ["Merkle Tree", "Les arbres de Merkle"]
parent_ids: []
related_ids: ["cryptographic-hash-function", "bitcoin-node", "secondary-addresses-mast", "secondary-bitcoin-collision-resistance", "secondary-bitcoin-merkle-proof"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB min101 — Introduction to Bitcoin mining"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Merkle trees

## Questions covered

- How are the transactions of a block summarized?

## Short answer

A Merkle tree combines hashes to summarize a set of data in a root. In Bitcoin, this structure notably makes it possible to prove the inclusion of a transaction in a block.

## Explanation

The transaction hashes are combined step by step until a root hash is obtained and committed in the block header. To verify the inclusion of a transaction, a proof provides the hashes needed along the path. All the other transactions do not need to be transmitted for that specific check.

This construction makes a compact proof tied to the block's content possible. If a piece of data changes, the values computed along the path no longer match the expected root, under the security assumptions of the hash function.

## Limits and confusions

An inclusion proof does not by itself prove that all the block's rules were applied correctly. Nor does it demonstrate that the output is still unspent or that the block will remain in the followed chain.

Light clients and full nodes therefore do not necessarily perform the same checks. The Merkle tree is a useful building block, not a universal substitute for transaction validation and tracking of the history.

## Further reading

- [[cryptographic-hash-function.en|The cryptographic hash]] — understanding the hash used
- [[bitcoin-node.en|The role of a Bitcoin node]] — distinguishing inclusion from full validation

- [[secondary-addresses-mast.en|Trees of spending conditions]].
- [[secondary-bitcoin-collision-resistance.en|Collision resistance]].
- [[secondary-bitcoin-merkle-proof.en|Merkle proofs]].

## References

- PlanB min101 — Introduction to Bitcoin mining (reference from the source note, not re-consulted directly for this adaptation).
