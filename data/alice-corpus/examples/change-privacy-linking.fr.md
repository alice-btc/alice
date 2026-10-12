---
type: "project_note"
id: "change-privacy-linking"
title: "Monnaie rendue et liens de confidentialité"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["privacy", "transactions"]
aliases: ["change", "monnaie rendue"]
parent_ids: ["bitcoin-utxo"]
related_ids: ["coin-selection-tradeoffs"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bips/blob/master/bip-0078.mediawiki", "https://github.com/bitcoin/bitcoin/pull/23789"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Monnaie rendue et liens de confidentialité

## Questions couvertes

- Comment la monnaie rendue peut-elle être reconnue ?
- Une nouvelle adresse efface-t-elle l’historique ?

## Réponse courte

La monnaie rendue crée une nouvelle sortie, mais reste reliée publiquement à la transaction qui l’a créée. Changer d’adresse ne supprime pas ce lien.

## Explication

Un observateur peut tenter d’identifier le change à partir du type de sortie, des montants ou de dépenses ultérieures. Ce sont des hypothèses. Réunir ensuite ce change avec d’autres fonds peut fournir des indices supplémentaires.

Pour limiter certains indices, un portefeuille peut créer le change avec le même type d’adresse qu’une sortie de paiement. Bitcoin Core a intégré ce principe dans une modification fusionnée le 2021-12-20. Cela réduit un indice lié au format des sorties, sans effacer les liens de la transaction ni garantir que le change soit indétectable.

## Limites et confusions

Le risque pour la confidentialité dépend du contexte et des dépenses suivantes. Aucune de ces observations ne prouve à elle seule une identité. Il faut distinguer information visible et interprétation.

## Approfondissements

- [[coin-selection-tradeoffs.fr|Sélection des UTXO et compromis]] (coin-selection-tradeoffs) pour revenir aux choix faits avant la transaction.

## Références

- [BIP 78, heuristiques de confidentialité et PayJoin](https://github.com/bitcoin/bips/blob/master/bip-0078.mediawiki).

- [Bitcoin Core, aligner le type du change sur une destination](https://github.com/bitcoin/bitcoin/pull/23789).
