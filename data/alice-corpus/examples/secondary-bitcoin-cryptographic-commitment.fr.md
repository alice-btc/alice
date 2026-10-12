---
type: "project_note"
id: "secondary-bitcoin-cryptographic-commitment"
title: "Les engagements cryptographiques"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Cryptographic Commitment"]
parent_ids: ["cryptographic-hash-function", "liquid-network"]
related_ids: ["cryptographic-hash-function", "liquid-network"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB sid302 — Liquid Bootcamp Essentials"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les engagements cryptographiques

## Questions couvertes

- Comment s’engager sur une valeur sans la révéler immédiatement ?

## Réponse courte

Un engagement cryptographique permet de fixer une valeur tout en la cachant, puis de démontrer plus tard quelle valeur avait été choisie.

## Explication

- Il combine une propriété de masquage et une propriété d’engagement.
- Les Pedersen commitments sont une forme utilisée dans les transactions confidentielles.
- Cette primitive permet de vérifier des contraintes sans révéler les données brutes.

## Limites et confusions

Les propriétés exactes de masquage et d'engagement dépendent de la construction.

## Approfondissements

- [[cryptographic-hash-function.fr|L’empreinte cryptographique]] pour revenir à la notion de base.
- [[liquid-network.fr|Comprendre Liquid]] pour revenir à la notion de base.

## Références

- PlanB sid302 — Liquid Bootcamp Essentials
