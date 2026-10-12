---
type: "project_note"
id: "secondary-bitcoin-mining-shares"
title: "Les parts de travail des pools"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Mining Shares"]
parent_ids: ["mining-pool", "hashrate"]
related_ids: ["mining-pool", "hashrate"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB min101 — Introduction to Bitcoin mining"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les parts de travail des pools

## Questions couvertes

- Que représente une share envoyée à un pool de minage ?

## Réponse courte

Une share est une preuve répondant à une difficulté choisie par le pool pour estimer la contribution du mineur. La plupart ne satisfont pas la difficulté requise pour un bloc Bitcoin.

## Explication

- Un share respecte une difficulté plus faible que la difficulté réseau.
- Le pool utilise les shares pour répartir les paiements.
- Plus un mineur soumet de shares valides, plus sa contribution estimée est élevée.
- Les shares rendent mesurable un travail qui autrement ne produit des blocs que rarement.

## Limites et confusions

Les shares mesurent une contribution statistique ; elles ne constituent pas chacune une récompense de bloc.

## Approfondissements

- [[mining-pool.fr|Les pools de minage]] pour revenir à la notion de base.
- [[hashrate.fr|La puissance de calcul]] pour revenir à la notion de base.

## Références

- PlanB min101 — Introduction to Bitcoin mining
