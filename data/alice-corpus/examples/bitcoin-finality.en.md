---
type: "project_note"
id: "bitcoin-finality"
title: "Progressive finality"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Bitcoin Finality", "La finalité progressive"]
parent_ids: []
related_ids: ["bitcoin-transaction-confirmation", "double-spending", "bitcoin-base-layer", "secondary-bitcoin-fee-sniping"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB sur Liquid et Bitcoin", "PlanB sid302 — Liquid Bootcamp Essentials"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Progressive finality

## Questions covered

- Is a confirmed transaction irreversible?

## Short answer

Bitcoin's finality is progressive. The more confirmations a transaction accumulates, the lower the risk that a reorganization will reverse it.

## Explanation

Nodes can temporarily receive competing blocks. They apply the validity rules and the chain selection based on accumulated work. A block previously accepted can then be replaced in their history.

Reverting an old transaction also requires replacing the blocks that follow it. This accumulation of work explains why confirmations strengthen confidence in settlement. This mechanism must be distinguished from a cancel button available to the payer or to a customer service.

## Limits and confusions

A low probability is not a mathematical impossibility. Security depends in particular on an attacker's resources and on the state of the network. A mistake in the recipient does not give the payer a technical right to take the funds back. Any refund is a new transaction consented to by whoever controls them.

## Further reading

- [[bitcoin-transaction-confirmation.en|Confirmations]].
- [[double-spending.en|The double-spending problem]].
- [[bitcoin-base-layer.en|Bitcoin's base layer]].

- [[secondary-bitcoin-fee-sniping.en|Trying to capture the fees of a recent block]].

## References

- PlanB on Liquid and Bitcoin.
- PlanB sid302 — Liquid Bootcamp Essentials.
