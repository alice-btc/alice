---
type: "project_note"
id: "secondary-bitcoin-sybil-attack"
title: "Sybil attacks"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Sybil Attack", "Les attaques Sybil"]
parent_ids: ["bitcoin-p2p-network", "bitcoin-consensus"]
related_ids: ["bitcoin-p2p-network", "bitcoin-consensus"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Sybil attacks

## Questions covered

- What can an attacker do by creating many fake participants?

## Short answer

A Sybil attack multiplies the identities controlled by a single adversary. In particular, it can make it easier to isolate a target on the network.

## Explanation

- Bitcoin does not vote by number of nodes, which limits some direct effects.
- Sybil attacks can help isolate a target or reinforce an eclipse attack.
- A social variant can target governance and development debates.

## Limits and confusions

Bitcoin does not choose its chain by a simple vote in which each network identity would count as 1 vote.

## Further reading

- [[bitcoin-p2p-network.en|The peer-to-peer network]] — back to the basic concept.
- [[bitcoin-consensus.en|Consensus]] — back to the basic concept.

## References

- PlanB btc303 — Bitcoin Development Philosophy
