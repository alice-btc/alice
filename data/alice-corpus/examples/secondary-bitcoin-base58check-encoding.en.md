---
type: "project_note"
id: "secondary-bitcoin-base58check-encoding"
title: "Base58Check encoding"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Base58Check Encoding", "L’encodage Base58Check"]
parent_ids: ["legacy-address", "bitcoin-address"]
related_ids: ["legacy-address", "bitcoin-address"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro202 — Programming Bitcoin"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Base58Check encoding

## Questions covered

- What is the checksum of a historical Bitcoin address for?

## Short answer

Base58Check notably encodes historical addresses and extended keys with a prefix and a checksum.

## Explanation

- Version information and a checksum are encoded along with the payload.
- Error detection helps avoid some typing mistakes but does not replace verifying the recipient on the signing device.

## Limits and confusions

The checksum detects some typing errors; it does not guarantee that the address belongs to the right recipient.

## Further reading

- [[legacy-address.en|Comparing Bitcoin address formats]] — going back to the basic notion.
- [[bitcoin-address.en|Understanding a Bitcoin address]] — going back to the basic notion.

## References

- PlanB pro202 — Programming Bitcoin
