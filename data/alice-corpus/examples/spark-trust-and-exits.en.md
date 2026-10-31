---
type: "project_note"
id: "spark-trust-and-exits"
title: "Spark, operators and exits to Bitcoin"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin-layers", "custody"]
aliases: ["Spark", "statechains", "Spark operators", "Spark, opérateurs et sorties vers Bitcoin"]
parent_ids: ["bitcoin-layered-architecture", "self-custody"]
related_ids: ["ark-implementations-bark-arkade", "fedimint-custody-and-privacy", "alice-explorer"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://offchain.media/article/what-is-spark-bitcoin/", "https://docs.spark.money/learn/trust-model", "https://docs.spark.money/learn/withdrawals", "https://docs.spark.money/learn/core-concepts"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Spark, operators and exits to Bitcoin

## Questions covered

- What do you hold when you use Spark?
- What are the operators for, and can you exit without them?
- Why is having a key not enough to describe all the guarantees?

## Short answer

Spark organizes off-chain transfers of rights over funds tied to Bitcoin, with a user key and the participation of operators. It simplifies some payments, but its guarantees also depend on the transfer protocol and on the data needed to exit.

## Explanation

The model relies on transaction structures and key updates between successive owners. The user does not publish each transfer on Bitcoin. The operators take part in the signatures and in the change of state.

The documentation describes an honesty assumption at the time of transfer, tied to the deletion of old secrets by at least 1 operator, or by the threshold required by the configuration. Holding a user key does not remove this assumption.

A cooperative exit uses the operator's participation. A unilateral exit uses pre-signed transactions, confirmations and time delays. It requires the right data and incurs Bitcoin fees. The existence of an exit path does not demonstrate that every wallet makes it equally easy to use.

## Limits and confusions

Marius's article on Offchain Media provides context and a critical reading. The mechanisms are cross-checked against the project's documentation, consulted on 2026-10-11. This is neither an independent audit nor a recovery test.

A Spark payment, a Lightning invoice paid from a compatible service and a Bitcoin transaction are different operations. No particular wallet is recommended; its support and its procedures have to be checked separately.

## Further reading

- [[ark-implementations-bark-arkade.en|Ark, Bark and Arkade, understanding the differences]] — to compare operator and exit models.
- [[fedimint-custody-and-privacy.en|Fedimint, federated custody and privacy]] — to distinguish federated custody from transfer with a user key.
- [[alice-explorer.en|Understanding Explorer]] — to understand the limits of observable data.

## References

- [Marius, Offchain Media, presentation and analysis of Spark, 2026-06-02](https://offchain.media/article/what-is-spark-bitcoin/).
- [Spark, concepts](https://docs.spark.money/learn/core-concepts).
- [Spark, trust assumptions](https://docs.spark.money/learn/trust-model).
- [Spark, cooperative and unilateral exits](https://docs.spark.money/learn/withdrawals).
