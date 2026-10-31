---
type: "project_note"
id: "secondary-bitcoin-defense-in-depth"
title: "Combining several protections"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Defense in Depth", "Combiner plusieurs protections"]
parent_ids: ["threat-model", "multisig"]
related_ids: ["threat-model", "multisig"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro101 — Bitcoin Development Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Combining several protections

## Questions covered

- How can protections be added without making recovery too complex?

## Short answer

Defense in depth combines protections that cover different risks, so that a single failure does not compromise everything.

## Explanation

- Examples: hardware wallet, multisig, 2FA, separation of roles, backups and software validation.
- Each layer should cover different scenarios.
- Too many poorly understood layers can also create a risk of error.
- The whole must stay testable and recoverable.

## Limits and confusions

Piling up poorly understood layers can increase the risk of loss; procedures must remain testable.

## Further reading

- [[threat-model.en|Matching protection to risks]] — back to the basic concept.
- [[multisig.en|Multisig]] — back to the basic concept.

## References

- PlanB pro101 — Bitcoin Development Fundamentals
