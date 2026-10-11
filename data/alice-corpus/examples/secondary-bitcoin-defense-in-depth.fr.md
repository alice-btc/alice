---
type: "project_note"
id: "secondary-bitcoin-defense-in-depth"
title: "Combiner plusieurs protections"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Defense in Depth"]
parent_ids: ["threat-model", "multisig"]
related_ids: ["threat-model", "multisig"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro101 — Bitcoin Development Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Combiner plusieurs protections

## Questions couvertes

- Comment ajouter des protections sans rendre sa récupération trop complexe ?

## Réponse courte

La défense en profondeur combine des protections couvrant des risques différents afin qu'une seule défaillance ne compromette pas tout.

## Explication

- Exemples : hardware wallet, multisig, 2FA, séparation des rôles, backups et validation logicielle.
- Chaque couche doit couvrir des scénarios différents.
- Trop de couches mal comprises peut aussi créer des risques d’erreur.
- Elle doit rester testable et récupérable.

## Limites et confusions

Accumuler des couches mal comprises peut augmenter le risque de perte ; les procédures doivent rester testables.

## Approfondissements

- [[threat-model.fr|Adapter la protection aux risques]] pour revenir à la notion de base.
- [[multisig.fr|La signature multiple]] pour revenir à la notion de base.

## Références

- PlanB pro101 — Bitcoin Development Fundamentals
