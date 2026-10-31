---
type: "project_note"
id: "secondary-addresses-mast"
title: "Trees of spending conditions"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["addresses"]
aliases: ["MAST", "Les arbres de conditions de dépense"]
parent_ids: ["taproot", "merkle-tree"]
related_ids: ["taproot", "merkle-tree"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Trees of spending conditions

## Questions covered

- How can Taproot reveal only the condition that was used?

## Short answer

MAST refers to the idea of organizing script branches in a Merkle tree so that only the branch used is revealed.

## Explanation

- This limits the revelation of unused conditions.
- Taproot takes up this idea with its alternative scripts.
- MAST improves privacy and efficiency for complex scripts.
- The concept links Merkle trees and spending conditions.

## Limits and confusions

Revealing a single branch does not hide all of the transaction's metadata.

## Further reading

- [[taproot.en|bc1p addresses and Taproot]] — going back to the basic notion.
- [[merkle-tree.en|Merkle trees]] — going back to the basic notion.

## References

- PlanB cyp201 — Bitcoin Wallet Architecture
