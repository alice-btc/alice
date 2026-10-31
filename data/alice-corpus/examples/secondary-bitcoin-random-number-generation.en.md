---
type: "project_note"
id: "secondary-bitcoin-random-number-generation"
title: "Generating random secrets"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Random Number Generation", "La génération de secrets aléatoires"]
parent_ids: ["entropy", "bitcoin-seed"]
related_ids: ["entropy", "bitcoin-seed"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Generating random secrets

## Questions covered

- Why does the quality of randomness matter as much as the length of a key?

## Short answer

Keys and seed phrases must start from sufficient entropy, produced by a mechanism suited to cryptography.

## Explanation

- The initial entropy determines the effective number of possible secrets, beyond the apparent length of the key.
- A correctly formatted key can therefore still be vulnerable if the generation process is predictable.

## Limits and confusions

A poorly understood manual procedure or a predictable generator can drastically reduce the real space of secrets.

## Further reading

- [[entropy.en|The randomness keys need]] — back to the basic concept.
- [[bitcoin-seed.en|From the phrase to the keys]] — back to the basic concept.

## References

- PlanB cyp201 — Bitcoin Wallet Architecture
