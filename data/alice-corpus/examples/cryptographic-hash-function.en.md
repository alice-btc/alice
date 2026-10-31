---
type: "project_note"
id: "cryptographic-hash-function"
title: "The cryptographic hash"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Cryptography and protocol limits"]
aliases: ["Cryptographic Hash Function", "L’empreinte cryptographique"]
parent_ids: []
related_ids: ["merkle-tree", "document-timestamping", "secondary-bitcoin-collision-resistance", "secondary-bitcoin-cryptographic-commitment", "secondary-bitcoin-hash160", "secondary-bitcoin-message-integrity", "secondary-bitcoin-pedersen-commitment", "secondary-bitcoin-preimage-resistance", "secondary-bitcoin-sha-256"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://csrc.nist.gov/glossary/term/cryptographic_hash_function"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The cryptographic hash

## Questions covered

- What is a hash used for in Bitcoin?

## Short answer

A cryptographic hash function turns data into a fixed-size digest. It makes it possible to identify the data and check its consistency without copying all of its content.

## Explanation

The same input gives the same digest. Modifying the data normally changes the result. Bitcoin uses these digests in particular for transactions, blocks and Merkle trees.

Security requires several properties. It must be hard to recover an input from a digest, to find a second input matching known data, or to find 2 distinct inputs with the same digest. These problems are related, but not identical.

## Limits and confusions

Collisions exist mathematically when the possible inputs outnumber the digests. The property sought is the practical difficulty of finding them, not their absolute impossibility. An output that looks random is not enough to demonstrate this security.

Hashing is not encryption and uses no key to recover the content. If the inputs are predictable, someone can nevertheless try them and compare the digests. Hashing a short or known piece of information therefore does not guarantee its confidentiality.

## Further reading

- [[merkle-tree.en|Merkle trees]] — see how digests are combined
- [[document-timestamping.en|Document timestamping]] — understand a proof of existence

- [[secondary-bitcoin-collision-resistance.en|Collision resistance]].
- [[secondary-bitcoin-cryptographic-commitment.en|Cryptographic commitments]].
- [[secondary-bitcoin-hash160.en|The HASH160 function]].
- [[secondary-bitcoin-message-integrity.en|Message integrity]].
- [[secondary-bitcoin-pedersen-commitment.en|Pedersen commitments]].
- [[secondary-bitcoin-preimage-resistance.en|Preimage resistance]].
- [[secondary-bitcoin-sha-256.en|SHA-256 and proof of work]].

## References

- [NIST — properties of a cryptographic hash function](https://csrc.nist.gov/glossary/term/cryptographic_hash_function).
