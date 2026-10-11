---
type: "project_note"
id: "secondary-bitcoin-joinmarket"
title: "Le fonctionnement de JoinMarket"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["JoinMarket"]
parent_ids: ["coinjoin"]
related_ids: ["coinjoin"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro101 — Bitcoin Development Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Le fonctionnement de JoinMarket

## Questions couvertes

- Comment JoinMarket organise-t-il des transactions CoinJoin ?

## Réponse courte

JoinMarket organise des CoinJoin avec des participants qui proposent de la liquidité et d'autres qui rémunèrent cette participation.

## Explication

- Les makers proposent de participer à des transactions et les takers organisent des CoinJoin en rémunérant cette participation.
- Les fonds sont signés selon le protocole collaboratif ; les dépenses ultérieures peuvent cependant recréer des liens entre participants et sorties.

## Limites et confusions

La confidentialité dépend aussi des transactions suivantes et des données externes ; la compatibilité de test doit être vérifiée.

## Approfondissements

- [[coinjoin.fr|Comprendre CoinJoin]] pour revenir à la notion de base.

## Références

- PlanB pro101 — Bitcoin Development Fundamentals
