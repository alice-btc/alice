---
type: "project_note"
id: "secondary-bitcoin-privacy-by-omission"
title: "La confidentialité par réduction des données publiées"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Privacy by Omission"]
parent_ids: ["lightning-privacy-tradeoff", "non-blockchain-privacy-leaks"]
related_ids: ["lightning-privacy-tradeoff", "non-blockchain-privacy-leaks"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro101 — Bitcoin Development Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# La confidentialité par réduction des données publiées

## Questions couvertes

- Pourquoi ne pas publier chaque paiement peut-il améliorer la confidentialité ?

## Réponse courte

Une manière de préserver la confidentialité consiste à ne pas publier chaque détail de paiement sur la chaîne. Des paiements intermédiaires Lightning restent hors de ce registre public.

## Explication

- Lightning peut réduire l’information inscrite dans la blockchain pour des paiements intermédiaires.
- Moins de données publiques peut améliorer scalabilité et confidentialité.
- Cette approche dépend souvent de protocoles hors chaîne ou client-side.
- Elle ne supprime pas toutes les métadonnées réseau ou applicatives.

## Limites et confusions

Des participants, prestataires ou observateurs réseau peuvent encore détenir des métadonnées.

## Approfondissements

- [[lightning-privacy-tradeoff.fr|La confidentialité sur Lightning]] pour revenir à la notion de base.
- [[non-blockchain-privacy-leaks.fr|Les fuites hors de la blockchain]] pour revenir à la notion de base.

## Références

- PlanB pro101 — Bitcoin Development Fundamentals
