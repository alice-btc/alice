---
type: "project_note"
id: "secondary-bitcoin-sha-256"
title: "SHA-256 and proof of work"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["SHA-256", "SHA-256 et la preuve de travail"]
parent_ids: ["cryptographic-hash-function", "proof-of-work"]
related_ids: ["cryptographic-hash-function", "proof-of-work"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB min101 — Introduction to Bitcoin mining"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# SHA-256 and proof of work

## Questions covered

- Which computation do Bitcoin miners repeat?

## Short answer

SHA-256 produces a 256-bit hash. For Bitcoin's proof of work, miners look for a double SHA-256 of the block header that meets the target.

## Explanation

- The header changes when the miner modifies certain data in the candidate block, producing a new hash.
- Most attempts do not meet the target; finding a compliant hash is hard, checking one is fast.

## Limits and confusions

The property sought is computational difficulty; it is neither encryption nor proof of identity.

## Further reading

- [[cryptographic-hash-function.en|The cryptographic hash]] — back to the basic concept.
- [[proof-of-work.en|Proof of work]] — back to the basic concept.

## References

- PlanB min101 — Introduction to Bitcoin mining
