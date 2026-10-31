---
type: "project_note"
id: "document-timestamping"
title: "Document timestamping"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Uses and comparisons"]
aliases: ["Document Timestamping", "L’horodatage de documents"]
parent_ids: []
related_ids: ["cryptographic-hash-function", "merkle-tree"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://opentimestamps.org/"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Document timestamping

## Questions covered

- What can anchoring a hash in Bitcoin prove?

## Short answer

Cryptographic timestamping makes it possible to prove that a hash of some data existed no later than a certain reference point. An anchor in Bitcoin can provide that reference point without publishing the document itself.

## Explanation

The service computes or uses a hash of the document and commits it into a structure tied to the chain. To verify later, one provides the corresponding document and the proof that links its hash to the anchor. OpenTimestamps is an example of a system that produces this kind of proof.

Changing the document normally changes its hash; the proof therefore concerns the corresponding version. Keeping the file and the verification elements is essential. The blockchain provides an ordered history, but it is not a clock of absolute precision.

## Limits and confusions

This proof demonstrates neither the identity of the author, nor the truth of the content, nor its legal ownership. It does not automatically replace the requirements of a contract or a legal procedure.

The document is not automatically recorded on Bitcoin. Hashing data does not make it secret if someone can guess the inputs and compare the hashes. Proof of existence, preservation of the file and confidentiality of its content therefore need to be kept apart.

## Further reading

- [[cryptographic-hash-function.en|The cryptographic hash]] — understanding the hash
- [[merkle-tree.en|Merkle trees]] — seeing compact proofs of inclusion

## References

- [Official documentation](https://opentimestamps.org/).
