---
type: "project_note"
id: "secondary-bitcoin-authenticated-encryption"
title: "Le chiffrement authentifié"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Authenticated Encryption"]
parent_ids: ["encryption", "alice-local-encryption"]
related_ids: ["encryption", "alice-local-encryption"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp302 — Modern Cryptography Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Le chiffrement authentifié

## Questions couvertes

- Pourquoi chiffrer ne suffit-il pas toujours à protéger un message ?

## Réponse courte

Le chiffrement authentifié protège le contenu et permet de détecter certaines modifications non autorisées. Les données associées peuvent être authentifiées sans être chiffrées.

## Explication

- Elle évite de bricoler séparément chiffrement et MAC.
- Les modes AEAD ajoutent souvent des associated data non chiffrées mais authentifiées.
- Elle est recommandée pour beaucoup de protocoles modernes.
- Elle protège contre des attaques actives absentes du simple chiffrement.

## Limites et confusions

La sécurité dépend aussi de la gestion des clés et des nonces ; elle ne protège pas un appareil déjà déverrouillé et compromis.

## Approfondissements

- [[encryption.fr|Chiffrement et signature]] pour revenir à la notion de base.
- [[alice-local-encryption.fr|Les données locales d’Alice App]] pour revenir à la notion de base.

## Références

- PlanB cyp302 — Modern Cryptography Fundamentals
