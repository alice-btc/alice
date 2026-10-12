---
type: "project_note"
id: "secondary-bitcoin-random-number-generation"
title: "La génération de secrets aléatoires"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Random Number Generation"]
parent_ids: ["entropy", "bitcoin-seed"]
related_ids: ["entropy", "bitcoin-seed"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# La génération de secrets aléatoires

## Questions couvertes

- Pourquoi la qualité du hasard compte-t-elle autant que la longueur d’une clé ?

## Réponse courte

Les clés et phrases de récupération doivent partir d'une entropie suffisante, produite par un mécanisme adapté à la cryptographie.

## Explication

- L’entropie initiale conditionne le nombre effectif de secrets possibles, au-delà de la longueur apparente de la clé.
- Un format correct peut ainsi contenir une clé vulnérable si le processus de génération est prévisible.

## Limites et confusions

Une procédure manuelle mal comprise ou un générateur prévisible peut réduire fortement l'espace réel de secrets.

## Approfondissements

- [[entropy.fr|L’aléa nécessaire aux clés]] pour revenir à la notion de base.
- [[bitcoin-seed.fr|De la phrase aux clés]] pour revenir à la notion de base.

## Références

- PlanB cyp201 — Bitcoin Wallet Architecture
