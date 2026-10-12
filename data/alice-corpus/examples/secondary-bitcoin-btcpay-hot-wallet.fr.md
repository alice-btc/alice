---
type: "project_note"
id: "secondary-bitcoin-btcpay-hot-wallet"
title: "Les clés privées sur un serveur BTCPay"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["BTCPay Hot Wallet"]
parent_ids: ["btcpay-server", "hot-wallet"]
related_ids: ["btcpay-server", "hot-wallet"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pos305 — Mastering BTC Pay Server"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les clés privées sur un serveur BTCPay

## Questions couvertes

- Quel risque ajoute un portefeuille connecté au serveur marchand ?

## Réponse courte

Un portefeuille à clés privées sur le serveur peut automatiser des dépenses mais expose les fonds à la compromission de cette infrastructure.

## Explication

- La présence de clés sur le serveur facilite l’automatisation mais étend l’impact d’un compte ou serveur compromis.
- Une architecture sans clés privées sur le serveur limite ce pouvoir de dépense, au prix d’étapes de signature supplémentaires.

## Limites et confusions

Le risque dépend des accès, sauvegardes et permissions ; 'petit montant' ne rend pas un serveur sûr.

## Approfondissements

- [[btcpay-server.fr|Comprendre BTCPay Server]] pour revenir à la notion de base.
- [[hot-wallet.fr|Le portefeuille connecté]] pour revenir à la notion de base.

## Références

- PlanB pos305 — Mastering BTC Pay Server
