---
type: "project_note"
id: "ark-implementations-bark-arkade"
title: "Ark, Bark and Arkade, understanding the differences"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin-layers", "ark", "custody"]
aliases: ["Bark", "Second", "Arkade", "implémentations Ark", "Ark, Bark et Arkade, comprendre les différences"]
parent_ids: ["ark-vtxos", "ark-payments", "ark-security-model", "bitcoin-layered-architecture"]
related_ids: ["spark-trust-and-exits", "fedimint-custody-and-privacy", "alice-explorer"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://offchain.media/article/what-is-ark-bitcoin", "https://second.tech/docs", "https://second.tech/docs/learn/lifetime", "https://docs.arkadeos.com/", "https://docs.arkadeos.com/learn/core-concepts/security-and-trust-model", "https://docs.arkadeos.com/learn/core-concepts/vtxo-lifecycle-and-liveness"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Ark, Bark and Arkade, understanding the differences

## Questions covered

- Do Ark, Bark and Arkade refer to the same software?
- Which uses and which exit conditions should be compared?

## Short answer

Ark refers to a family of protocols using virtual outputs, or VTXOs. Bark is the implementation developed by Second for payments. Arkade also develops payment, contract and asset tools around VTXOs. Their features and guarantees must be studied separately.

## Explanation

Bark offers tools to send and receive via Ark, Lightning and Bitcoin, with a server that coordinates operations. Its user does not have to manage their own Lightning channels to use the functions offered by the service.

Arkade exposes virtual transactions, batched settlement and programmable spending conditions. The documentation distinguishes fast off-chain execution from its anchoring in Bitcoin. The guarantees of an issued asset add, in particular, the conditions set by its issuer.

In both cases, the VTXO's state, the transactions needed for its exit, the fees and the expiration must be examined. An emergency exit must be able to complete in time, with the necessary data. After expiration, recovery may depend on the operator's cooperation; automatic renewal depends on the actual behaviour of the wallet or the delegate.

## Limits and confusions

The names are not interchangeable. The requirements of one implementation must not become a universal rule of Ark.

The Offchain Media presentation is an educational entry point. The Second and Arkade documentations were consulted on 2026-10-11; their security statements describe their model and do not constitute an independent audit of the deployments. No exit test nor verification of an operator's hardware attestation is claimed here.

## Further reading

- [[spark-trust-and-exits.en|Spark, operators and exits to Bitcoin]] to compare dependencies on operators.
- [[fedimint-custody-and-privacy.en|Fedimint, federated custody and privacy]] to distinguish these exits from federated custody.
- [[alice-explorer.en|Understanding Explorer]] to situate the information visible in Alice App.

## References

- [Marius, Offchain Media, Ark, Bark and Arkade, 31 May 2026](https://offchain.media/article/what-is-ark-bitcoin).
- [Second, Bark documentation](https://second.tech/docs).
- [Second, VTXO lifetime](https://second.tech/docs/learn/lifetime).
- [Arkade, features and architecture](https://docs.arkadeos.com/).
- [Arkade, security and exits](https://docs.arkadeos.com/learn/core-concepts/security-and-trust-model).
- [Arkade, expiration and liveness](https://docs.arkadeos.com/learn/core-concepts/vtxo-lifecycle-and-liveness).
