---
type: "project_note"
id: "secondary-bitcoin-dlc"
title: "DLC contracts and their oracles"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["DLC", "Les contrats DLC et leurs oracles"]
parent_ids: ["atomic-swap", "bitcoin-script"]
related_ids: ["atomic-swap", "bitcoin-script"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["Synthèse du vault — DLC ; référence externe non précisée dans la note source."]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# DLC contracts and their oracles

## Questions covered

- How can a Bitcoin contract depend on an external event?

## Short answer

A DLC makes it possible to condition the settlement of a contract on a cryptographic attestation from an oracle, without publishing all the contract's terms on the chain.

## Explanation

- The parties define in advance the settlements matching each possible outcome and the expected oracle attestation.
- The oracle can influence the settlement through what it attests; the fact that it does not hold the funds therefore does not make its role risk-free.

## Limits and confusions

The oracle normally does not hold the keys to the funds, but it can lie, disappear or collude; the outcome is not necessarily publicly readable.

## Further reading

- [[atomic-swap.en|Atomic swaps]] — back to the basic concept.
- [[bitcoin-script.en|Spending conditions]] — back to the basic concept.

## References

- Vault synthesis — DLC; external reference not specified in the source note.
