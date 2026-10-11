---
type: "project_note"
id: "secondary-bitcoin-extended-private-key"
title: "Les clés privées étendues"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Extended Private Key"]
parent_ids: ["hd-wallet", "bitcoin-private-key"]
related_ids: ["hd-wallet", "bitcoin-private-key"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les clés privées étendues

## Questions couvertes

- Pourquoi une clé privée étendue est-elle particulièrement sensible ?

## Réponse courte

Une clé privée étendue permet de dériver des clés privées enfants dans une hiérarchie de portefeuille.

## Explication

- Elle est souvent représentée par des préfixes comme xprv, yprv ou zprv selon contexte.
- Sa fuite peut compromettre une branche entière du wallet.
- Elle contient ou implique un chain code.
- Elle peut produire l’extended public key correspondante.

## Limites et confusions

Sa fuite peut compromettre une branche entière ; elle doit rester secrète, contrairement à une simple donnée de réception.

## Approfondissements

- [[hd-wallet.fr|Les portefeuilles déterministes]] pour revenir à la notion de base.
- [[bitcoin-private-key.fr|La clé privée]] pour revenir à la notion de base.

## Références

- PlanB cyp201 — Bitcoin Wallet Architecture
