---
type: "project_note"
id: "secondary-bitcoin-btcpay-security"
title: "Sécuriser une installation BTCPay"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["BTCPay Security"]
parent_ids: ["btcpay-server", "two-factor-authentication"]
related_ids: ["btcpay-server", "two-factor-authentication"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pos305 — Mastering BTC Pay Server"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Sécuriser une installation BTCPay

## Questions couvertes

- Que faut-il protéger en plus du mot de passe du compte BTCPay ?

## Réponse courte

La sécurité BTCPay concerne à la fois les comptes, droits, tokens d'intégration, serveur et clés du portefeuille.

## Explication

- La 2FA protège l’accès utilisateur mais ne remplace pas une bonne gestion des clés Bitcoin.
- Les access tokens doivent être limités et révocables.
- Les rôles doivent respecter le principe du moindre privilège.
- Les hot wallets et payouts demandent une prudence particulière.

## Limites et confusions

La 2FA d'un compte ne protège pas à elle seule des clés privées exposées sur le serveur.

## Approfondissements

- [[btcpay-server.fr|Comprendre BTCPay Server]] pour revenir à la notion de base.
- [[two-factor-authentication.fr|La double authentification]] pour revenir à la notion de base.

## Références

- PlanB pos305 — Mastering BTC Pay Server
