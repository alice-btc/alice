---
type: "project_note"
id: "bitcoin-finite-supply"
title: "The limit on bitcoin supply"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["fundamentals"]
aliases: ["Bitcoin Finite Supply", "La limite de l’offre de bitcoins"]
parent_ids: []
related_ids: ["bitcoin-monetary-policy", "bitcoin-halving", "lost-bitcoins", "secondary-economics-coin-clipping", "secondary-economics-stock-to-flow-ratio"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The limit on bitcoin supply

## Questions covered

- Why do people talk about 21 million?

## Short answer

The cap commonly summarized as 21 million BTC follows from Bitcoin's issuance rules. Nodes reject blocks that create more than the authorized subsidy.

## Explanation

The subsidy starts at a set amount and then decreases through successive halvings. With whole amounts in satoshis, it eventually becomes zero. The sum of this issuance remains slightly below 21 million. This mechanism is distinct from fees, which transfer existing bitcoins to miners.

The supply theoretically issued must also be distinguished from the supply still usable. Some bitcoins have become impossible to spend, or their holders have lost the means to recover them. These losses do not trigger any compensating issuance.

## Limits and confusions

Scarcity guarantees neither demand, nor purchasing power, nor a price increase. A software change cannot automatically impose a new cap on nodes that keep the previous rules. The code also includes amount checks; the issuance schedule explains the total, rather than a central counter stopping payments.

## Further reading

- [[bitcoin-monetary-policy.en|Bitcoin's monetary issuance]].
- [[bitcoin-halving.en|The halving]].
- [[lost-bitcoins.en|Lost bitcoins]].

- [[secondary-economics-coin-clipping.en|The historical clipping of coins]].
- [[secondary-economics-stock-to-flow-ratio.en|The stock-to-flow ratio and its limits]].

## References

- PlanB btc303 — Bitcoin Development Philosophy.
