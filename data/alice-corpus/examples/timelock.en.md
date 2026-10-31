---
type: "project_note"
id: "timelock"
title: "Time conditions"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Timelock", "Les conditions temporelles"]
parent_ids: []
related_ids: ["bitcoin-transaction-input", "lightning-network", "bitcoin-address-scripts"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB pro202 — Programming Bitcoin"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Time conditions

## Questions covered

- Can a spend be prevented before a certain date?

## Short answer

A timelock prevents a transaction or a spend from being accepted before a given time condition. It can be tied to a block height or to a measure of time defined by the protocol.

## Explanation

An absolute condition targets a set threshold. A relative condition imposes a delay relative to an earlier event, depending on the mechanism used. These possibilities serve, among other things, channels and recovery scenarios planned in advance.

The wallet and the transaction have to respect the corresponding parameters. As long as the required conditions are not met, holding a key may not be enough to authorize the spend immediately.

## Limits and confusions

A timelock does not automatically trigger a payment at an exact clock time. Reaching the threshold makes a spend possible subject to the other conditions; a transaction still has to be built, broadcast and confirmed. Block intervals remain variable. A general Bitcoin primitive has to be distinguished from the particular rules of a protocol such as Lightning or Ark.

## Further reading

- [[bitcoin-transaction-input.en|The inputs of a transaction]].
- [[lightning-network.en|Understanding Lightning]].
- [[bitcoin-address-scripts.en|Addresses, scripts and spending conditions]].

## References

- PlanB pro202 — Programming Bitcoin.
