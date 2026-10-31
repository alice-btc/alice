---
type: "project_note"
id: "bitcoin-transaction-input"
title: "The inputs of a transaction"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Bitcoin Transaction Input", "Les entrées d’une transaction"]
parent_ids: []
related_ids: ["bitcoin-utxo", "bitcoin-transaction-output", "coin-selection-tradeoffs", "secondary-bitcoin-coinbase-transaction"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB pro202 — Programming Bitcoin"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The inputs of a transaction

## Questions covered

- Where do the spent bitcoins come from?

## Short answer

An input designates an earlier transaction output that one wants to spend. Bitcoin thus spends specific pieces of value rather than directly debiting a global account.

## Explanation

Each input identifies the previous transaction and the position of the output concerned. The transaction also provides the data needed to satisfy the spending conditions, often signatures. Several inputs can be combined to reach the desired amount.

If an input is worth 20,000 sats, it is consumed in full. The payment, any change and the fees then explain how that value is distributed. The wallet generally performs this construction without asking the user to select each input.

## Limits and confusions

Adding inputs usually increases the weight and, at the same fee rate, the fees. It can also reveal links between funds. The coinbase transaction that rewards the miner is an exception to the model of spending earlier outputs. The technical detail of the signature data depends on the type of output being spent.

## Further reading

- [[bitcoin-utxo.en|Understanding UTXOs]].
- [[bitcoin-transaction-output.en|The outputs of a transaction]].
- [[coin-selection-tradeoffs.en|UTXO selection and trade-offs]].

- [[secondary-bitcoin-coinbase-transaction.en|The coinbase transaction]].

## References

- PlanB pro202 — Programming Bitcoin.
