---
type: "project_note"
id: "bitcoin-censorship-resistance"
title: "Censorship resistance"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["fundamentals"]
aliases: ["Bitcoin Censorship Resistance", "La résistance à la censure"]
parent_ids: []
related_ids: ["bitcoin-decentralization", "bitcoin-permissionlessness", "bitcoin-mempool-policy"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Censorship resistance

## Questions covered

- Can a Bitcoin payment be blocked?

## Short answer

Censorship resistance makes it difficult for a single authority to durably exclude a valid payment. It does not mean that no participant can refuse or delay a transaction.

## Explanation

A miner chooses the content of its blocks and can leave out a payment. If other miners remain willing to include it, that refusal is not enough to block the transaction permanently. Likewise, a user is not forced to depend on a single service to access the network.

The diversity of miners, nodes and access paths limits the points of control. Independent validation also makes it possible to reject a block that would violate the rules, even if it comes from a powerful actor.

## Limits and confusions

A platform can block a withdrawal or refuse an address; this does not prove that the protocol forbids that address. Conversely, a strong concentration of mining or of access points can weaken this resistance. Fees, local rules and connection conditions can delay a transaction without constituting targeted censorship.

## Further reading

- [[bitcoin-decentralization.en|Decentralization]].
- [[bitcoin-permissionlessness.en|A network without prior permission]].
- [[bitcoin-mempool-policy.en|Local rules and consensus]].

## References

- PlanB btc303 — Bitcoin Development Philosophy.
