---
type: "project_note"
id: "secondary-governance-taproot-activation"
title: "The activation of Taproot in 2021"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["governance"]
aliases: ["Taproot Activation", "L’activation de Taproot en 2021"]
parent_ids: ["taproot", "soft-fork"]
related_ids: ["taproot", "soft-fork"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The activation of Taproot in 2021

## Questions covered

- How was Taproot activated?

## Short answer

Taproot's activation used Speedy Trial, a short miner-signaling mechanism designed either to succeed quickly or to provide data for a following attempt.

## Explanation

- The Taproot rules were technically ready before the activation mechanism was decided.
- The debate pitted forced activation against a "try and fail if needed" approach.
- Speedy Trial emerged as an acceptable compromise.
- Taproot was activated at block 709632 in November 2021.

## Limits and confusions

This historical mechanism is not a mandatory activation rule for every future change.

## Further reading

- [[taproot.en|bc1p addresses and Taproot]] — to go back to the basic notion.
- [[soft-fork.en|Soft forks]] — to go back to the basic notion.

## References

- PlanB btc303 — Bitcoin Development Philosophy
