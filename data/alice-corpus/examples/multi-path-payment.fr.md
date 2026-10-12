---
type: "project_note"
id: "multi-path-payment"
title: "Le paiement en plusieurs chemins"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Multi-Path Payment"]
parent_ids: []
related_ids: ["lightning-liquidity-path", "lightning-routing"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/lightning/bolts/blob/master/04-onion-routing.md#basic-multi-part-payments", "https://docs.lightning.engineering/lightning-network-tools/lnd/amp"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Le paiement en plusieurs chemins

## Questions couvertes

- Un paiement peut-il être réparti sur plusieurs routes ?

## Réponse courte

Un paiement Lightning en plusieurs parties répartit le montant entre plusieurs fragments, éventuellement par des chemins différents. Cela aide à utiliser une liquidité que ne pourrait pas mobiliser une seule route.

## Explication

Le destinataire réunit les fragments pour le règlement. Dans le MPP de base, ils partagent le même hash de paiement. BOLT 4 impose d’attendre le total annoncé avant de régler un fragment, puis de régler l’ensemble si un fragment est réglé. Présenter ce mécanisme comme généralement non atomique serait incorrect.

AMP, une variante proposée dans LND, utilise des hashes distincts et des parts de secret. Leur reconstruction exige l’ensemble des fragments. Il faut distinguer cette construction cryptographique de la règle d’attente du MPP de base.

## Limites et confusions

Un paiement fragmenté n’a pas une garantie de succès. Il faut encore suffisamment de liquidité, des chemins accessibles et une coordination dans les délais. Un ensemble incomplet doit échouer plutôt que laisser le destinataire considérer arbitrairement le paiement total comme reçu.

AMP n’est pas universellement préférable ni compatible partout. Le hash commun de MPP peut faciliter certains rapprochements ; le supprimer ne garantit pas l’anonymat. Les preuves de paiement dépendent aussi du mécanisme utilisé.

## Approfondissements

- [[lightning-liquidity-path.fr|Liquidité et chemins de paiement Lightning]] — Liquidité et chemins — comprendre la fragmentation
- [[lightning-routing.fr|Le routage d’un paiement]] — situer le choix des routes

## Références

- [BOLT 4, Basic Multi-Part Payments et exigences du destinataire](https://github.com/lightning/bolts/blob/master/04-onion-routing.md#basic-multi-part-payments).
- [Lightning Labs, AMP dans LND](https://docs.lightning.engineering/lightning-network-tools/lnd/amp).
