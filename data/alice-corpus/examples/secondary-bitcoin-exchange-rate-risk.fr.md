---
type: "project_note"
id: "secondary-bitcoin-exchange-rate-risk"
title: "Le risque de change lors d’un paiement"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Exchange Rate Risk"]
parent_ids: ["bitcoin-payments-for-merchants", "bitcoin-volatility"]
related_ids: ["bitcoin-payments-for-merchants", "bitcoin-volatility"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pos305 — Mastering BTC Pay Server"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Le risque de change lors d’un paiement

## Questions couvertes

- Le prix peut-il varier entre la facture et la conversion des bitcoins ?

## Réponse courte

Le prix du bitcoin peut varier entre le devis, le paiement et la conversion éventuelle ; une facture expirant limite la durée d'un taux proposé.

## Explication

- Un commerçant peut fixer ses prix dans une devise et calculer la quantité de BTC demandée au moment de la facture.
- Après encaissement, la valeur du BTC conservé continue de varier par rapport à cette devise.

## Limites et confusions

L'expiration de la facture ne stabilise pas la valeur des bitcoins déjà reçus.

## Approfondissements

- [[bitcoin-payments-for-merchants.fr|Accepter un paiement Bitcoin]] pour revenir à la notion de base.
- [[bitcoin-volatility.fr|La volatilité de Bitcoin]] pour revenir à la notion de base.

## Références

- PlanB pos305 — Mastering BTC Pay Server
