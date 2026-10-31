---
type: "project_note"
id: "bitcoin-pseudonymity"
title: "Pseudonymous does not mean anonymous"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Bitcoin Pseudonymity", "Pseudonyme ne veut pas dire anonyme"]
parent_ids: []
related_ids: ["blockchain-privacy-leaks", "bitcoin-chain-analysis", "non-blockchain-privacy-leaks", "secondary-bitcoin-cypherpunk-manifesto", "secondary-bitcoin-no-kyc-mining-rewards", "secondary-bitcoin-virgin-bitcoin"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Pseudonymous does not mean anonymous

## Questions covered

- Are my Bitcoin payments anonymous?

## Short answer

Bitcoin is pseudonymous, not anonymous by default. The chain does not require a legal name for each payment, but its public data can be linked to a person through other information.

## Explanation

An address acts as a cryptographic identifier. Several addresses can be created by the same wallet. The amounts and the relationships between transactions nevertheless remain observable in the ledger.

A merchant sometimes knows their customer; a platform can associate a withdrawal with an identified account. Reusing an address or certain groupings of funds can extend these links to other transactions. Data collected at different times can be combined.

## Limits and confusions

A new address does not guarantee a fresh start with a history that cannot be linked. Conversely, an analysis hypothesis does not always prove a user's identity. Visible facts, data provided by a third party and inferences must be distinguished. Privacy depends on a set of practices, on the tools and on the information already disclosed.

## Further reading

- [[blockchain-privacy-leaks.en|Public information on the chain]].
- [[bitcoin-chain-analysis.en|Chain analysis]].
- [[non-blockchain-privacy-leaks.en|Leaks outside the blockchain]].

- [[secondary-bitcoin-cypherpunk-manifesto.en|A Cypherpunk's Manifesto]].
- [[secondary-bitcoin-no-kyc-mining-rewards.en|Receiving rewards without KYC]].
- [[secondary-bitcoin-virgin-bitcoin.en|Freshly mined bitcoins]].

## References

- PlanB btc303 — Bitcoin Development Philosophy.
