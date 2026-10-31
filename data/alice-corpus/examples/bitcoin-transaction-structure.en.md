---
type: "project_note"
id: "bitcoin-transaction-structure"
title: "Reading a transaction in an explorer"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Bitcoin Transaction Structure", "Lire une transaction dans un explorateur"]
parent_ids: []
related_ids: ["bitcoin-transaction-input", "bitcoin-transaction-output", "bitcoin-chain-analysis", "secondary-bitcoin-utxo-vs-account-based-model"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc204 — Privacy on Bitcoin", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Reading a transaction in an explorer

## Questions covered

- How to recognize the information in a transaction?

## Short answer

An explorer shows the inputs, the outputs and the confirmation state of a transaction. This data describes movements of monetary outputs, not directly the identity or the intent of the people involved.

## Explanation

The inputs reference earlier funds. The outputs define the amounts and the new spending conditions. The difference between the 2 totals is the fee. One output may be the payment and another the change, but their order does not demonstrate it.

The number of confirmations indicates the payment's place in the chain known to the explorer. For an unconfirmed transaction, the tool depends on its own knowledge of the mempool.

## Limits and confusions

Adding up all the outputs does not necessarily give the amount of a purchase. A transaction can group several payments, consolidate funds or involve several participants. An explorer's labels and change interpretations remain information to be evaluated. Looking up an address on an external service can also reveal to that service an interest in that address.

## Further reading

- [[bitcoin-transaction-input.en|The inputs of a transaction]].
- [[bitcoin-transaction-output.en|The outputs of a transaction]].
- [[bitcoin-chain-analysis.en|Chain analysis]].

- [[secondary-bitcoin-utxo-vs-account-based-model.en|UTXOs compared with accounts]].

## References

- PlanB btc204 — Privacy on Bitcoin.
- PlanB Extraction — 2026-05-23.
