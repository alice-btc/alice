---
type: "project_note"
id: "transaction-fees"
title: "Transaction fees"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Transaction Fees", "Les frais de transaction"]
parent_ids: []
related_ids: ["block-weight", "bitcoin-mempool", "replace-by-fee"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB min101 — Introduction to Bitcoin mining", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Transaction fees

## Questions covered

- What are Bitcoin fees for?

## Short answer

Fees pay the miner who includes the transaction in a block. Their amount is the difference between the total value of the inputs and that of the outputs.

## Explanation

The wallet generally proposes a rate in sats per virtual byte, or sat/vB. The total cost depends on this rate and on the transaction's virtual size. As a made-up example, a 200 vB transaction at 5 sat/vB pays 1,000 sats.

Demand for the limited space in blocks influences the rates that allow a fast confirmation. A transaction with many inputs can cost more than a simpler payment of higher value. Miners also weigh transactions that depend on one another.

## Limits and confusions

An estimated rate does not guarantee a confirmation time. Total fees and fee rate are 2 different indicators. The withdrawal fees charged by a platform do not necessarily match the fees it pays to the miner. No fixed percentage of the amount sent defines Bitcoin fees.

## Further reading

- [[block-weight.en|Virtual size and weight]].
- [[bitcoin-mempool.en|The transaction queue]].
- [[replace-by-fee.en|Raising fees with RBF]].

## References

- PlanB min101 — Introduction to Bitcoin mining.
- PlanB Extraction — 2026-05-23.
