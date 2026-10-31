---
type: "project_note"
id: "secondary-bitcoin-eclipse-attack"
title: "Isolating a node with an eclipse attack"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Eclipse Attack", "L’isolement d’un nœud par attaque eclipse"]
parent_ids: ["bitcoin-p2p-network", "bitcoin-node"]
related_ids: ["bitcoin-p2p-network", "bitcoin-node"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Isolating a node with an eclipse attack

## Questions covered

- Can an attacker hide the network from a Bitcoin node?

## Short answer

An eclipse attack seeks to control a node's connections in order to cut it off from honest peers and hide or delay information from it.

## Explanation

- It can help delay or hide transactions and blocks.
- It often relies on some form of Sybil control over the connections.
- Bitcoin Core uses several heuristics to reduce this risk.

## Limits and confusions

It does not make blocks valid that are invalid under the rules the node verifies.

## Further reading

- [[bitcoin-p2p-network.en|The peer-to-peer network]] — back to the basic concept.
- [[bitcoin-node.en|The role of a Bitcoin node]] — back to the basic concept.

## References

- PlanB btc303 — Bitcoin Development Philosophy
