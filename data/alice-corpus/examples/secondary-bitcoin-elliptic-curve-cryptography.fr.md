---
type: "project_note"
id: "secondary-bitcoin-elliptic-curve-cryptography"
title: "La cryptographie sur courbes elliptiques"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Elliptic Curve Cryptography"]
parent_ids: ["bitcoin-public-key", "digital-signature"]
related_ids: ["bitcoin-public-key", "digital-signature"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# La cryptographie sur courbes elliptiques

## Questions couvertes

- Comment une clé publique est-elle liée à une clé privée ?

## Réponse courte

La cryptographie sur courbes elliptiques relie des clés privées, des clés publiques et des signatures vérifiables. Bitcoin utilise notamment la courbe secp256k1.

## Explication

- Une opération sur la courbe permet de calculer une clé publique à partir d’une clé privée.
- Les signatures permettent ensuite de démontrer une autorisation sans transmettre directement le secret.

## Limites et confusions

L'impossibilité d'inversion est une hypothèse de difficulté calculatoire avec les moyens connus, pas une impossibilité mathématique absolue.

## Approfondissements

- [[bitcoin-public-key.fr|La clé publique]] pour revenir à la notion de base.
- [[digital-signature.fr|La signature numérique]] pour revenir à la notion de base.

## Références

- PlanB cyp201 — Bitcoin Wallet Architecture
