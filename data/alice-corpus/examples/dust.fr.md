---
type: "project_note"
id: "dust"
title: "Le dust et les sorties non rentables"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Dust", "poussière", "dust limit", "sortie non rentable"]
parent_ids: []
related_ids: ["coin-selection-tradeoffs", "transaction-fees", "bitcoin-mempool-policy", "consolidation-transaction"]
reviewed_at: "2026-11-02"
review_due: null
sources: ["https://github.com/bitcoin/bitcoin/blob/v30.0/src/policy/policy.cpp", "https://github.com/bitcoin/bitcoin/blob/v30.0/src/policy/policy.h"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Le dust et les sorties non rentables

## Questions couvertes

- Pourquoi mon portefeuille dit-il qu’un petit montant n’est pas rentable à dépenser ?
- Qu’est-ce que le dust et la limite de dust ?

## Réponse courte

Le mot dust recouvre deux notions. La limite de dust est une règle de relais : un nœud Bitcoin Core refuse par défaut de relayer une transaction qui crée une sortie trop petite pour valoir le coût de sa dépense. Une sortie « non rentable à dépenser » est un jugement du portefeuille : au taux de frais du moment, dépenser cette sortie coûterait autant ou plus qu’elle ne vaut.

## Explication

La règle de relais fixe un seuil par type de script. Bitcoin Core additionne la taille de la sortie et celle de l’entrée qui servira à la dépenser, puis multiplie ce total par un taux de référence, le réglage `dustrelayfee`, 3 000 sats par kvB par défaut, soit 3 sats/vB. Une sortie dont la valeur est inférieure à ce coût est du dust et la transaction qui la crée n’est pas relayée. Avec les réglages par défaut, le seuil est de 546 sats pour une sortie P2PKH, 294 sats pour une sortie P2WPKH et 330 sats pour une sortie P2WSH ou P2TR. Ce seuil ne suit pas les frais du moment : il reste fixe tant que le réglage ne change pas.

Le jugement du portefeuille dépend, lui, du taux de frais du moment. Dépenser une sortie ajoute une entrée à la transaction, environ 68 vB pour une entrée P2WPKH ou 58 vB pour une entrée P2TR. Exemple fictif : à 10 sats/vB, cette entrée coûte à elle seule plusieurs centaines de sats, une sortie de 300 sats est donc dépensée à perte, et beaucoup de portefeuilles l’écartent de la sélection ou la signalent comme non rentable. Quand les frais baissent, la même sortie peut redevenir rentable à dépenser, par exemple dans une transaction de consolidation.

## Limites et confusions

Recevoir une sortie sous le seuil de relais reste possible : un mineur peut inclure une transaction que les nœuds aux réglages par défaut ne relaient pas, et d’autres réglages existent. Le seuil de relais n’est pas une règle de consensus ; un bloc contenant une sortie de 1 sat reste valide. À l’inverse, une sortie au-dessus du seuil, par exemple 300 sats en P2WPKH, peut rester non rentable à dépenser tant que les frais sont élevés. Les chiffres cités sont ceux des réglages par défaut de Bitcoin Core ; un portefeuille ou un nœud peut appliquer d’autres valeurs, et le calcul exact dépend de la version. Une sortie non rentable n’est pas perdue : elle attend des frais plus bas ou un regroupement avec d’autres sorties.

## Approfondissements

- [[coin-selection-tradeoffs.fr|Sélection des UTXO et compromis]].
- [[transaction-fees.fr|Les frais de transaction]].
- [[bitcoin-mempool-policy.fr|Règles locales et consensus]].
- [[consolidation-transaction.fr|La consolidation des UTXO]].

## Références

- [Bitcoin Core 30.0, calcul du seuil de dust par type de sortie](https://github.com/bitcoin/bitcoin/blob/v30.0/src/policy/policy.cpp).
- [Bitcoin Core 30.0, taux de référence du dust](https://github.com/bitcoin/bitcoin/blob/v30.0/src/policy/policy.h).
