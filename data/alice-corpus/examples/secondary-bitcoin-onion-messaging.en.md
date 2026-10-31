---
type: "project_note"
id: "secondary-bitcoin-onion-messaging"
title: "Lightning onion messages"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Onion Messaging", "Les messages onion de Lightning"]
parent_ids: ["bolt12-offers", "lightning-privacy-tradeoff"]
related_ids: ["bolt12-offers", "lightning-privacy-tradeoff"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro101 — Bitcoin Development Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Lightning onion messages

## Questions covered

- What are Lightning messages used for outside of payments?

## Short answer

Onion messages allow routed message exchanges within Lightning, notably to request an invoice from a BOLT12 offer.

## Explanation

- BOLT12 relies on onion messaging.
- It avoids some needs for web servers outside Lightning.
- It improves the privacy of certain interactions.
- It allows more than simple payments: encrypted requests and responses.

## Limits and confusions

The messages are not themselves a payment and guarantee neither anonymity nor delivery.

## Further reading

- [[bolt12-offers.en|BOLT12 offers]] — back to the basic concept.
- [[lightning-privacy-tradeoff.en|Privacy on Lightning]] — back to the basic concept.

## References

- PlanB pro101 — Bitcoin Development Fundamentals
