---
type: "project_note"
id: "secondary-bitcoin-eclipse-attack"
title: "L’isolement d’un nœud par attaque eclipse"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Eclipse Attack"]
parent_ids: ["bitcoin-p2p-network", "bitcoin-node"]
related_ids: ["bitcoin-p2p-network", "bitcoin-node"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# L’isolement d’un nœud par attaque eclipse

## Questions couvertes

- Un attaquant peut-il cacher le réseau à un nœud Bitcoin ?

## Réponse courte

Une attaque eclipse cherche à contrôler les connexions d'un nœud pour l'isoler des pairs honnêtes et lui cacher ou retarder des informations.

## Explication

- Elle peut aider à retarder ou cacher des transactions et blocs.
- Elle s’appuie souvent sur une forme de contrôle Sybil des connexions.
- Bitcoin Core utilise plusieurs heuristiques pour réduire ce risque.

## Limites et confusions

Elle ne rend pas valides des blocs invalides au regard des règles que le nœud vérifie.

## Approfondissements

- [[bitcoin-p2p-network.fr|Le réseau de pairs]] pour revenir à la notion de base.
- [[bitcoin-node.fr|Le rôle d’un nœud Bitcoin]] pour revenir à la notion de base.

## Références

- PlanB btc303 — Bitcoin Development Philosophy
