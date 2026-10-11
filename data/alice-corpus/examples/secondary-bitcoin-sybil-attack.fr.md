---
type: "project_note"
id: "secondary-bitcoin-sybil-attack"
title: "Les attaques Sybil"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Sybil Attack"]
parent_ids: ["bitcoin-p2p-network", "bitcoin-consensus"]
related_ids: ["bitcoin-p2p-network", "bitcoin-consensus"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les attaques Sybil

## Questions couvertes

- Que peut faire un attaquant qui crée de nombreux faux participants ?

## Réponse courte

Une attaque Sybil multiplie les identités contrôlées par un même adversaire. Elle peut notamment faciliter l'isolement réseau d'une cible.

## Explication

- Bitcoin ne vote pas par nombre de nœuds, ce qui limite certains effets directs.
- Les attaques Sybil peuvent aider à isoler une cible ou renforcer une eclipse attack.
- Une variante sociale peut cibler les débats de gouvernance et de développement.

## Limites et confusions

Bitcoin ne choisit pas sa chaîne par un simple vote où chaque identité réseau compterait pour 1 voix.

## Approfondissements

- [[bitcoin-p2p-network.fr|Le réseau de pairs]] pour revenir à la notion de base.
- [[bitcoin-consensus.fr|Le consensus]] pour revenir à la notion de base.

## Références

- PlanB btc303 — Bitcoin Development Philosophy
