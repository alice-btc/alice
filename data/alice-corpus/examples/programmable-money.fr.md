---
type: "project_note"
id: "programmable-money"
title: "La monnaie programmable"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Monnaie et économie"]
aliases: ["Programmable Money"]
parent_ids: []
related_ids: ["bitcoin-script", "cbdc"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/transactions.html", "https://developer.bitcoin.org/devguide/contracts.html"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La monnaie programmable

## Questions couvertes

- Que peut signifier programmer une monnaie ou un paiement ?

## Réponse courte

La monnaie programmable peut désigner des paiements conditionnels ou des restrictions imposées à l’usage des fonds. Il faut préciser qui écrit les conditions et qui peut les modifier.

## Explication

Les participants peuvent choisir des règles pour une opération, comme exiger plusieurs signatures ou attendre un délai. Un émetteur central peut, dans une autre architecture, limiter les destinataires ou les catégories de dépenses. Ces mécanismes ne distribuent pas le même pouvoir.

Bitcoin Script permet des conditions de dépense fixées lors de la création d’une sortie. Cela ne signifie pas qu’une autorité centrale du protocole décide quels achats chaque utilisateur peut effectuer. Un service utilisé autour de Bitcoin peut néanmoins imposer ses propres règles à ses clients.

## Limites et confusions

Automatiser un paiement ne revient pas nécessairement à rendre chaque unité monétaire utilisable seulement dans certains commerces. L’expression générale « programmable » masque parfois cette différence.

Une fonction peut faciliter un usage légitime et accroître en même temps les possibilités de contrôle. L’évaluation doit décrire les pouvoirs concrets, les données accessibles et les recours. Les restrictions d’une MNBC ou d’un stablecoin doivent être rapportées au système concerné, sans être supposées identiques partout.

## Approfondissements

- [[bitcoin-script.fr|Les conditions de dépense]] — comprendre les conditions de dépense
- [[cbdc.fr|Les monnaies numériques de banque centrale]] — examiner la programmation institutionnelle

## Références

- [Bitcoin Developer Guide, Transactions](https://developer.bitcoin.org/devguide/transactions.html).
- [Contracts](https://developer.bitcoin.org/devguide/contracts.html).
