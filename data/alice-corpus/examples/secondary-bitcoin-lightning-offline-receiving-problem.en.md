---
type: "project_note"
id: "secondary-bitcoin-lightning-offline-receiving-problem"
title: "Receiving on Lightning while offline"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Lightning Offline Receiving Problem", "Recevoir sur Lightning en étant hors ligne"]
parent_ids: ["lightning-node-online-status", "lightning-service-provider"]
related_ids: ["lightning-node-online-status", "lightning-service-provider"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro101 — Bitcoin Development Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Receiving on Lightning while offline

## Questions covered

- Why does receiving on Lightning require available infrastructure?

## Short answer

Receiving a Lightning payment generally requires that some infrastructure taking part in settlement be available. A wallet can delegate or defer part of the work depending on its design.

## Explanation

- Unlike an on-chain address, a Lightning invoice involves interactivity.
- Wallets can rely on LSPs or custodians to hide this problem.
- Solutions should preserve security and non-custody as much as possible.
- It is a major obstacle for mainstream UX.

## Limits and confusions

An interface that works offline does not prove the absence of a third party or complete settlement autonomy.

## Further reading

- [[lightning-node-online-status.en|Node availability]] — back to the basic concept.
- [[lightning-service-provider.en|Lightning service providers]] — back to the basic concept.

## References

- PlanB pro101 — Bitcoin Development Fundamentals
