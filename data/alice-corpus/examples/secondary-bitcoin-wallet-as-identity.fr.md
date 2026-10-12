---
type: "project_note"
id: "secondary-bitcoin-wallet-as-identity"
title: "Le portefeuille comme moyen d’authentification"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Wallet as Identity"]
parent_ids: ["lnurl", "digital-signature"]
related_ids: ["lnurl", "digital-signature"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB biz101 — Bitcoin for Business"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Le portefeuille comme moyen d’authentification

## Questions couvertes

- Prouver le contrôle d’une clé permet-il de prouver son identité ?

## Réponse courte

Un portefeuille peut servir à s'authentifier auprès d'un service en prouvant le contrôle d'une clé.

## Explication

- Une demande d’authentification vérifie une signature ou une réponse liée à une clé connue du service.
- Cela identifie un moyen de contrôle cryptographique ; cela ne prouve pas à soi seul la personne réelle ni son droit sur un compte.

## Limites et confusions

Nostr Wallet Connect est d'abord une délégation de fonctions de paiement, pas une preuve universelle d'identité ; une clé stable peut faciliter le suivi.

## Approfondissements

- [[lnurl.fr|Les liens LNURL]] pour revenir à la notion de base.
- [[digital-signature.fr|La signature numérique]] pour revenir à la notion de base.

## Références

- PlanB biz101 — Bitcoin for Business
