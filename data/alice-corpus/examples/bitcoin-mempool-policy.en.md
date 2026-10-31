---
type: "project_note"
id: "bitcoin-mempool-policy"
title: "Local rules and consensus"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["nodes"]
aliases: ["Bitcoin Mempool Policy", "Règles locales et consensus"]
parent_ids: []
related_ids: ["bitcoin-mempool", "replace-by-fee", "bitcoin-protocol", "secondary-bitcoin-op-return"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc202 — Setting up your first Bitcoin node"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Local rules and consensus

## Questions covered

- Why do 2 nodes not necessarily have the same pending transactions?

## Short answer

Mempool policy defines what a node accepts, keeps and relays before confirmation. It is distinct from consensus, which determines what a valid block may contain.

## Explanation

Nodes apply conditions on fees, size, replacement and transaction forms. These choices protect their resources and organize their participation in relaying. They can differ between software, versions and settings.

A transaction rejected by one node's policy can therefore remain valid under consensus and reach a miner by another path. If it then appears in a valid block, its earlier absence from that mempool does not automatically make the block invalid.

## Limits and confusions

A local filter does not prevent the whole network from transmitting a transaction. Conversely, accepting a transaction into a mempool does not guarantee its future inclusion. Debates about relaying must state whether they concern a transmission preference or a new block validation rule.

## Further reading

- [[bitcoin-mempool.en|The transaction queue]].
- [[replace-by-fee.en|Raising fees with RBF]].
- [[bitcoin-protocol.en|Bitcoin's rules]].

- [[secondary-bitcoin-op-return.en|OP_RETURN outputs]].

## References

- PlanB btc202 — Setting up your first Bitcoin node.
