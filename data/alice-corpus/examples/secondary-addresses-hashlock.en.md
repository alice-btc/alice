---
type: "project_note"
id: "secondary-addresses-hashlock"
title: "Secret-based spending conditions"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["addresses"]
aliases: ["Hashlock", "Les conditions de dépense par secret"]
parent_ids: ["atomic-swap", "bitcoin-script"]
related_ids: ["atomic-swap", "bitcoin-script"]
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
# Secret-based spending conditions

## Questions covered

- What is a hashlock for?

## Short answer

A hashlock locks a spend to the revelation of a preimage matching a given hash.

## Explanation

- The script knows only the hash, not the secret.
- The spender reveals the preimage to satisfy the condition.
- Hashlocks are useful in several off-chain protocols.
- On their own, they can be vulnerable to front-running if no signature ties the spend to a party.

## Limits and confusions

The secret alone does not protect every contract; signatures and timelocks may be needed.

## Further reading

- [[atomic-swap.en|Atomic swaps]] — going back to the basic notion.
- [[bitcoin-script.en|Spending conditions]] — going back to the basic notion.

## References

- PlanB pro202 — Programming Bitcoin
