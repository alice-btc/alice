---
type: "project_note"
id: "secondary-bitcoin-pedersen-commitment"
title: "Pedersen commitments"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Pedersen Commitment", "Les engagements de Pedersen"]
parent_ids: ["liquid-network", "cryptographic-hash-function"]
related_ids: ["liquid-network", "cryptographic-hash-function"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB sid302 — Liquid Bootcamp Essentials"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Pedersen commitments

## Questions covered

- How can a relationship between hidden amounts be verified?

## Short answer

Pedersen commitments make it possible to hide values while verifying certain algebraic relationships; range proofs complete the scheme.

## Explanation

- Commitments can be combined to verify an accounting equality without directly revealing the amounts.
- Range proofs add constraints on the hidden values; the equality of the commitments alone is not enough.

## Limits and confusions

Security depends on the proofs and their correct implementation, not on the name of the primitive alone.

## Further reading

- [[liquid-network.en|Understanding Liquid]] — back to the basic concept.
- [[cryptographic-hash-function.en|The cryptographic hash]] — back to the basic concept.

## References

- PlanB sid302 — Liquid Bootcamp Essentials
