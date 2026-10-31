---
type: "project_note"
id: "utxo-set"
title: "The state of unspent outputs"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["nodes"]
aliases: ["UTXO Set", "L’état des sorties non dépensées"]
parent_ids: []
related_ids: ["bitcoin-utxo", "pruned-node", "initial-block-download"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc202 — Setting up your first Bitcoin node", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The state of unspent outputs

## Questions covered

- Which information makes it possible to verify a new spend?

## Short answer

The UTXO set groups together the still-unspent outputs tracked by the node. It allows the node to verify that a new transaction uses available funds and respects their conditions.

## Explanation

With each block, some outputs are consumed and others are created. The node updates this state according to the transactions accepted. This register of availability is not the same as the full archive of old blocks.

This separation explains how a pruned node can verify new spends after deleting historical data. It also explains why the size of the state and the speed of accessing it influence the resources required.

## Limits and confusions

The UTXO set does not simply contain a list of accounts or owners. Spending conditions matter, and some apparently available outputs may be impossible to use in practice. An output kept for a long time imposes a tracking cost distinct from that of historical data that can be pruned. Judgments about the uses of this space have to be kept separate from this technical description.

## Further reading

- [[bitcoin-utxo.en|Understanding UTXOs]].
- [[pruned-node.en|Pruned nodes]].
- [[initial-block-download.en|The initial synchronization]].

## References

- PlanB btc202 — Setting up your first Bitcoin node.
- PlanB Extraction — 2026-05-23.
