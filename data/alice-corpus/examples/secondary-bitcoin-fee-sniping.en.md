---
type: "project_note"
id: "secondary-bitcoin-fee-sniping"
title: "Trying to capture the fees of a recent block"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Fee Sniping", "La tentative de récupérer les frais d’un bloc récent"]
parent_ids: ["block-reward", "bitcoin-finality"]
related_ids: ["block-reward", "bitcoin-finality"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Trying to capture the fees of a recent block

## Questions covered

- What is fee sniping?

## Short answer

A miner may consider rebuilding a recent, particularly lucrative block in an attempt to capture its fees.

## Explanation

- The miner compares the expected revenue of a replacement attempt with that of a new block on the current tip.
- A large fee gap between blocks can change its incentives, but the risk that the attempt fails remains decisive.

## Limits and confusions

Whether it is worthwhile depends on the odds of success and the revenue given up; it is not an inevitable behavior.

## Further reading

- [[block-reward.en|The block reward]] — back to the basic concept.
- [[bitcoin-finality.en|Progressive finality]] — back to the basic concept.

## References

- PlanB btc303 — Bitcoin Development Philosophy
