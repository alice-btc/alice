---
type: "project_note"
id: "secondary-lightning-blinded-paths"
title: "Les chemins aveuglés sur Lightning"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Blinded Paths"]
parent_ids: ["bolt12-offers", "lightning-privacy-tradeoff"]
related_ids: ["bolt12-offers", "lightning-privacy-tradeoff"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro101 — Bitcoin Development Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les chemins aveuglés sur Lightning

## Questions couvertes

- Comment masquer le chemin vers le destinataire d’un paiement Lightning ?

## Réponse courte

Les blinded paths masquent une partie du chemin vers le destinataire afin d’améliorer la confidentialité du receveur sur Lightning.

## Explication

- L’expéditeur ne connaît pas nécessairement le nœud final exact.
- Chaque intermédiaire garde une vue limitée du routage.
- Ils sont utiles pour BOLT12 et paiements plus privés.
- Ils traitent surtout la privacy du destinataire.

## Limites et confusions

Masquer un chemin ne supprime pas tous les indices temporels, de montant ou de réseau.

## Approfondissements

- [[bolt12-offers.fr|Les offres BOLT12]] pour revenir à la notion de base.
- [[lightning-privacy-tradeoff.fr|La confidentialité sur Lightning]] pour revenir à la notion de base.

## Références

- PlanB pro101 — Bitcoin Development Fundamentals
