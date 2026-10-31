---
type: "project_note"
id: "bitcoin-consensus"
title: "Consensus"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Cryptography and protocol limits"]
aliases: ["Bitcoin Consensus", "Le consensus"]
parent_ids: []
related_ids: ["51-attack", "bitcoin-governance", "secondary-bitcoin-bitcoin-security-assumptions", "secondary-bitcoin-consensus-critical-dependency-risk", "secondary-bitcoin-sybil-attack", "secondary-governance-chain-split-risk", "secondary-history-bip50-chain-split"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc101 — The Bitcoin Journey"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Consensus

## Questions covered

- How do independent nodes enforce the same rules?

## Short answer

Bitcoin consensus lets nodes converge on the same valid history. Each node enforces validity rules and compares the accumulated work of the chains that respect them.

## Explanation

Miners propose blocks. Nodes verify, among other things, the transactions, the spending conditions and the authorized issuance. A large amount of work does not make a block acceptable if it is invalid under their rules.

Competing blocks can appear temporarily. The progression of accumulated work helps nodes decide between valid chains. This is why 1 confirmation does not offer the same assurance as several additional blocks built after the transaction.

## Limits and confusions

Consensus is not a simple vote in which each computer or each miner would have a voice to change the rules at will. Producing blocks and choosing the rules to verify are distinct roles.

A divergence in rules can lead groups to follow incompatible histories. Governance, which organizes the discussion and adoption of changes, therefore complements the technical mechanism without being the same thing. The model also assumes certain network and computing-power conditions; it does not guarantee the absolute absence of attacks.

## Further reading

- [[51-attack.en|The majority attack]] — understand the limits of a mining majority
- [[bitcoin-governance.en|How the rules evolve]] — distinguish the mechanism from the evolution of the rules

- [[secondary-bitcoin-bitcoin-security-assumptions.en|Bitcoin's security assumptions]].
- [[secondary-bitcoin-consensus-critical-dependency-risk.en|Consensus-critical software dependencies]].
- [[secondary-bitcoin-sybil-attack.en|Sybil attacks]].
- [[secondary-governance-chain-split-risk.en|The risk of divergence between chains]].
- [[secondary-history-bip50-chain-split.en|The accidental chain split of March 2013]].

## References

- PlanB btc101 — The Bitcoin Journey (reference from the source note, not re-consulted directly for this adaptation).
