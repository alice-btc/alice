---
type: "project_note"
id: "secondary-bitcoin-btcpay-invoices"
title: "Les factures BTCPay"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["BTCPay Invoices"]
parent_ids: ["btcpay-server", "bitcoin-payments-for-merchants"]
related_ids: ["btcpay-server", "bitcoin-payments-for-merchants"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pos305 — Mastering BTC Pay Server"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les factures BTCPay

## Questions couvertes

- Quelle différence entre une facture BTCPay et un paiement confirmé ?

## Réponse courte

Une facture BTCPay est une demande de paiement avec montant, expiration et méthodes acceptées. Elle sert à suivre le règlement du client.

## Explication

- Elles définissent montant, devise, expiration et méthodes de paiement disponibles.
- Elles permettent de suivre statut et confirmation.
- Elles peuvent être générées par PoS, crowdfund, API ou payment request.
- Leur cycle de vie est central dans un workflow marchand.

## Limites et confusions

Afficher une facture ou un retour navigateur ne prouve pas le règlement final ; le statut doit être contrôlé.

## Approfondissements

- [[btcpay-server.fr|Comprendre BTCPay Server]] pour revenir à la notion de base.
- [[bitcoin-payments-for-merchants.fr|Accepter un paiement Bitcoin]] pour revenir à la notion de base.

## Références

- PlanB pos305 — Mastering BTC Pay Server
