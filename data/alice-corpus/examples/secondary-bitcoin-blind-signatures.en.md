---
type: "project_note"
id: "secondary-bitcoin-blind-signatures"
title: "Blind signatures"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Blind Signatures", "Les signatures aveugles"]
parent_ids: ["cashu-et-confiance-dans-le-mint", "coinjoin"]
related_ids: ["cashu-et-confiance-dans-le-mint", "coinjoin"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB his201 — The History of Bitcoin's Creation"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Blind signatures

## Questions covered

- How can an issuer sign a token without seeing its content?

## Short answer

A blind signature makes it possible to sign a message without seeing its content. It helps an ecash mint validate tokens without directly linking their issuance to their spending.

## Explanation

- They separate authorization from direct traceability.
- They are central to the Chaumian eCash model.
- They also inspire privacy constructions such as some Chaumian coinjoins.
- They are not enough on their own to create a decentralized currency with no issuer.

## Limits and confusions

A blind signature removes neither custody nor the system's other metadata.

## Further reading

- [[cashu-et-confiance-dans-le-mint.en|Ecash and trust in a mint]] — back to the basic concept.
- [[coinjoin.en|Understanding CoinJoin]] — back to the basic concept.

## References

- PlanB his201 — The History of Bitcoin's Creation
