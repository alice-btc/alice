---
type: "project_note"
id: "secondary-bitcoin-kerckhoffs-principle"
title: "Le principe de Kerckhoffs"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Kerckhoffs Principle"]
parent_ids: ["encryption", "software-integrity-verification"]
related_ids: ["encryption", "software-integrity-verification"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp302 — Modern Cryptography Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Le principe de Kerckhoffs

## Questions couvertes

- Comment un algorithme public peut-il rester sûr ?

## Réponse courte

Selon Kerckhoffs, la sécurité d'un système cryptographique doit pouvoir reposer sur le secret des clés même si l'algorithme est public.

## Explication

- La sécurité ne doit pas dépendre du secret de l’algorithme.
- Les algorithmes publics peuvent être examinés et attaqués par la communauté.
- Le secret est concentré dans les clés.
- Ce principe justifie l’open review des primitives modernes.

## Limites et confusions

Un algorithme public n'est pas automatiquement sûr ; il doit être analysé et correctement implémenté.

## Approfondissements

- [[encryption.fr|Chiffrement et signature]] pour revenir à la notion de base.
- [[software-integrity-verification.fr|Vérifier un téléchargement]] pour revenir à la notion de base.

## Références

- PlanB cyp302 — Modern Cryptography Fundamentals
