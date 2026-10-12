---
type: "project_note"
id: "lightning-network"
title: "Comprendre Lightning"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Lightning", "réseau Lightning"]
parent_ids: []
related_ids: ["lightning-liquidity-path", "lightning-splicing", "secondary-lightning-bolts", "secondary-lightning-lightning-node-implementation", "secondary-lightning-nostr-wallet-connect", "secondary-tx-model-transaction-malleability"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/lightning/bolts/blob/master/02-peer-protocol.md", "https://github.com/lightning/bolts/blob/master/04-onion-routing.md", "https://github.com/lnbook/lnbook/blob/develop/01_introduction.asciidoc", "https://github.com/lightningnetwork/lnd/blob/master/docs/recovery.md", "https://docs.corelightning.org/docs/recovery", "https://github.com/lightning/bolts/blob/master/03-transactions.md"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Comprendre Lightning

## Questions couvertes

- Pourquoi utiliser Lightning plutôt que la couche de base ?
- Faut-il un canal direct avec chaque destinataire ?

## Réponse courte

Lightning est un réseau de canaux de paiement construit au-dessus de Bitcoin. Des paiements peuvent y circuler sans inscrire chacun d’eux dans un nouveau bloc. Ils peuvent ainsi se régler en quelques secondes avec de faibles frais, ce qui est utile pour les paiements fréquents ou de petit montant.

## Explication

Les participants mettent à jour leurs engagements dans les canaux. Un paiement peut passer par plusieurs intermédiaires, sur 1 ou plusieurs chemins appropriés. Un canal direct avec chaque destinataire n’est donc pas nécessaire. La chaîne Bitcoin reste utilisée notamment pour établir ou régler les canaux.

## Limites et confusions

La rapidité et les frais dépendent de la situation. La disponibilité, la liquidité et le modèle de garde du service comptent. Lightning n’offre pas une capacité illimitée ni une réception garantie.

En garde personnelle, les sauvegardes nécessaires dépendent du logiciel. La phrase de récupération seule ne suffit pas toujours à récupérer les fonds de canaux ouverts ; LND et Core Lightning prévoient des données et procédures spécifiques. Réutiliser un ancien état puis publier une transaction révoquée peut entraîner une pénalité.

Une fermeture forcée peut rendre certains fonds indisponibles pendant un délai exprimé en blocs, éventuellement plusieurs jours. Ce délai dépend du canal, de la sortie et du type de fermeture ; il ne s’applique pas uniformément à tous les fonds.

## Approfondissements

- [[lightning-splicing.fr|Modifier les fonds d’un canal avec le splicing]] (lightning-splicing) pour approfondir l’ajout ou le retrait de fonds du canal.
- [[lightning-liquidity-path.fr|Liquidité et chemins de paiement Lightning]] (lightning-liquidity-path) pour comprendre pourquoi un paiement peut échouer malgré un solde disponible.

- [[secondary-lightning-bolts.fr|Les spécifications BOLT de Lightning]].
- [[secondary-lightning-lightning-node-implementation.fr|Les implémentations de Lightning]].
- [[secondary-lightning-nostr-wallet-connect.fr|Les connexions Nostr Wallet Connect]].
- [[secondary-tx-model-transaction-malleability.fr|La malléabilité des transactions]].

## Références

- [BOLT 2, protocole des canaux](https://github.com/lightning/bolts/blob/master/02-peer-protocol.md).

- [BOLT 4, paiements routés et fragments](https://github.com/lightning/bolts/blob/master/04-onion-routing.md).

- [Mastering the Lightning Network, usages et paiements rapides](https://github.com/lnbook/lnbook/blob/develop/01_introduction.asciidoc).

- [LND, sauvegardes et récupération](https://github.com/lightningnetwork/lnd/blob/master/docs/recovery.md).

- [Core Lightning, récupération et précautions sur les états anciens](https://docs.corelightning.org/docs/recovery).

- [BOLT 3, sorties de fermeture et délais](https://github.com/lightning/bolts/blob/master/03-transactions.md).
