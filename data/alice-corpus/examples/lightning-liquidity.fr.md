---
type: "project_note"
id: "lightning-liquidity"
title: "La liquidité d’un canal"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Lightning Liquidity"]
parent_ids: []
related_ids: ["lightning-liquidity-path", "inbound-liquidity", "outbound-liquidity", "lightning-splicing", "secondary-bitcoin-dual-funded-channels", "secondary-lightning-submarine-swap"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB lnp201 — Lightning Network Theory"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La liquidité d’un canal

## Questions couvertes

- Pourquoi avoir un solde ne suffit-il pas toujours pour payer ou recevoir ?

## Réponse courte

La liquidité Lightning est la capacité effective d’envoyer ou de recevoir. Elle dépend de la répartition des fonds dans les canaux et de la présence d’un chemin utilisable jusqu’au destinataire.

## Explication

Une capacité totale importante ne suffit pas. Pour envoyer, il faut des fonds utilisables du côté local ; pour recevoir, des fonds doivent pouvoir venir du côté distant. Un paiement modifie cette répartition.

Le routage ajoute une autre condition. Chaque segment du chemin doit laisser passer le montant demandé, dans le bon sens. Le portefeuille peut chercher une autre route ou diviser un paiement si les logiciels le permettent. Des canaux entrants, des swaps ou des rééquilibrages peuvent aider à gérer ces contraintes, avec leurs propres coûts et conditions.

## Limites et confusions

La part qui vous revient dans un canal, le montant envoyable et le solde affiché par un wallet ne sont pas forcément le même indicateur. Des réserves et des paiements en cours peuvent réduire la disponibilité immédiate sans retirer la propriété de ces fonds.

Dans un portefeuille custodial, l’opérateur masque souvent cette gestion. L’utilisateur voit alors une créance sur le service, ce qui change le modèle de garde.

## Approfondissements

- [[lightning-liquidity-path.fr|Liquidité et chemins de paiement Lightning]] — Liquidité et chemins — distinguer réserves, solde et capacité
- [[inbound-liquidity.fr|La capacité de réception]] — comprendre la réception
- [[outbound-liquidity.fr|La capacité d’envoi]] — comprendre l’envoi

- [[lightning-splicing.fr|Modifier les fonds d’un canal avec le splicing]].
- [[secondary-bitcoin-dual-funded-channels.fr|Les canaux financés par les 2 participants]].
- [[secondary-lightning-submarine-swap.fr|Passer entre Bitcoin et Lightning par un swap]].

## Références

- PlanB lnp201 — Lightning Network Theory (référence de la note source, non reconsultée directement pour cette adaptation).
