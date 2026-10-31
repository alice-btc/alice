---
type: "project_note"
id: "ark-fees-and-liquidity"
title: "Ark fees and liquidity"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Ark and other layers"]
aliases: ["Ark Fees and Liquidity", "Les frais et la liquidité d’Ark"]
parent_ids: []
related_ids: ["ark-security-model", "ark-implementations-bark-arkade"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://second.tech/docs/learn/fees", "https://second.tech/docs/learn/liquidity"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Ark fees and liquidity

## Questions covered

- Which costs and constraints need to be understood with Ark?

## Short answer

Ark simplifies liquidity management on the user's side, but does not make its cost disappear. The server commits capital for certain operations, in particular renewals or payments to other systems.

## Explanation

During a renewal, the operator may fund new VTXOs before recovering the old ones. A cooperative exit or a Lightning payment may also require it to advance funds. The duration of this lock-up contributes to the cost of the service.

An internal payment may have a low marginal cost, while an on-chain exit involves Bitcoin fees. It is therefore necessary to distinguish the server's fees, the cost of Bitcoin transactions and any Lightning routing fees. The interface should show the quote for the operation actually requested.

## Limits and confusions

An old fee schedule is not a guaranteed price. The parameters are configurable depending on the operator, the type of operation and the time remaining before expiration. This note does not repeat historical percentages as current prices.

Waiting in order to reduce certain fees must not lead to missing a VTXO's expiry. The savings on a renewal and the margin needed to recover one's funds are 2 constraints to examine together.

## Further reading

- [[ark-security-model.en|Ark's security assumptions]] — understand the expiration risk
- [[ark-implementations-bark-arkade.en|Ark, Bark and Arkade, understanding the differences]] — Bark and Arkade — identify the service concerned

## References

- [Technical reference 1](https://second.tech/docs/learn/fees).
- [Technical reference 2](https://second.tech/docs/learn/liquidity).
