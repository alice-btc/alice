---
type: "project_note"
id: "bitcoin-layered-architecture"
title: "Bitcoin's layers"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Ark and other layers"]
aliases: ["Bitcoin Layered Architecture", "Les couches de Bitcoin"]
parent_ids: []
related_ids: ["ark-implementations-bark-arkade", "spark-trust-and-exits", "fedimint-custody-and-privacy", "secondary-economics-layered-money"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc102 — Getting your first bitcoins"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Bitcoin's layers

## Questions covered

- Why build systems on top of Bitcoin?

## Short answer

Bitcoin can serve as a base for several payment and usage systems. These layers bring different functions, with their own conditions for security, custody and exit.

## Explanation

The Bitcoin chain publishes and verifies transactions according to the network's common rules. Lightning organizes payments through channels. Ark groups exit rights and off-chain payments with an operator. A sidechain such as Liquid has its own chain and a conversion mechanism. An ecash system uses tokens issued by a mint.

A good comparison starts with concrete questions. Who controls the keys? Who holds the BTC? Can you exit without cooperation, within what delays and at what cost? What information becomes public or visible to an operator?

## Limits and confusions

The word "layer" does not guarantee full inheritance of Bitcoin's security. A claim managed by a third party is not equivalent to a UTXO whose spending conditions you control.

A similar interface can hide different architectures. The guarantees of the solution actually used must be explained, without inferring its model from the mere fact that it accepts payments in sats.

## Further reading

- [[ark-implementations-bark-arkade.en|Ark, Bark and Arkade, understanding the differences]] — Bark and Arkade — distinguish the implementations
- [[spark-trust-and-exits.en|Spark, operators and exits to Bitcoin]] — Spark — clarify trust and exit
- [[fedimint-custody-and-privacy.en|Fedimint, federated custody and privacy]] — Fedimint — distinguish federation from custody

- [[secondary-economics-layered-money.en|Layers of monetary claims]].

## References

- PlanB btc102 — Getting your first bitcoins (reference from the source note, not re-consulted directly for this adaptation).
