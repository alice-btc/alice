---
type: "project_note"
id: "secondary-bitcoin-dual-funded-channels"
title: "Channels funded by both participants"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Dual-Funded Channels", "Les canaux financés par les 2 participants"]
parent_ids: ["lightning-channel", "lightning-liquidity"]
related_ids: ["lightning-channel", "lightning-liquidity"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro101 — Bitcoin Development Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Channels funded by both participants

## Questions covered

- Can both participants contribute funds when a channel is opened?

## Short answer

In a dual-funded channel, both participants can contribute funds at opening, which spreads the initial liquidity.

## Explanation

- They improve the initial distribution of liquidity.
- They require richer coordination at opening.
- They can help with merchant or wallet onboarding.
- They reduce some initial rebalancing needs.

## Limits and confusions

This depends on implementation compatibility and does not guarantee balanced or sufficient liquidity afterwards.

## Further reading

- [[lightning-channel.en|Lightning channels]] — back to the basic concept.
- [[lightning-liquidity.en|Channel liquidity]] — back to the basic concept.

## References

- PlanB pro101 — Bitcoin Development Fundamentals
