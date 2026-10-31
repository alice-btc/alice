---
type: "project_note"
id: "block-weight"
title: "Virtual size and weight"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Block Weight", "La taille virtuelle et le poids"]
parent_ids: []
related_ids: ["transaction-fees", "segwit-address", "transaction-batching"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB pro202 — Programming Bitcoin"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Virtual size and weight

## Questions covered

- Why do fees depend on the size of the transaction?

## Short answer

Virtual size measures the economic space occupied by a transaction according to Bitcoin's weight system. It makes it possible to compare fee rates between transactions with different structures.

## Explanation

SegWit distinguishes certain signature data, called witness data, from the other data. They do not contribute to the weight in the same way. A block is limited to 4,000,000 weight units.

For a user, the issue is practical. Adding inputs, outputs or certain spending conditions changes the transaction's size. At the same fee rate, a larger transaction costs more. The monetary amount sent is therefore not a good indicator of that size.

## Limits and confusions

A Bitcoin block does not boil down to a fixed number of payments. A transaction can group several recipients, and not all transactions have the same weight. Address formats influence the cost of certain spends, without guaranteeing on their own the cheapest payment in every situation.

## Further reading

- [[transaction-fees.en|Transaction fees]].
- [[segwit-address.en|bc1q addresses]].
- [[transaction-batching.en|Grouping several payments]].

## References

- PlanB pro202 — Programming Bitcoin.
