---
type: "project_note"
id: "secondary-bitcoin-btcpay-extended-public-key"
title: "Recevoir avec une clé publique étendue dans BTCPay"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["BTCPay Extended Public Key"]
parent_ids: ["btcpay-server", "extended-public-key"]
related_ids: ["btcpay-server", "extended-public-key"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pos305 — Mastering BTC Pay Server"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Recevoir avec une clé publique étendue dans BTCPay

## Questions couvertes

- BTCPay peut-il créer des adresses sans détenir mes clés privées ?

## Réponse courte

BTCPay peut dériver des adresses de réception depuis une clé publique étendue sans détenir les clés permettant de dépenser.

## Explication

- Il permet un wallet watch-only côté serveur.
- Sa fuite expose l’historique et les futures adresses de la branche.
- Il doit être traité comme une donnée sensible de confidentialité.
- Il facilite l’évitement de réutilisation d’adresse.

## Limites et confusions

L'exposition de cette clé publique étendue peut révéler l'historique et les adresses dérivées de la branche concernée.

## Approfondissements

- [[btcpay-server.fr|Comprendre BTCPay Server]] pour revenir à la notion de base.
- [[extended-public-key.fr|La clé publique étendue]] pour revenir à la notion de base.

## Références

- PlanB pos305 — Mastering BTC Pay Server
