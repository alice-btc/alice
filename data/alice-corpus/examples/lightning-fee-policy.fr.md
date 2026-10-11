---
type: "project_note"
id: "lightning-fee-policy"
title: "Les frais Lightning"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Lightning Fee Policy"]
parent_ids: []
related_ids: ["lightning-routing", "lightning-service-provider"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB lnp404 — Navigating Your Node with Terminal"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les frais Lightning

## Questions couvertes

- Pourquoi un paiement Lightning peut-il avoir des frais ?

## Réponse courte

Les frais Lightning rémunèrent notamment les intermédiaires qui acheminent un paiement. Une politique de routage combine souvent une part fixe et une part proportionnelle au montant transmis.

## Explication

La part proportionnelle est couramment exprimée en parties par million, ou ppm. Le portefeuille évalue les frais des chemins possibles et présente un coût ou une limite avant de payer. Chaque canal traversé peut avoir sa propre politique.

Pour un opérateur, ces tarifs servent aussi à gérer la rareté de sa liquidité. Des prix élevés peuvent réduire le trafic ; des prix trop faibles peuvent rémunérer insuffisamment les ressources mobilisées. Le revenu de routage doit être comparé aux frais d’ouverture, de fermeture, de rééquilibrage et d’exploitation.

## Limites et confusions

Lightning n’impose pas un tarif universel et constant par paiement. Les frais de routage sont distincts des frais d’un service de garde, d’une conversion ou d’une ouverture de canal à la demande.

Un revenu positif en frais ne prouve pas la rentabilité d’un nœud. Une politique qui fonctionne sur un ensemble de canaux peut échouer ailleurs. Alice peut expliquer le calcul et les compromis sans promettre un revenu passif.

## Approfondissements

- [[lightning-routing.fr|Le routage d’un paiement]] — comprendre le cumul sur une route
- [[lightning-service-provider.fr|Les fournisseurs de services Lightning]] — identifier les frais de services supplémentaires

## Références

- PlanB lnp404 — Navigating Your Node with Terminal (référence de la note source, non reconsultée directement pour cette adaptation).
