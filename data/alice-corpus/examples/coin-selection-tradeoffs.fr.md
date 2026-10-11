---
type: "project_note"
id: "coin-selection-tradeoffs"
title: "Sélection des UTXO et compromis"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["transactions", "privacy"]
aliases: ["coin selection", "choix des entrées"]
parent_ids: ["bitcoin-utxo"]
related_ids: ["change-privacy-linking"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/transactions.html", "https://github.com/bitcoin/bips/blob/master/bip-0078.mediawiki", "https://github.com/bitcoin/bitcoin/blob/master/src/wallet/coinselection.cpp", "https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Sélection des UTXO et compromis

## Questions couvertes

- Pourquoi ne pas toujours choisir les plus petits UTXO ?
- Pourquoi 2 transactions de même montant ont-elles des frais différents ?

## Réponse courte

La sélection des UTXO choisit les entrées utilisées pour payer. Elle doit couvrir le montant et les frais tout en tenant compte de la taille de la transaction et des liens qu’elle rend publics.

## Explication

Choisir systématiquement les plus petits UTXO multiplie souvent les entrées. Chaque entrée augmente généralement le poids de la transaction et donc les frais au même taux. Cette stratégie peut toutefois éviter de devoir dépenser ces petits UTXO plus tard, à un taux peut-être supérieur. Le choix dépend donc aussi des frais futurs envisagés.

Ajouter des entrées augmente généralement la quantité de données à signer et à transmettre. Réunir des fonds reçus dans des contextes distincts peut aussi suggérer un contrôle commun. Une sélection évitant la monnaie rendue peut être intéressante dans certains cas, mais ne constitue pas une règle universelle.

## Limites et confusions

Les frais dépendent de la taille virtuelle de la transaction, influencée par les types d’entrées et de sorties, et du taux choisi en sats/vB. Exemple fictif avec une transaction de 200 vB à 5 sats/vB — les frais sont de 1 000 sats, quel que soit le montant envoyé. Un petit paiement peut donc coûter plus cher qu’un gros paiement si sa transaction est plus lourde.

Les transactions collaboratives montrent que des entrées communes ne prouvent pas toujours un propriétaire unique.

## Approfondissements

- [[change-privacy-linking.fr|Monnaie rendue et liens de confidentialité]] (change-privacy-linking) pour examiner les traces laissées par la monnaie rendue.

## Références

- [Bitcoin Developer Guide, transactions](https://developer.bitcoin.org/devguide/transactions.html).
- [BIP 78, heuristiques de confidentialité et PayJoin](https://github.com/bitcoin/bips/blob/master/bip-0078.mediawiki).

- [Bitcoin Core, algorithmes de sélection et coûts immédiats ou futurs](https://github.com/bitcoin/bitcoin/blob/master/src/wallet/coinselection.cpp).

- [BIP141, taille virtuelle](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki).
