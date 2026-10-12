---
type: "project_note"
id: "secondary-lightning-bolts"
title: "Les spécifications BOLT de Lightning"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["BOLTs"]
parent_ids: ["lightning-network", "bitcoin-improvement-proposal"]
related_ids: ["lightning-network", "bitcoin-improvement-proposal"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB lnp202 — Set up Your First Lightning Node"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les spécifications BOLT de Lightning

## Questions couvertes

- Les spécifications BOLT de Lightning — quel mécanisme et quelles limites ?

## Réponse courte

Les BOLTs sont les spécifications techniques qui définissent le comportement interopérable des implémentations Lightning.

## Explication

- BOLT signifie Basis of Lightning Technology.
- Ils décrivent messages, canaux, onion routing, invoices et règles de protocole.
- L’interopérabilité Lightning dépend du respect de ces spécifications.
- Les BOLTs permettent à LND, Core Lightning et Eclair de parler ensemble.

## Limites et confusions

Une spécification peut prévoir des fonctions optionnelles ou évoluer avant leur prise en charge par tous les logiciels. Publication d’un texte et déploiement généralisé sont distincts.

## Approfondissements

- [[lightning-network.fr|Comprendre Lightning]] pour replacer ce mécanisme dans son contexte.
- [[bitcoin-improvement-proposal.fr|Les propositions BIP]] pour replacer ce mécanisme dans son contexte.

## Références

- PlanB lnp202 — Set up Your First Lightning Node
