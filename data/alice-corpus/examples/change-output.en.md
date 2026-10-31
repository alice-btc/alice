---
type: "project_note"
id: "change-output"
title: "Change"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Change Output", "La monnaie rendue"]
parent_ids: []
related_ids: ["bitcoin-utxo", "change-privacy-linking", "coin-selection-tradeoffs"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB pro202 — Programming Bitcoin"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Change

## Questions covered

- Why does part of the payment go back to another address?

## Short answer

Change is an output that returns to the payer the value not used for the payment and the fees. It appears because a UTXO is spent in full.

## Explanation

Fictional example with 1 input of 10,000 sats. A payment of 6,000 sats and 500 sats of fees leave 3,500 sats of change. The wallet normally creates an output controlled by its own keys for this remainder. The address can be new without the funds having left the wallet.

This explains why a simple transaction can show several outputs and a total transferred amount higher than the commercial payment. The wallet tracks its own outputs to compute the remaining balance.

## Limits and confusions

Not all transactions have change. Its amount must also account for the fees. Removing it without correctly modifying the transaction can increase the fees. Using a new address improves certain practices, but observers can still try to identify the change through heuristics.

## Further reading

- [[bitcoin-utxo.en|Understanding UTXOs]].
- [[change-privacy-linking.en|Change and privacy links]].
- [[coin-selection-tradeoffs.en|UTXO selection and trade-offs]].

## References

- PlanB pro202 — Programming Bitcoin.
