---
type: "project_note"
id: "secondary-bitcoin-pedersen-commitment"
title: "Les engagements de Pedersen"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Pedersen Commitment"]
parent_ids: ["liquid-network", "cryptographic-hash-function"]
related_ids: ["liquid-network", "cryptographic-hash-function"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB sid302 — Liquid Bootcamp Essentials"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les engagements de Pedersen

## Questions couvertes

- Comment vérifier une relation entre des montants cachés ?

## Réponse courte

Les engagements de Pedersen permettent de masquer des valeurs tout en vérifiant certaines relations algébriques ; des preuves d'intervalle complètent le dispositif.

## Explication

- Des engagements peuvent être combinés pour vérifier une égalité comptable sans révéler directement les montants.
- Les preuves d’intervalle ajoutent des contraintes sur les valeurs cachées ; la seule égalité des engagements ne suffit pas.

## Limites et confusions

La sécurité dépend des preuves et de leur implémentation correcte, pas du seul nom de la primitive.

## Approfondissements

- [[liquid-network.fr|Comprendre Liquid]] pour revenir à la notion de base.
- [[cryptographic-hash-function.fr|L’empreinte cryptographique]] pour revenir à la notion de base.

## Références

- PlanB sid302 — Liquid Bootcamp Essentials
