---
type: "project_note"
id: "secondary-privacy-bip47-reusable-payment-codes"
title: "Les codes de paiement réutilisables BIP47"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["privacy"]
aliases: ["BIP47 Reusable Payment Codes"]
parent_ids: ["address-reuse", "silent-payments"]
related_ids: ["address-reuse", "silent-payments"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB btc204 — Privacy on Bitcoin"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les codes de paiement réutilisables BIP47

## Questions couvertes

- Comment recevoir plusieurs paiements sans réutiliser une adresse ?

## Réponse courte

BIP47 définit des codes de paiement réutilisables permettant de dériver des adresses de paiement distinctes entre participants compatibles.

## Explication

- BIP47 cherche à résoudre le problème pratique de la réception récurrente sans address reuse.
- Le destinataire publie un payment code, pas une adresse unique à réutiliser.
- La notification transaction introduit un coût et une empreinte on-chain.
- PayNym est l’un des usages connus de ce modèle.

## Limites et confusions

Les notifications et usages peuvent laisser des traces ; ne pas confondre code réutilisable et adresse Bitcoin réutilisée.

## Approfondissements

- [[address-reuse.fr|La réutilisation des adresses]] pour revenir à la notion de base.
- [[silent-payments.fr|Comprendre les Silent Payments]] pour revenir à la notion de base.

## Références

- PlanB btc204 — Privacy on Bitcoin
