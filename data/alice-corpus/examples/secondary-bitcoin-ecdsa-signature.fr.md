---
type: "project_note"
id: "secondary-bitcoin-ecdsa-signature"
title: "Les signatures ECDSA dans Bitcoin"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["ECDSA Signature"]
parent_ids: ["digital-signature", "taproot"]
related_ids: ["digital-signature", "taproot"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les signatures ECDSA dans Bitcoin

## Questions couvertes

- Bitcoin utilise-t-il encore ECDSA depuis Taproot ?

## Réponse courte

Bitcoin utilise ECDSA pour plusieurs formats de dépense et Schnorr pour Taproot. La protection du nonce de signature est essentielle avec ECDSA.

## Explication

- Les formats historiques et SegWit v0 continuent d’utiliser ECDSA ; Taproot introduit Schnorr pour ses propres dépenses.
- La signature permet de vérifier l’autorisation d’une dépense, sans chiffrer la transaction ni cacher ses montants.

## Limites et confusions

Taproot n'a pas remplacé toutes les signatures ECDSA existantes.

## Approfondissements

- [[digital-signature.fr|La signature numérique]] pour revenir à la notion de base.
- [[taproot.fr|Les adresses bc1p et Taproot]] pour revenir à la notion de base.

## Références

- PlanB cyp201 — Bitcoin Wallet Architecture
