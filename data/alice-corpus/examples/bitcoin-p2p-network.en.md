---
type: "project_note"
id: "bitcoin-p2p-network"
title: "The peer-to-peer network"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["nodes"]
aliases: ["Bitcoin P2P Network", "Le réseau de pairs"]
parent_ids: []
related_ids: ["bitcoin-node", "bitcoin-mempool", "bitcoin-p2p-privacy", "secondary-bitcoin-dns-seeds", "secondary-bitcoin-eclipse-attack", "secondary-bitcoin-sybil-attack"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc303 — Bitcoin Development Philosophy", "PlanB Extraction — 2026-05-23 — pro202"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The peer-to-peer network

## Questions covered

- How do nodes communicate?

## Short answer

The peer-to-peer network connects the nodes that exchange transactions and blocks. No single central server is responsible for distributing the whole history.

## Explanation

Each node communicates with a set of peers. It can receive announcements, request data and pass on what it accepts according to its rules. Propagation does not happen instantly everywhere, which explains temporary differences in what nodes know.

The diversity and quality of connections matter for availability and resistance to manipulation. A node that receives its information only from hostile actors can have a limited view, even if it keeps verifying the validity of the data it receives.

## Limits and confusions

Receiving a block from a peer does not mean trusting that peer about its validity. Local verification rules remain essential. Conversely, verifying the data does not guarantee receiving all the information available. Network privacy is also distinct from the privacy of the amounts and relationships published in the chain.

## Further reading

- [[bitcoin-node.en|The role of a Bitcoin node]].
- [[bitcoin-mempool.en|The transaction queue]].
- [[bitcoin-p2p-privacy.en|Privacy on the network]].

- [[secondary-bitcoin-dns-seeds.en|Peer discovery through DNS]].
- [[secondary-bitcoin-eclipse-attack.en|Isolating a node with an eclipse attack]].
- [[secondary-bitcoin-sybil-attack.en|Sybil attacks]].

## References

- PlanB btc303 — Bitcoin Development Philosophy.
- PlanB Extraction — 2026-05-23 — pro202.
