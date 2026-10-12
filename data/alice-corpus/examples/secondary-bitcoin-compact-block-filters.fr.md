---
type: "project_note"
id: "secondary-bitcoin-compact-block-filters"
title: "Les filtres compacts de blocs"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Compact Block Filters"]
parent_ids: ["spv-node", "wallet-node-connection"]
related_ids: ["spv-node", "wallet-node-connection"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro202 — Programming Bitcoin"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les filtres compacts de blocs

## Questions couvertes

- Comment un portefeuille léger cherche-t-il ses transactions sans révéler toutes ses adresses ?

## Réponse courte

Des filtres compacts aident un portefeuille à repérer localement les blocs susceptibles de contenir ses transactions sans communiquer directement toutes ses adresses.

## Explication

- Le portefeuille compare localement ses scripts aux filtres et récupère les blocs susceptibles de le concerner.
- Les faux positifs entraînent des téléchargements supplémentaires ; des pairs et données fiables restent nécessaires.

## Limites et confusions

Les garanties supposent des données conformes ; un pair malveillant ou des requêtes corrélées peuvent encore poser problème.

## Approfondissements

- [[spv-node.fr|La vérification légère]] pour revenir à la notion de base.
- [[wallet-node-connection.fr|Relier un portefeuille à son nœud]] pour revenir à la notion de base.

## Références

- PlanB pro202 — Programming Bitcoin
