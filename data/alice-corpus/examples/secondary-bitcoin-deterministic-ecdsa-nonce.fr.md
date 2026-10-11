---
type: "project_note"
id: "secondary-bitcoin-deterministic-ecdsa-nonce"
title: "Les nonces déterministes d’ECDSA"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Deterministic ECDSA Nonce"]
parent_ids: ["digital-signature", "entropy"]
related_ids: ["digital-signature", "entropy"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro202 — Programming Bitcoin"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les nonces déterministes d’ECDSA

## Questions couvertes

- Pourquoi un mauvais nonce de signature peut-il exposer une clé privée ?

## Réponse courte

ECDSA utilise un nonce secret par message signé. Une génération déterministe bien conçue réduit le risque d'un générateur aléatoire défaillant lors de la signature.

## Explication

- ECDSA exige un nonce unique et imprévisible pour chaque signature.
- Réutiliser ou révéler K peut exposer la clé privée.
- RFC 6979 est la méthode moderne courante pour générer K de manière déterministe.
- Cette pratique réduit fortement la dépendance à un générateur aléatoire au moment de signer.

## Limites et confusions

Réutiliser un nonce pour des messages différents peut exposer la clé ; on utilise une bibliothèque éprouvée, pas une recette artisanale.

## Approfondissements

- [[digital-signature.fr|La signature numérique]] pour revenir à la notion de base.
- [[entropy.fr|L’aléa nécessaire aux clés]] pour revenir à la notion de base.

## Références

- PlanB pro202 — Programming Bitcoin
