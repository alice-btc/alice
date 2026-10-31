---
type: "project_note"
id: "bitcoin-transaction-output"
title: "The outputs of a transaction"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Bitcoin Transaction Output", "Les sorties d’une transaction"]
parent_ids: []
related_ids: ["change-output", "bitcoin-address", "transaction-batching"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB pro202 — Programming Bitcoin"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The outputs of a transaction

## Questions covered

- Why does a transaction have several outputs?

## Short answer

An output assigns an amount to spending conditions. A transaction can create several, in particular to pay a recipient and return change to the payer.

## Explanation

An output contains an amount in satoshis and a script indicating how that amount can be spent. The address used in a wallet generally represents those conditions in a form that is practical to copy or scan. The spendable outputs that are still available make up the UTXOs.

A transaction grouping several payments can create several recipient outputs. Conversely, not all the outputs visible in an explorer correspond to distinct purchases. Some may go back to the same wallet.

## Limits and confusions

Fees are not an additional output of the payment. They result from the difference between the total of the inputs and that of the outputs, and are then assigned to the miner in the block's coinbase transaction. The order of the outputs is not enough to know which one is the change. An observer can form hypotheses without having proof.

## Further reading

- [[change-output.en|Change]].
- [[bitcoin-address.en|Understanding a Bitcoin address]].
- [[transaction-batching.en|Grouping several payments]].

## References

- PlanB pro202 — Programming Bitcoin.
