---
type: "project_note"
id: "secondary-bitcoin-wallet-as-identity"
title: "The wallet as a means of authentication"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Wallet as Identity", "Le portefeuille comme moyen d’authentification"]
parent_ids: ["lnurl", "digital-signature"]
related_ids: ["lnurl", "digital-signature"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB biz101 — Bitcoin for Business"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# The wallet as a means of authentication

## Questions covered

- Does proving control of a key prove your identity?

## Short answer

A wallet can be used to authenticate with a service by proving control of a key.

## Explanation

- An authentication request verifies a signature or a response tied to a key known to the service.
- This identifies a means of cryptographic control; on its own it proves neither the real person nor their right to an account.

## Limits and confusions

Nostr Wallet Connect is first of all a delegation of payment functions, not a universal proof of identity; a stable key can make tracking easier.

## Further reading

- [[lnurl.en|LNURL links]] — back to the basic concept.
- [[digital-signature.en|Digital signatures]] — back to the basic concept.

## References

- PlanB biz101 — Bitcoin for Business
