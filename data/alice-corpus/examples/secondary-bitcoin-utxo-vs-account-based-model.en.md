---
type: "project_note"
id: "secondary-bitcoin-utxo-vs-account-based-model"
title: "UTXOs compared with accounts"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["UTXO vs Account-Based Model", "Les UTXO comparés aux comptes"]
parent_ids: ["bitcoin-utxo", "bitcoin-transaction-structure"]
related_ids: ["bitcoin-utxo", "bitcoin-transaction-structure"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB sid406 — Mastering Liquid Development"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# UTXOs compared with accounts

## Questions covered

- What is the difference between outputs to be spent and an account balance?

## Short answer

The UTXO model consumes outputs and creates new ones, whereas an account-based model modifies balances or states attached to accounts.

## Explanation

- The UTXO model favors explicit transaction construction: inputs, outputs, spending conditions.
- The account-based model makes certain application patterns easier, but concentrates state in accounts and contracts.
- Liquid inherits the UTXO model and adds assets and confidentiality to it.
- The developer has to handle UTXO selection, blinding, fees, refunds and partial signatures.

## Limits and confusions

The trade-offs depend on the application; neither model eliminates all errors or privacy leaks.

## Further reading

- [[bitcoin-utxo.en|Understanding UTXOs]] — back to the basic concept.
- [[bitcoin-transaction-structure.en|Reading a transaction in an explorer]] — back to the basic concept.

## References

- PlanB sid406 — Mastering Liquid Development
