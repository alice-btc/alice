---
type: "project_note"
id: "secondary-bitcoin-op-return"
title: "OP_RETURN outputs"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["OP_RETURN", "Les sorties OP_RETURN"]
parent_ids: ["bitcoin-mempool-policy", "bitcoin-script"]
related_ids: ["bitcoin-mempool-policy", "bitcoin-script"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB csv402 — RGB programming", "Article ou ressource du vault — Bitcoin Spam - Why We Can't Stop It"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# OP_RETURN outputs

## Questions covered

- Why does some Bitcoin data not create a spendable UTXO?

## Short answer

An OP_RETURN output is unspendable and can carry data or commitments. Relay rules are distinct from consensus rules.

## Explanation

- Explicitly unspendable outputs can be left out of the set of spendable outputs while still being recorded in the block.
- Agreeing to relay a transaction and accepting a block that contains that transaction are decisions governed by different sets of rules.

## Limits and confusions

The space taken up in a block remains a cost even without a lasting addition to the set of spendable UTXOs.

## Further reading

- [[bitcoin-mempool-policy.en|Local rules and consensus]] — back to the basic concept.
- [[bitcoin-script.en|Spending conditions]] — back to the basic concept.

## References

- PlanB csv402 — RGB programming
- Vault article or resource — Bitcoin Spam - Why We Can't Stop It
