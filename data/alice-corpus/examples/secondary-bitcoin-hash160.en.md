---
type: "project_note"
id: "secondary-bitcoin-hash160"
title: "The HASH160 function"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["HASH160", "La fonction HASH160"]
parent_ids: ["bitcoin-address", "cryptographic-hash-function"]
related_ids: ["bitcoin-address", "cryptographic-hash-function"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# The HASH160 function

## Questions covered

- Why do some Bitcoin formats use a 160-bit hash?

## Short answer

HASH160 applies SHA-256 and then RIPEMD-160, producing a 160-bit hash used notably in P2PKH outputs.

## Explanation

- The composition first applies SHA-256, then RIPEMD-160 to the result.
- Some outputs commit to a public key hash; the address format then encodes that data together with type and network information.

## Limits and confusions

Do not confuse this hash with a public key, nor assume it applies to all address formats.

## Further reading

- [[bitcoin-address.en|Understanding a Bitcoin address]] — back to the basic concept.
- [[cryptographic-hash-function.en|The cryptographic hash]] — back to the basic concept.

## References

- PlanB cyp201 — Bitcoin Wallet Architecture
