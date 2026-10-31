---
type: "project_note"
id: "coinjoin"
title: "Understanding CoinJoin"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["CoinJoin", "Comprendre CoinJoin"]
parent_ids: []
related_ids: ["common-input-ownership-heuristic", "coin-control", "payjoin", "secondary-bitcoin-blind-signatures", "secondary-bitcoin-joinmarket", "secondary-bitcoin-privacy-by-obfuscation"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc204 — Privacy on Bitcoin", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Understanding CoinJoin

## Questions covered

- What does a CoinJoin do, and what does it not guarantee?

## Short answer

A CoinJoin is a transaction built by several participants. It aims to make the association between their inputs and their outputs less certain, without hiding the existence of the transaction.

## Explanation

Bitcoin's structure allows combining several inputs and outputs with the necessary authorizations. Depending on the protocol, some outputs share common characteristics that make interpretation more ambiguous. The assumption that all the inputs have a single owner can then be false.

The coordination arrangements, fees and privacy vary by implementation. Later uses of the funds can also recreate links; the collaborative transaction does not magically reset the whole history.

## Limits and confusions

CoinJoin guarantees no absolute anonymity and removes neither the amounts nor the transactions from the chain. This principle must not be confused with a service that takes the funds into custody and promises to return them. The current availability and the properties of a specific product require separate verification; the historical names in the source are not recommendations.

## Further reading

- [[common-input-ownership-heuristic.en|The common-input ownership assumption]].
- [[coin-control.en|Choosing the funds to spend]].
- [[payjoin.en|Understanding PayJoin]].

- [[secondary-bitcoin-blind-signatures.en|Blind signatures]].
- [[secondary-bitcoin-joinmarket.en|How JoinMarket works]].
- [[secondary-bitcoin-privacy-by-obfuscation.en|Privacy through ambiguous links]].

## References

- PlanB btc204 — Privacy on Bitcoin.
- PlanB Extraction — 2026-05-23.
