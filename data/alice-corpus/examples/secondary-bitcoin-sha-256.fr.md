---
type: "project_note"
id: "secondary-bitcoin-sha-256"
title: "SHA-256 et la preuve de travail"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["SHA-256"]
parent_ids: ["cryptographic-hash-function", "proof-of-work"]
related_ids: ["cryptographic-hash-function", "proof-of-work"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB min101 — Introduction to Bitcoin mining"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# SHA-256 et la preuve de travail

## Questions couvertes

- Quel calcul les mineurs Bitcoin répètent-ils ?

## Réponse courte

SHA-256 produit une empreinte de 256 bits. Pour la preuve de travail Bitcoin, les mineurs recherchent un double SHA-256 d'en-tête satisfaisant la cible.

## Explication

- L’en-tête change lorsque le mineur modifie certaines données du bloc candidat et provoque une nouvelle empreinte.
- La plupart des essais ne satisfont pas la cible ; trouver une empreinte conforme est difficile, la contrôler est rapide.

## Limites et confusions

La propriété recherchée est une difficulté calculatoire ; ce n'est ni un chiffrement ni une preuve d'identité.

## Approfondissements

- [[cryptographic-hash-function.fr|L’empreinte cryptographique]] pour revenir à la notion de base.
- [[proof-of-work.fr|La preuve de travail]] pour revenir à la notion de base.

## Références

- PlanB min101 — Introduction to Bitcoin mining
