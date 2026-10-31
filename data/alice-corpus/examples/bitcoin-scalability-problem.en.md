---
type: "project_note"
id: "bitcoin-scalability-problem"
title: "Capacity limits"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Cryptography and protocol limits"]
aliases: ["Bitcoin Scalability Problem", "Les limites de capacité"]
parent_ids: []
related_ids: ["block-space", "bitcoin-layered-architecture"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB pro101 — Bitcoin Development Fundamentals"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Capacity limits

## Questions covered

- Which trade-offs does increasing Bitcoin's capacity involve?

## Short answer

The capacity of the Bitcoin chain is limited, while a large number of users may want to pay. Increasing that capacity involves trade-offs on the resources needed to verify the network.

## Explanation

Each on-chain transaction must be propagated, stored according to the node's needs and verified. Larger blocks can allow more records, while increasing certain costs. Keeping validation accessible is therefore part of the problem.

Payment layers move part of the exchanges off-chain. Lightning uses channels; other systems use transaction trees, federations or intermediaries. They can improve the payment experience, but add their own constraints on liquidity, availability, backups or trust.

## Limits and confusions

There is no single universal "payments per second" figure that sums up all these uses. A transaction can group several outputs, and an operation on a layer can correspond to a different settlement on Bitcoin.

More capacity is not automatically more autonomy. Conversely, limiting the chain without practical alternatives can push toward centralized custody. The comparison must make explicit both the gains and the dependencies added.

## Further reading

- [[block-space.en|The space available in blocks]] — understand the limited resource
- [[bitcoin-layered-architecture.en|Bitcoin's layers]] — compare the different trade-offs

## References

- PlanB pro101 — Bitcoin Development Fundamentals (reference from the source note, not re-consulted directly for this adaptation).
