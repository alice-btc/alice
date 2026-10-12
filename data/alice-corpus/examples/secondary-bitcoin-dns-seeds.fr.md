---
type: "project_note"
id: "secondary-bitcoin-dns-seeds"
title: "La découverte de pairs par DNS"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["DNS Seeds"]
parent_ids: ["bitcoin-p2p-network", "bitcoin-decentralization"]
related_ids: ["bitcoin-p2p-network", "bitcoin-decentralization"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro202 — Programming Bitcoin"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# La découverte de pairs par DNS

## Questions couvertes

- Comment un nouveau nœud trouve-t-il ses premiers pairs ?

## Réponse courte

Les DNS seeds aident un nouveau nœud à découvrir des pairs. Les adresses reçues ne décident pas des règles de validité des blocs.

## Explication

- Ils aident un nœud sans carnet d’adresses à rejoindre le réseau.
- Ils sont maintenus par des contributeurs ou développeurs reconnus.
- Après bootstrap, le nœud apprend d’autres pairs via le réseau lui-même.
- Ils ne sont pas consensus-critical et ne contrôlent pas la validité des blocs.

## Limites et confusions

Une mauvaise découverte de pairs peut néanmoins affecter disponibilité ou isolation du nœud.

## Approfondissements

- [[bitcoin-p2p-network.fr|Le réseau de pairs]] pour revenir à la notion de base.
- [[bitcoin-decentralization.fr|La décentralisation]] pour revenir à la notion de base.

## Références

- PlanB pro202 — Programming Bitcoin
