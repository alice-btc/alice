---
type: "project_note"
id: "secondary-lightning-onion-routing"
title: "Le routage en oignon de Lightning"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Onion Routing"]
parent_ids: ["lightning-routing", "lightning-privacy-tradeoff"]
related_ids: ["lightning-routing", "lightning-privacy-tradeoff"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB lnp201 — Lightning Network Theory"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Le routage en oignon de Lightning

## Questions couvertes

- Le routage en oignon de Lightning — quel mécanisme et quelles limites ?

## Réponse courte

L’onion routing de Lightning permet de transmettre un paiement par plusieurs nœuds intermédiaires sans que chacun connaisse l’ensemble du chemin. Chaque nœud ne voit que le saut précédent, le saut suivant et les instructions qui lui sont destinées.

## Explication

- Le routage en oignon protège partiellement la confidentialité du chemin.
- Il ne rend pas Lightning parfaitement anonyme.
- Les nœuds intermédiaires connaissent les montants/frais utiles à leur saut.
- La confidentialité dépend aussi de la topologie, de la liquidité, des probes et du comportement des endpoints.

## Limites et confusions

La visibilité réduite de chaque relais n’empêche pas les inférences par montants, temps, topologie ou collusion. Les extrémités connaissent des informations différentes des relais.

## Approfondissements

- [[lightning-routing.fr|Le routage d’un paiement]] pour replacer ce mécanisme dans son contexte.
- [[lightning-privacy-tradeoff.fr|La confidentialité sur Lightning]] pour replacer ce mécanisme dans son contexte.

## Références

- PlanB lnp201 — Lightning Network Theory
