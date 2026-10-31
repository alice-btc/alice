---
type: "project_note"
id: "secondary-bitcoin-adaptor-signature"
title: "Adaptor signatures"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Adaptor Signature", "Les signatures adaptatrices"]
parent_ids: ["atomic-swap", "digital-signature"]
related_ids: ["atomic-swap", "digital-signature"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["Synthèse du vault — Adaptor Signature ; référence externe non précisée dans la note source."]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Adaptor signatures

## Questions covered

- How can a signature be tied to the revelation of a secret?

## Short answer

An adaptor signature ties the completion of a signature to a secret, notably used in some atomic swap constructions.

## Explanation

- One party prepares signature data tied to a secret; the completed signature and the prepared data can make it possible to extract that secret.
- This link can coordinate settlements between participants, but removes neither the delays nor the risks of the complete protocol.

## Limits and confusions

Extracting the secret requires the data suited to the construction, not just any public signature.

## Further reading

- [[atomic-swap.en|Atomic swaps]] — going back to the basic notion.
- [[digital-signature.en|Digital signatures]] — going back to the basic notion.

## References

- Vault summary — Adaptor Signature; external reference not specified in the source note.
