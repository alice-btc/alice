---
type: "project_note"
id: "secondary-lightning-submarine-swap"
title: "Passer entre Bitcoin et Lightning par un swap"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Submarine Swap"]
parent_ids: ["atomic-swap", "lightning-liquidity"]
related_ids: ["atomic-swap", "lightning-liquidity"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB dev303 — Learning Rust with Bitcoin"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Passer entre Bitcoin et Lightning par un swap

## Questions couvertes

- Passer entre Bitcoin et Lightning par un swap — quel mécanisme et quelles limites ?

## Réponse courte

Un submarine swap échange de la liquidité entre Lightning et on-chain Bitcoin, permettant de passer d’une couche à l’autre sans exposer l’utilisateur à toute la complexité.

## Explication

- Il peut permettre de payer on-chain avec des fonds Lightning ou inversement.
- Les SDK peuvent l’intégrer pour présenter une balance unifiée.
- Les swaps ajoutent des frais, délais et hypothèses de service.
- Ils améliorent l’interopérabilité entre L1 et Lightning.

## Limites et confusions

Un swap n’est pas une modification de capacité de canal par splicing. Les frais, délais, liquidités disponibles et conditions de remboursement dépendent du protocole et du service.

## Approfondissements

- [[atomic-swap.fr|Les échanges atomiques]] pour replacer ce mécanisme dans son contexte.
- [[lightning-liquidity.fr|La liquidité d’un canal]] pour replacer ce mécanisme dans son contexte.

## Références

- PlanB dev303 — Learning Rust with Bitcoin
