---
type: "project_note"
id: "lightning-privacy-tradeoff"
title: "Privacy on Lightning"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Lightning Privacy Tradeoff", "La confidentialité sur Lightning"]
parent_ids: []
related_ids: ["lightning-liquidity-path", "lightning-service-provider", "secondary-bitcoin-onion-messaging", "secondary-bitcoin-privacy-by-omission", "secondary-lightning-blinded-paths", "secondary-lightning-lightning-gossip-protocol", "secondary-lightning-lightning-private-channel", "secondary-lightning-onion-routing"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB dev303 — Learning Rust with Bitcoin"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Privacy on Lightning

## Questions covered

- What information can a Lightning payment reveal?

## Short answer

Lightning reduces the publication of each payment on the chain, but does not guarantee anonymity. The information that is visible depends on the routing, the wallet and the services used.

## Explanation

Onion routing limits what each intermediary learns about the route. Other information can nonetheless circulate, notably amounts, timing or liquidity needs. A service provider, a hosted node or an invoice infrastructure can observe elements that would stay local with another architecture.

One needs to analyze who sees what. Holding the keys oneself answers the question of custody; it does not answer every privacy question. Protection against a curious peer can also differ from protection against an operator observing several points along the route.

## Limits and confusions

Do not attribute the same visibility to every provider without examining how it works. The mere word "cloud" does not prove that the provider sees every destination; conversely, "non-custodial" does not prove that it sees nothing.

For a beginner-level answer, explain the actors and the data exposed. Detailed guarantees must be tied to an implementation and its version, not generalized to all of Lightning.

## Further reading

- [[lightning-liquidity-path.en|Lightning liquidity and payment paths]] — liquidity and paths — understanding the route
- [[lightning-service-provider.en|Lightning service providers]] — placing the intermediary services

- [[secondary-bitcoin-onion-messaging.en|Lightning onion messages]].
- [[secondary-bitcoin-privacy-by-omission.en|Privacy by publishing less data]].
- [[secondary-lightning-blinded-paths.en|Blinded paths on Lightning]].
- [[secondary-lightning-lightning-gossip-protocol.en|Broadcasting the public Lightning graph]].
- [[secondary-lightning-lightning-private-channel.en|Unannounced Lightning channels]].
- [[secondary-lightning-onion-routing.en|Lightning's onion routing]].

## References

- PlanB dev303 — Learning Rust with Bitcoin (reference from the source note, not re-consulted directly for this adaptation).
