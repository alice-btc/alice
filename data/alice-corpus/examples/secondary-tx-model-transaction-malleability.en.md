---
type: "project_note"
id: "secondary-tx-model-transaction-malleability"
title: "Transaction malleability"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["tx-model"]
aliases: ["Transaction Malleability", "La malléabilité des transactions"]
parent_ids: ["segwit-address", "lightning-network"]
related_ids: ["segwit-address", "lightning-network"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro202 — Programming Bitcoin"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Transaction malleability

## Questions covered

- Can a transaction's identifier change without changing its payment?

## Short answer

Transaction malleability is the possibility of modifying a transaction without changing its economic effect but while changing its identifier.

## Explanation

- With legacy ECDSA, some signature variants could remain valid.
- Changing the txid breaks protocols that reference unconfirmed transactions.
- The low-S rule and SegWit reduce or eliminate these major vectors.
- The fix opened the way to Lightning.

## Limits and confusions

The guarantees depend on the transaction format and on the inputs; the removal of all malleability is not to be promised.

## Further reading

- [[segwit-address.en|bc1q addresses]] — to go back to the basic notion.
- [[lightning-network.en|Understanding Lightning]] — to go back to the basic notion.

## References

- PlanB pro202 — Programming Bitcoin
