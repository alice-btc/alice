---
type: "project_note"
id: "lightning-channel"
title: "Les canaux Lightning"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Lightning Channel"]
parent_ids: []
related_ids: ["lightning-liquidity-path", "lightning-splicing", "secondary-bitcoin-dual-funded-channels", "secondary-lightning-commitment-transaction", "secondary-lightning-lightning-private-channel", "secondary-lightning-lightning-public-channel", "secondary-lightning-revocation-key"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/lightning/bolts/blob/master/02-peer-protocol.md"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les canaux Lightning

## Questions couvertes

- Qu’est-ce qu’un canal de paiement ?

## Réponse courte

Un canal Lightning permet à 2 nœuds d’échanger des paiements en mettant à jour la répartition de bitcoins engagés sur la chaîne. Chaque paiement ne demande pas une nouvelle transaction Bitcoin publique.

## Explication

La capacité totale représente les fonds engagés dans le canal. À un instant donné, une part revient à chaque participant. Un paiement déplace cette répartition et de nouveaux engagements signés remplacent les précédents. À la fermeture, le règlement revient sur la chaîne Bitcoin.

Le montant envoyable n’est pas simplement la capacité totale. Il dépend du côté où se trouvent les fonds, des réserves et des paiements en cours. Une succession de paiements dans les 2 sens peut faire circuler un volume cumulé bien supérieur à la capacité initiale. Un canal sert aussi de segment pour acheminer des paiements vers d’autres nœuds.

## Limites et confusions

Une réserve reste dans la part de son propriétaire mais peut limiter l’envoi tant que le canal est ouvert. Elle n’est pas un montant confisqué. Le libellé « solde » affiché dépend du logiciel.

Les confirmations d’ouverture, les frais et les conditions de fermeture restent importants. Ajouter des fonds par splicing, quand le logiciel le permet, exige une opération coordonnée ; un paiement on-chain quelconque ne suffit pas.

## Approfondissements

- [[lightning-liquidity-path.fr|Liquidité et chemins de paiement Lightning]] — Liquidité et chemins — approfondir les contraintes
- [[lightning-splicing.fr|Modifier les fonds d’un canal avec le splicing]] — Splicing — modifier la capacité du canal

- [[secondary-bitcoin-dual-funded-channels.fr|Les canaux financés par les 2 participants]].
- [[secondary-lightning-commitment-transaction.fr|Les transactions d’engagement Lightning]].
- [[secondary-lightning-lightning-private-channel.fr|Les canaux Lightning non annoncés]].
- [[secondary-lightning-lightning-public-channel.fr|Les canaux Lightning annoncés]].
- [[secondary-lightning-revocation-key.fr|Réagir à un état de canal révoqué]].

## Références

- [Référence de vérification 1](https://github.com/lightning/bolts/blob/master/02-peer-protocol.md).
