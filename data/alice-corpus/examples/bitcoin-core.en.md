---
type: "project_note"
id: "bitcoin-core"
title: "The Bitcoin Core software"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["nodes"]
aliases: ["Bitcoin Core", "Le logiciel Bitcoin Core"]
parent_ids: []
related_ids: ["bitcoin-protocol", "bitcoin-mempool-policy", "software-integrity-verification", "secondary-bitcoin-bitcoin-core-development-funding", "secondary-bitcoin-bitcoin-core-maintenance", "secondary-bitcoin-consensus-critical-dependency-risk", "secondary-bitcoin-open-source-security-review", "secondary-nodes-bitcoin-indexer", "secondary-nodes-node-in-a-box"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB Extraction — 2026-05-23", "PlanB btc202 — Setting up your first Bitcoin node"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The Bitcoin Core software

## Questions covered

- What is the difference between Bitcoin and Bitcoin Core?

## Short answer

Bitcoin Core is a piece of software that implements Bitcoin's rules and, among other things, lets you run a node. The software, the protocol and the network of users are 3 distinct things.

## Explanation

The software verifies blocks and transactions, exchanges with peers and offers local functions. Its code evolves through contributions and reviews. A published version still has to be adopted by the people who run nodes.

This distinction helps in understanding the debates. A change to the local relay policy is not necessarily a change to the consensus rules. The developers do not have a button that lets them modify the balances of all users.

## Limits and confusions

The importance of Bitcoin Core does not mean that every user runs the same software or the same version. The open nature of the code makes review easier without guaranteeing the absence of bugs. Claims should be dated to a specific version, and the release notes checked, before presenting a feature as available.

## Further reading

- [[bitcoin-protocol.en|Bitcoin's rules]].
- [[bitcoin-mempool-policy.en|Local rules and consensus]].
- [[software-integrity-verification.en|Verifying a download]].

- [[secondary-bitcoin-bitcoin-core-development-funding.en|Funding Bitcoin Core development]].
- [[secondary-bitcoin-bitcoin-core-maintenance.en|The role of Bitcoin Core maintainers]].
- [[secondary-bitcoin-consensus-critical-dependency-risk.en|Consensus-critical software dependencies]].
- [[secondary-bitcoin-open-source-security-review.en|Security review of open-source code]].
- [[secondary-nodes-bitcoin-indexer.en|Bitcoin indexers]].
- [[secondary-nodes-node-in-a-box.en|Ready-to-install node solutions]].

## References

- PlanB Extraction — 2026-05-23.
- PlanB btc202 — Setting up your first Bitcoin node.
