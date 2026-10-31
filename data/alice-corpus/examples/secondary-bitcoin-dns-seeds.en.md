---
type: "project_note"
id: "secondary-bitcoin-dns-seeds"
title: "Peer discovery through DNS"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["DNS Seeds", "La découverte de pairs par DNS"]
parent_ids: ["bitcoin-p2p-network", "bitcoin-decentralization"]
related_ids: ["bitcoin-p2p-network", "bitcoin-decentralization"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro202 — Programming Bitcoin"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Peer discovery through DNS

## Questions covered

- How does a new node find its first peers?

## Short answer

DNS seeds help a new node discover peers. The addresses received do not decide the validity rules for blocks.

## Explanation

- They help a node with no address book join the network.
- They are maintained by recognized contributors or developers.
- After bootstrapping, the node learns about other peers through the network itself.
- They are not consensus-critical and do not control the validity of blocks.

## Limits and confusions

Poor peer discovery can nevertheless affect the node's availability or isolate it.

## Further reading

- [[bitcoin-p2p-network.en|The peer-to-peer network]] — back to the basic concept.
- [[bitcoin-decentralization.en|Decentralization]] — back to the basic concept.

## References

- PlanB pro202 — Programming Bitcoin
