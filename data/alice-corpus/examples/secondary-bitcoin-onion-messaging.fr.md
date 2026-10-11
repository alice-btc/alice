---
type: "project_note"
id: "secondary-bitcoin-onion-messaging"
title: "Les messages onion de Lightning"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Onion Messaging"]
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
# Les messages onion de Lightning

## Questions couvertes

- À quoi servent les messages Lightning en dehors des paiements ?

## Réponse courte

Les messages onion permettent des échanges de messages routés dans Lightning, notamment pour demander une facture à partir d'une offre BOLT12.

## Explication

- BOLT12 s’appuie sur onion messaging.
- Il évite certains besoins de serveurs web hors Lightning.
- Il améliore la confidentialité de certaines interactions.
- Il permet plus que de simples paiements : requêtes et réponses chiffrées.

## Limites et confusions

Les messages ne constituent pas eux-mêmes un paiement et ne garantissent pas anonymat ou livraison.

## Approfondissements

- [[bolt12-offers.fr|Les offres BOLT12]] pour revenir à la notion de base.
- [[lightning-privacy-tradeoff.fr|La confidentialité sur Lightning]] pour revenir à la notion de base.

## Références

- PlanB pro101 — Bitcoin Development Fundamentals
