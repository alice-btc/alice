---
type: "project_note"
id: "secondary-lightning-lightning-public-channel"
title: "Les canaux Lightning annoncés"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Lightning Public Channel"]
parent_ids: ["lightning-channel", "lightning-routing"]
related_ids: ["lightning-channel", "lightning-routing"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB lnp404 — Navigating Your Node with Terminal"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les canaux Lightning annoncés

## Questions couvertes

- Les canaux Lightning annoncés — quel mécanisme et quelles limites ?

## Réponse courte

Un canal Lightning public est annoncé au network graph, permettant à des tiers de router des paiements via ce canal.

## Explication

- Il peut générer des frais de routage.
- Il expose plus d’information topologique qu’un canal privé.
- Il exige uptime, liquidité et fee policy compétitive.
- Il est adapté aux routing nodes.

## Limites et confusions

Une annonce publique ne garantit ni du trafic ni des revenus. Le paiement peut échouer malgré la présence du canal dans le graphe.

## Approfondissements

- [[lightning-channel.fr|Les canaux Lightning]] pour replacer ce mécanisme dans son contexte.
- [[lightning-routing.fr|Le routage d’un paiement]] pour replacer ce mécanisme dans son contexte.

## Références

- PlanB lnp404 — Navigating Your Node with Terminal
