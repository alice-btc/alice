---
type: "project_note"
id: "bitcoin-transaction-confirmation"
title: "Confirmations"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Bitcoin Transaction Confirmation", "Les confirmations"]
parent_ids: []
related_ids: ["bitcoin-finality", "bitcoin-mempool", "proof-of-work", "secondary-bitcoin-coinbase-maturity", "secondary-bitcoin-stale-block"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB min101 — Introduction to Bitcoin mining"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Confirmations

## Questions covered

- What does 1 confirmation mean?

## Short answer

1 confirmation means that a transaction appears in a block of the chain that is followed. Each block added after that one gives it an additional confirmation.

## Explanation

Before its inclusion, a transaction can be known to nodes while remaining unconfirmed. Once included, it becomes part of the verified history. The following blocks add work on top of it and make replacing that history harder.

Interfaces often display this number to help distinguish a pending payment from one that is more solidly recorded. The delay between 2 confirmations varies, because block discovery is irregular. An average is not a deadline.

## Limits and confusions

The number of confirmations to wait for depends on the context and the accepted risk. There is no universal rule guaranteeing every payment after a magic number of blocks. A confirmed transaction can lose confirmations during a reorganization. The more it accumulates, the lower this risk becomes under the network's normal operating conditions.

## Further reading

- [[bitcoin-finality.en|Progressive finality]].
- [[bitcoin-mempool.en|The transaction queue]].
- [[proof-of-work.en|Proof of work]].

- [[secondary-bitcoin-coinbase-maturity.en|Block reward maturity]].
- [[secondary-bitcoin-stale-block.en|Valid blocks that are not kept]].

## References

- PlanB min101 — Introduction to Bitcoin mining.
