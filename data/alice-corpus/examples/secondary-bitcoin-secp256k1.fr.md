---
type: "project_note"
id: "secondary-bitcoin-secp256k1"
title: "La courbe secp256k1"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["secp256k1"]
parent_ids: ["digital-signature", "bitcoin-public-key"]
related_ids: ["digital-signature", "bitcoin-public-key"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# La courbe secp256k1

## Questions couvertes

- Que désigne secp256k1 dans Bitcoin ?

## Réponse courte

secp256k1 est la courbe utilisée dans Bitcoin pour ECDSA et Schnorr. La clé publique est dérivée d'une clé privée valide par une opération sur cette courbe.

## Explication

- La clé privée correspond à un scalaire valide et la clé publique à un point obtenu par multiplication d’un point de référence.
- ECDSA et Schnorr utilisent cette même courbe dans Bitcoin, mais leurs procédures de signature diffèrent.

## Limites et confusions

Comprendre son nom ne suffit pas à implémenter soi-même la cryptographie d'un portefeuille.

## Approfondissements

- [[digital-signature.fr|La signature numérique]] pour revenir à la notion de base.
- [[bitcoin-public-key.fr|La clé publique]] pour revenir à la notion de base.

## Références

- PlanB cyp201 — Bitcoin Wallet Architecture
