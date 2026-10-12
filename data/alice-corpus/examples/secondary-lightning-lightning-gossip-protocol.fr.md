---
type: "project_note"
id: "secondary-lightning-lightning-gossip-protocol"
title: "La diffusion du graphe public Lightning"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Lightning Gossip Protocol"]
parent_ids: ["lightning-routing", "lightning-privacy-tradeoff"]
related_ids: ["lightning-routing", "lightning-privacy-tradeoff"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB lnp202 — Set up Your First Lightning Node"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# La diffusion du graphe public Lightning

## Questions couvertes

- La diffusion du graphe public Lightning — quel mécanisme et quelles limites ?

## Réponse courte

Le gossip protocol Lightning diffuse les informations publiques sur les nœuds et canaux afin de construire une carte du réseau.

## Explication

- Il permet aux nœuds de découvrir des routes de paiement.
- Il ne révèle pas tous les canaux privés ou soldes exacts.
- Il publie notamment existence de canaux et certaines politiques de routage.
- La carte réseau sert au pathfinding mais reste imparfaite.

## Limites et confusions

La carte publique ne donne pas les soldes exacts ni la disponibilité garantie de chaque chemin. Un canal non annoncé peut aussi laisser des indices à certains participants.

## Approfondissements

- [[lightning-routing.fr|Le routage d’un paiement]] pour replacer ce mécanisme dans son contexte.
- [[lightning-privacy-tradeoff.fr|La confidentialité sur Lightning]] pour replacer ce mécanisme dans son contexte.

## Références

- PlanB lnp202 — Set up Your First Lightning Node
