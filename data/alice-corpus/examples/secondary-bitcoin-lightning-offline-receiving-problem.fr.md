---
type: "project_note"
id: "secondary-bitcoin-lightning-offline-receiving-problem"
title: "Recevoir sur Lightning en étant hors ligne"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Lightning Offline Receiving Problem"]
parent_ids: ["lightning-node-online-status", "lightning-service-provider"]
related_ids: ["lightning-node-online-status", "lightning-service-provider"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro101 — Bitcoin Development Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Recevoir sur Lightning en étant hors ligne

## Questions couvertes

- Pourquoi recevoir sur Lightning demande-t-il une infrastructure disponible ?

## Réponse courte

Recevoir un paiement Lightning nécessite généralement qu'une infrastructure participant au règlement soit disponible. Un wallet peut déléguer ou différer une partie du travail selon sa conception.

## Explication

- Contrairement à une adresse on-chain, une invoice Lightning implique interactivité.
- Les wallets peuvent s’appuyer sur LSPs ou custodians pour masquer ce problème.
- Les solutions doivent préserver sécurité et non-custody autant que possible.
- C’est un obstacle majeur à l’UX grand public.

## Limites et confusions

Une interface qui fonctionne hors ligne ne prouve pas absence de tiers ni autonomie complète de règlement.

## Approfondissements

- [[lightning-node-online-status.fr|La disponibilité du nœud]] pour revenir à la notion de base.
- [[lightning-service-provider.fr|Les fournisseurs de services Lightning]] pour revenir à la notion de base.

## Références

- PlanB pro101 — Bitcoin Development Fundamentals
