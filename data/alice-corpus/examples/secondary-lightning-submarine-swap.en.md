---
type: "project_note"
id: "secondary-lightning-submarine-swap"
title: "Moving between Bitcoin and Lightning with a swap"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Submarine Swap", "Passer entre Bitcoin et Lightning par un swap"]
parent_ids: ["atomic-swap", "lightning-liquidity"]
related_ids: ["atomic-swap", "lightning-liquidity"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB dev303 — Learning Rust with Bitcoin"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Moving between Bitcoin and Lightning with a swap

## Questions covered

- Moving between Bitcoin and Lightning with a swap — what is the mechanism and what are its limits?

## Short answer

A submarine swap exchanges liquidity between Lightning and on-chain Bitcoin, making it possible to move from one layer to the other without exposing the user to all of the complexity.

## Explanation

- It can make it possible to pay on-chain with Lightning funds, or the reverse.
- SDKs can integrate it to present a unified balance.
- Swaps add fees, delays and service assumptions.
- They improve interoperability between L1 and Lightning.

## Limits and confusions

A swap is not a change of channel capacity through splicing. Fees, delays, available liquidity and refund conditions depend on the protocol and the service.

## Further reading

- [[atomic-swap.en|Atomic swaps]] — to place this mechanism in context.
- [[lightning-liquidity.en|Channel liquidity]] — to place this mechanism in context.

## References

- PlanB dev303 — Learning Rust with Bitcoin
