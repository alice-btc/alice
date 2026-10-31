---
type: "project_note"
id: "lightning-service-provider"
title: "Lightning service providers"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Lightning Service Provider", "Lightning Inbound Liquidity Market", "Les fournisseurs de services Lightning"]
parent_ids: []
related_ids: ["lightning-privacy-tradeoff", "inbound-liquidity", "secondary-bitcoin-lightning-offline-receiving-problem", "secondary-lightning-just-in-time-lightning-channel", "secondary-lightning-lightning-node-recovery-tradeoff"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB pro101 — Bitcoin Development Fundamentals"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Lightning service providers

## Questions covered

- What does an LSP do?

## Short answer

A Lightning Service Provider, or LSP, helps a wallet obtain channels, liquidity and better availability. It can simplify usage without necessarily holding the user's keys.

## Explanation

A new wallet can lack receiving capacity or struggle to stay available. Depending on its architecture, the LSP makes it easier to open channels, provides liquidity or maintains a suitable connection. Some functions can be triggered at the time of the first payment.

This arrangement spares the user from managing every operational detail. It does, however, introduce a service with prices, constraints and visible information. The user needs to know what happens if this provider becomes unavailable.

## Limits and confusions

LSP and custodial wallet are not synonyms. The main criterion remains control of the keys and the ability to recover the funds without depending on a discretionary decision by the provider. That recovery can itself involve delays and costs.

"Non-custodial" means neither the absence of dependency nor total privacy. The provider can observe amounts, timing or liquidity needs depending on how the wallet works.

## Further reading

- [[lightning-privacy-tradeoff.en|Privacy on Lightning]] — examining the information revealed
- [[inbound-liquidity.en|Receiving capacity]] — understanding the need to receive

- [[secondary-bitcoin-lightning-offline-receiving-problem.en|Receiving on Lightning while offline]].
- [[secondary-lightning-just-in-time-lightning-channel.en|Channels opened on demand]].
- [[secondary-lightning-lightning-node-recovery-tradeoff.en|The recovery dependencies of a Lightning node]].

## References

- PlanB pro101 — Bitcoin Development Fundamentals (reference from the source note, not re-consulted directly for this adaptation).
