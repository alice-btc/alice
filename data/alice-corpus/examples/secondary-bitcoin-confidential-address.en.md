---
type: "project_note"
id: "secondary-bitcoin-confidential-address"
title: "Liquid confidential addresses"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Confidential Address", "Les adresses confidentielles de Liquid"]
parent_ids: ["liquid-network", "bitcoin-address"]
related_ids: ["liquid-network", "bitcoin-address"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB sid202 — Building with Elements and Liquid Network"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Liquid confidential addresses

## Questions covered

- What is a confidential address on Liquid for?

## Short answer

A Liquid confidential address includes blinding information that lets the sender hide the amounts from the public.

## Explanation

- The sender needs extra cryptographic information to build a blinded amount that the recipient will be able to interpret.
- This receiving information must be distinguished from the keys that authorize spending.

## Limits and confusions

A confidential address does not by itself guarantee the anonymity of the parties.

## Further reading

- [[liquid-network.en|Understanding Liquid]] — back to the basic concept.
- [[bitcoin-address.en|Understanding a Bitcoin address]] — back to the basic concept.

## References

- PlanB sid202 — Building with Elements and Liquid Network
