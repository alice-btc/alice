---
type: "project_note"
id: "secondary-bitcoin-privacy-by-obfuscation"
title: "La confidentialité par ambiguïté des liens"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Privacy by Obfuscation"]
parent_ids: ["coinjoin", "bitcoin-chain-analysis"]
related_ids: ["coinjoin", "bitcoin-chain-analysis"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro101 — Bitcoin Development Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# La confidentialité par ambiguïté des liens

## Questions couvertes

- Comment une transaction collaborative complique-t-elle l’analyse de chaîne ?

## Réponse courte

Certaines techniques de confidentialité rendent plus ambigu le lien entre entrées, sorties et utilisateurs.

## Explication

- Une transaction collaborative peut offrir plusieurs associations plausibles entre entrées et sorties.
- Des choix de montants, de chronologie ou des informations d’identité externes peuvent réduire cette ambiguïté.

## Limites et confusions

L'ambiguïté observée ne garantit pas anonymat ; des métadonnées extérieures peuvent rétablir un lien.

## Approfondissements

- [[coinjoin.fr|Comprendre CoinJoin]] pour revenir à la notion de base.
- [[bitcoin-chain-analysis.fr|L’analyse de chaîne]] pour revenir à la notion de base.

## Références

- PlanB pro101 — Bitcoin Development Fundamentals
