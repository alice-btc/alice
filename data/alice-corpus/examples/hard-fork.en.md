---
type: "project_note"
id: "hard-fork"
title: "Hard forks"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["History and evolution of the protocol"]
aliases: ["Hard Fork", "Les hard forks"]
parent_ids: []
related_ids: ["soft-fork", "bitcoin-governance", "secondary-governance-chain-split-risk"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/block_chain.html#consensus-rule-changes", "https://github.com/bitcoin/bips/blob/master/bip-0099.mediawiki"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Hard forks

## Questions covered

- What is a hard fork?

## Short answer

A hard fork introduces rules that allow certain blocks the old rules reject. Nodes that have not been updated refuse these blocks when they encounter them.

## Explanation

The difference concerns validity, not simply the version displayed by a piece of software. If participants maintain incompatible rules and produce the corresponding chains, a lasting split becomes possible. The acceptance of each chain then depends on its users and its economic actors.

Coordination therefore has to specify what changes, when the new rules apply and how participants choose their software. Accumulated work does not make a block that breaks a node's rules valid for that node.

## Limits and confusions

Publishing a modified copy of the code is not by itself a hard fork of the network. A lasting split is not created automatically with every update or every development branch.

"Soft" and "hard" describe a compatibility relationship, not a moral ranking or a security guarantee. To understand a controversy, one needs to examine the new rules and their concrete consequences rather than infer the quality of the proposal from its label.

## Further reading

- [[soft-fork.en|Soft forks]] — comparing with a tightening of the rules
- [[bitcoin-governance.en|How the rules evolve]] — understanding coordination among participants

- [[secondary-governance-chain-split-risk.en|The risk of divergence between chains]].

## References

- [Bitcoin Developer Guide — incompatibility and possible split](https://developer.bitcoin.org/devguide/block_chain.html#consensus-rule-changes).
- [BIP99 — motivation and deployment of consensus changes](https://github.com/bitcoin/bips/blob/master/bip-0099.mediawiki).
