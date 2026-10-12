---
type: "project_note"
id: "bitcoin-mempool"
title: "La file d’attente des transactions"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Bitcoin Mempool"]
parent_ids: []
related_ids: ["bitcoin-mempool-policy", "replace-by-fee", "transaction-fees"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bips/blob/master/bip-0035.mediawiki", "https://github.com/bitcoin/bitcoin/blob/v31.1/src/net_processing.cpp", "https://bitcoincore.org/en/releases/0.19.0.1/"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La file d’attente des transactions

## Questions couvertes

- Où se trouve une transaction non confirmée ?

## Réponse courte

La mempool est la collection locale de transactions non confirmées qu’un nœud conserve. Il existe des mempools, et non une file d’attente mondiale unique.

## Explication

Un nœud reçoit une transaction, la vérifie et applique sa politique locale avant de l’accepter et éventuellement la relayer. Ses voisins peuvent connaître d’autres transactions ou appliquer d’autres limites. Les mineurs puisent notamment dans cette information pour préparer leurs blocs.

Un explorateur montre donc une vue utile, pas une photographie universelle du réseau. Une transaction peut disparaître d’une mempool sans avoir été confirmée, par exemple après une éviction ou un remplacement.

## Limites et confusions

L’ordre d’arrivée ne fixe pas un ordre obligatoire d’inclusion. Les taux de frais et les dépendances entre transactions comptent. Le message P2P mempool décrit par BIP35 demande des informations à un pair ; il n’a pas créé le relais des transactions non confirmées. L’accès à cette requête peut être limité et ne se confond pas avec une commande locale du nœud.

## Approfondissements

- [[bitcoin-mempool-policy.fr|Règles locales et consensus]].
- [[replace-by-fee.fr|Augmenter les frais avec RBF]].
- [[transaction-fees.fr|Les frais de transaction]].

## Références

- [Référence publique conservée de la note source](https://github.com/bitcoin/bips/blob/master/bip-0035.mediawiki).
- [Référence publique conservée de la note source](https://github.com/bitcoin/bitcoin/blob/v31.1/src/net_processing.cpp).
- [Référence publique conservée de la note source](https://bitcoincore.org/en/releases/0.19.0.1/).
