---
type: "project_note"
id: "secondary-bitcoin-collision-resistance"
title: "Collision resistance"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Collision Resistance", "La résistance aux collisions"]
parent_ids: ["cryptographic-hash-function", "merkle-tree"]
related_ids: ["cryptographic-hash-function", "merkle-tree"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp302 — Modern Cryptography Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Collision resistance

## Questions covered

- Can 2 different pieces of data have the same hash?

## Short answer

Collision resistance means it is impractical to find 2 distinct inputs that produce the same hash.

## Explanation

- A collision threatens the integrity of commitments.
- The expected difficulty is tied to the birthday bound.
- It is crucial for structures such as Merkle trees and signatures over hashes.
- It is different from preimage resistance.

## Limits and confusions

A hash of finite size necessarily has collisions; the property is about how hard they are to find.

## Further reading

- [[cryptographic-hash-function.en|The cryptographic hash]] — back to the basic concept.
- [[merkle-tree.en|Merkle trees]] — back to the basic concept.

## References

- PlanB cyp302 — Modern Cryptography Fundamentals
