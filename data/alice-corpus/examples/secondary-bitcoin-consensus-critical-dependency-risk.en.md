---
type: "project_note"
id: "secondary-bitcoin-consensus-critical-dependency-risk"
title: "Consensus-critical software dependencies"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Consensus-Critical Dependency Risk", "Les dépendances logicielles critiques pour le consensus"]
parent_ids: ["bitcoin-consensus", "bitcoin-core"]
related_ids: ["bitcoin-consensus", "bitcoin-core"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Consensus-critical software dependencies

## Questions covered

- Why can a software library cause nodes to diverge?

## Short answer

If different software or library versions interpret the same data differently, nodes can disagree on whether a block is valid.

## Explanation

- Different parsers can accept or reject signatures differently.
- A library update can create a consensus split even when it fixes a bug elsewhere.
- Bitcoin aims to minimize the dependencies that touch consensus.
- BIP66 reduced a problematic dependency on OpenSSL for DER encoding.

## Limits and confusions

An isolated software fix can therefore require additional consensus precautions.

## Further reading

- [[bitcoin-consensus.en|Consensus]] — back to the basic concept.
- [[bitcoin-core.en|The Bitcoin Core software]] — back to the basic concept.

## References

- PlanB btc303 — Bitcoin Development Philosophy
