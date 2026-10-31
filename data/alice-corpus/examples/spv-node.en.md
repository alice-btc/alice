---
type: "project_note"
id: "spv-node"
title: "Lightweight verification"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["nodes"]
aliases: ["SPV Node", "La vérification légère"]
parent_ids: []
related_ids: ["full-node", "pruned-node", "wallet-node-connection", "secondary-bitcoin-compact-block-filters", "secondary-bitcoin-merkle-proof"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://bitcoin.org/bitcoin.pdf", "https://developer.bitcoin.org/devguide/operating_modes.html"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Lightweight verification

## Questions covered

- What does a light client verify?

## Short answer

An SPV client performs lightweight verification from block headers and inclusion proofs. It does not verify every transaction and every rule the way a full node does.

## Explanation

The client can check the work represented by the headers and a proof linking a transaction to a block. It compares the chains it knows by their cumulative work. This reduces the resources needed compared with processing every block.

The proof shows inclusion in the block in question. On its own, it does not demonstrate that every spend and every monetary rule across that whole history has been verified by the client.

## Limits and confusions

The client's view depends on the peers or servers it accesses. Less data downloaded and the same validation guarantees are 2 different things. The privacy effects also depend on how transactions are requested. A pruned node is not an SPV client; it can keep less history while still performing full validation.

## Further reading

- [[full-node.en|Full validation]].
- [[pruned-node.en|Pruned nodes]].
- [[wallet-node-connection.en|Connecting a wallet to your node]].

- [[secondary-bitcoin-compact-block-filters.en|Compact block filters]].
- [[secondary-bitcoin-merkle-proof.en|Merkle proofs]].

## References

- [Public reference kept from the source note](https://bitcoin.org/bitcoin.pdf).
- [Public reference kept from the source note](https://developer.bitcoin.org/devguide/operating_modes.html).
