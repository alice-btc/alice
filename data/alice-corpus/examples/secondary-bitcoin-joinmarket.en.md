---
type: "project_note"
id: "secondary-bitcoin-joinmarket"
title: "How JoinMarket works"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["JoinMarket", "Le fonctionnement de JoinMarket"]
parent_ids: ["coinjoin"]
related_ids: ["coinjoin"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro101 — Bitcoin Development Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# How JoinMarket works

## Questions covered

- How does JoinMarket organize CoinJoin transactions?

## Short answer

JoinMarket organizes CoinJoins between participants who offer liquidity and others who pay for that participation.

## Explanation

- Makers offer to take part in transactions, and takers organize CoinJoins by paying for that participation.
- Funds are signed according to the collaborative protocol; later spends can nevertheless recreate links between participants and outputs.

## Limits and confusions

Privacy also depends on subsequent transactions and on external data; test compatibility should be checked.

## Further reading

- [[coinjoin.en|Understanding CoinJoin]] — back to the basic concept.

## References

- PlanB pro101 — Bitcoin Development Fundamentals
