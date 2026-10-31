---
type: "project_note"
id: "secondary-bitcoin-deterministic-ecdsa-nonce"
title: "Deterministic ECDSA nonces"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Deterministic ECDSA Nonce", "Les nonces déterministes d’ECDSA"]
parent_ids: ["digital-signature", "entropy"]
related_ids: ["digital-signature", "entropy"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro202 — Programming Bitcoin"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Deterministic ECDSA nonces

## Questions covered

- Why can a bad signature nonce expose a private key?

## Short answer

ECDSA uses a secret nonce for each signed message. Well-designed deterministic generation reduces the risk posed by a faulty random number generator at signing time.

## Explanation

- ECDSA requires a unique and unpredictable nonce for every signature.
- Reusing or revealing K can expose the private key.
- RFC 6979 is the common modern method for generating K deterministically.
- This practice greatly reduces the dependence on a random number generator at the moment of signing.

## Limits and confusions

Reusing a nonce for different messages can expose the key; use a proven library, not a home-made recipe.

## Further reading

- [[digital-signature.en|Digital signatures]] — back to the basic concept.
- [[entropy.en|The randomness keys need]] — back to the basic concept.

## References

- PlanB pro202 — Programming Bitcoin
