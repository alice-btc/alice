---
type: "project_note"
id: "secondary-bitcoin-attack-surface"
title: "The attack surface"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Attack Surface", "La surface d’attaque"]
parent_ids: ["hardware-wallet", "threat-model"]
related_ids: ["hardware-wallet", "threat-model"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["Synthèse du vault — Attack Surface ; référence externe non précisée dans la note source."]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The attack surface

## Questions covered

- Why limit exposed interfaces and software?

## Short answer

The attack surface is the set of interfaces and paths an attacker can exploit. Reducing unnecessary services and permissions can limit exposure.

## Explanation

- A general-purpose computer exposes many programs and services; a specialized signing device reduces some of these interfaces.
- Final security nonetheless depends on the hardware, the software and the operations actually confirmed by the user.

## Limits and confusions

A hardware wallet reduces some risks without removing firmware, interfaces, the supply chain and human error.

## Further reading

- [[hardware-wallet.en|The role of a signing device]] — going back to the basic notion.
- [[threat-model.en|Matching protection to risks]] — going back to the basic notion.

## References

- Vault summary — Attack Surface; external reference not specified in the source note.
