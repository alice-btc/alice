---
type: "project_note"
id: "secondary-bitcoin-bitcoin-security-assumptions"
title: "Les hypothèses de sécurité de Bitcoin"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Bitcoin Security Assumptions"]
parent_ids: ["bitcoin-consensus", "bitcoin-trustlessness"]
related_ids: ["bitcoin-consensus", "bitcoin-trustlessness"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB btc303 — Bitcoin Development Philosophy"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les hypothèses de sécurité de Bitcoin

## Questions couvertes

- Sur quelles hypothèses repose la sécurité de Bitcoin ?

## Réponse courte

La sécurité de Bitcoin dépend d'hypothèses cryptographiques et de comportements réseau, économiques et opérationnels.

## Explication

- Certaines hypothèses sont cryptographiques, d’autres économiques ou sociales.
- Bitcoin n’a pas de modèle de sécurité formel complet comparable à un petit protocole isolé.
- On étudie donc les incitations et comportements d’acteurs dans un système complexe.
- Quand une hypothèse devient fausse, il faut adapter le design ou reconnaître une limite.

## Limites et confusions

La validité d'une primitive cryptographique ne prouve pas à elle seule la sécurité de tout le système.

## Approfondissements

- [[bitcoin-consensus.fr|Le consensus]] pour revenir à la notion de base.
- [[bitcoin-trustlessness.fr|Vérifier plutôt que faire confiance]] pour revenir à la notion de base.

## Références

- PlanB btc303 — Bitcoin Development Philosophy
