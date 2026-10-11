---
type: "project_note"
id: "secondary-bitcoin-stratum-mining-protocol"
title: "Le protocole Stratum"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Stratum Mining Protocol"]
parent_ids: ["mining-pool", "asic-mining"]
related_ids: ["mining-pool", "asic-mining"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB min306 — Bitaxe Open Source Mining Mastery"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Le protocole Stratum

## Questions couvertes

- Comment les ASIC échangent-ils leur travail avec un pool ?

## Réponse courte

Stratum relie les mineurs à un serveur de pool pour distribuer du travail et transmettre les shares trouvées.

## Explication

- Le serveur attribue des travaux de minage et le mineur renvoie les résultats satisfaisant la difficulté demandée pour les shares.
- Les choix de construction du bloc et de protection des échanges dépendent des fonctions effectivement utilisées.

## Limites et confusions

Les fonctions et garanties diffèrent entre versions et implémentations ; ne pas supposer que tout mineur choisit ses transactions.

## Approfondissements

- [[mining-pool.fr|Les pools de minage]] pour revenir à la notion de base.
- [[asic-mining.fr|Les machines spécialisées]] pour revenir à la notion de base.

## Références

- PlanB min306 — Bitaxe Open Source Mining Mastery
