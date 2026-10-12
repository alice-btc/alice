---
type: "project_note"
id: "bitcoin-utxo"
title: "Comprendre les UTXO"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["UTXO", "sortie non dépensée"]
parent_ids: []
related_ids: ["coin-selection-tradeoffs", "change-privacy-linking", "secondary-bitcoin-utxo-vs-account-based-model"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/transactions.html", "https://developer.bitcoin.org/devguide/block_chain.html", "https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki", "https://github.com/bitcoin/bitcoin/blob/master/src/wallet/coinselection.cpp"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Comprendre les UTXO

## Questions couvertes

- Pourquoi mon solde est-il composé de plusieurs morceaux ?
- C’est quoi un UTXO ?

## Réponse courte

Un UTXO est une sortie de transaction qui n’a pas encore été dépensée. Le solde d’un portefeuille peut réunir plusieurs UTXO, comme plusieurs pièces disponibles pour payer.

## Explication

Pour effectuer un paiement ordinaire, une transaction consomme des UTXO et crée de nouvelles sorties. Exemple fictif avec 1 entrée de 10 000 sats : 6 000 sats vont au destinataire, 3 500 sats reviennent en monnaie rendue et 500 sats constituent les frais. L’entrée initiale est consommée entièrement. Les frais sont la différence entre le total des entrées et celui des sorties ; ils ne forment pas 1 sortie supplémentaire dans cette transaction.

## Limites et confusions

La transaction coinbase du bloc constitue une exception. Elle crée la subvention et attribue les frais au mineur sans consommer d’ancien UTXO.

Chaque UTXO dépensé ajoute une entrée et du poids à la transaction. À taux de frais identique, dépenser de nombreux petits UTXO coûte généralement plus cher que dépenser quelques gros UTXO. Quand le taux monte, le coût supplémentaire pour dépenser un très petit UTXO peut dépasser sa valeur ; il reste présent, mais sa dépense devient économiquement défavorable.

Cette comparaison avec des pièces explique le mécanisme, pas la confidentialité. Une adresse ne représente pas nécessairement tout le solde du portefeuille.

## Approfondissements

- [[coin-selection-tradeoffs.fr|Sélection des UTXO et compromis]] (coin-selection-tradeoffs) pour comprendre le choix des entrées et ses compromis.
- [[change-privacy-linking.fr|Monnaie rendue et liens de confidentialité]] (change-privacy-linking) pour comprendre ce que la monnaie rendue peut révéler.

- [[secondary-bitcoin-utxo-vs-account-based-model.fr|Les UTXO comparés aux comptes]].

## Références

- [Bitcoin Developer Guide, transactions](https://developer.bitcoin.org/devguide/transactions.html).

- [Bitcoin Developer Guide, chaîne de blocs](https://developer.bitcoin.org/devguide/block_chain.html).

- [BIP141, poids et taille virtuelle des transactions](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki).

- [Bitcoin Core, sélection selon la valeur après frais et le coût du change](https://github.com/bitcoin/bitcoin/blob/master/src/wallet/coinselection.cpp).
