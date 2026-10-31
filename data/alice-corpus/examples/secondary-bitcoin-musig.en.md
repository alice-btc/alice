---
type: "project_note"
id: "secondary-bitcoin-musig"
title: "Joint signatures with MuSig"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["MuSig", "Les signatures communes avec MuSig"]
parent_ids: ["multisig", "taproot"]
related_ids: ["multisig", "taproot"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro101 — Bitcoin Development Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Joint signatures with MuSig

## Questions covered

- How can several people produce a single Schnorr signature?

## Short answer

MuSig refers to protocols that let several key holders produce a joint Schnorr signature.

## Explanation

- Several participants cooperate with their keys to produce a joint signature that verifies like a Schnorr signature.
- Coordination and safe nonce handling are part of the protocol; aggregation is not simply gluing independent signatures together.

## Limits and confusions

Do not automatically equate aggregated multisignature with any m-of-n threshold.

## Further reading

- [[multisig.en|Multisig]] — back to the basic concept.
- [[taproot.en|bc1p addresses and Taproot]] — back to the basic concept.

## References

- PlanB pro101 — Bitcoin Development Fundamentals
