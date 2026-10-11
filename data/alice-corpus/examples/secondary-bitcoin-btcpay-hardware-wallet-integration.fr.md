---
type: "project_note"
id: "secondary-bitcoin-btcpay-hardware-wallet-integration"
title: "Signer les dépenses BTCPay avec un appareil dédié"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["BTCPay Hardware Wallet Integration"]
parent_ids: ["btcpay-server", "hardware-wallet"]
related_ids: ["btcpay-server", "hardware-wallet"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pos305 — Mastering BTC Pay Server"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Signer les dépenses BTCPay avec un appareil dédié

## Questions couvertes

- Comment utiliser un hardware wallet avec BTCPay ?

## Réponse courte

Un marchand peut recevoir via BTCPay et signer les dépenses avec un appareil distinct, notamment au moyen de PSBT.

## Explication

- Le serveur peut préparer les données de dépense alors que les clés de signature restent sur un appareil séparé.
- Le signataire doit comparer les destinataires, montants et frais affichés par l’appareil avant d’autoriser la dépense.

## Limites et confusions

Vérifier les détails sur l'écran fiable du dispositif de signature ; l'ordinateur ou serveur peut être compromis.

## Approfondissements

- [[btcpay-server.fr|Comprendre BTCPay Server]] pour revenir à la notion de base.
- [[hardware-wallet.fr|Le rôle d’un appareil de signature]] pour revenir à la notion de base.

## Références

- PlanB pos305 — Mastering BTC Pay Server
