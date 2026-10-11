---
type: "project_note"
id: "lightning-splicing"
title: "Modifier les fonds d’un canal avec le splicing"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["splicing", "splice-in", "splice-out"]
parent_ids: ["lightning-channel", "lightning-liquidity", "lightning-network"]
related_ids: ["lightning-liquidity-path"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://docs.corelightning.org/reference/splice_init", "https://github.com/ACINQ/eclair/blob/master/docs/release-notes/eclair-v0.14.0.md", "https://docs.corelightning.org/reference/lightningd-config"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Modifier les fonds d’un canal avec le splicing

## Questions couvertes

- Comment augmenter la capacité d’un canal sans le fermer complètement ?
- Quelle différence entre splice-in et splice-out ?
- Recevoir un paiement Bitcoin suffit-il à alimenter un canal ?
- Le splicing résout-il tous les problèmes de liquidité ?

## Réponse courte

Le splicing modifie les fonds d’un canal Lightning existant à l’aide d’une transaction Bitcoin coordonnée avec son partenaire. Un splice-in ajoute des fonds ; un splice-out en retire vers une sortie on-chain. Les logiciels des participants doivent prendre en charge une version compatible du mécanisme.

## Explication

Une transaction de splicing remplace le financement du canal. Elle permet de modifier sa capacité sans effectuer une fermeture complète suivie d’une nouvelle ouverture. Elle exige des frais on-chain et une coordination entre les participants.

Lorsque tu apportes tes propres fonds par un splice-in, tu augmentes ta liquidité locale, donc ta capacité à envoyer une fois ces fonds utilisables. Cela n’ajoute pas automatiquement des fonds du côté de ton partenaire et ne garantit pas que tu pourras recevoir davantage.

Un paiement Bitcoin reçu dans ton portefeuille on-chain peut fournir des fonds pour un splice-in. Sa simple réception ne modifie pas automatiquement le canal. Certains portefeuilles peuvent organiser cette opération pour l’utilisateur ; ce comportement dépend du produit.

Un splice-out permet de transférer une partie des fonds du canal vers une adresse Bitcoin. Il réduit les fonds laissés dans le canal et peut modifier sa capacité utile.

## Limites et confusions

- La capacité totale et la liquidité disponible dans chaque sens restent 2 notions différentes.
- Le splicing ne garantit pas la liquidité des autres canaux d’un chemin de paiement.
- Les frais, les confirmations et le comportement pendant la transition dépendent du logiciel et de la configuration. La documentation Eclair 0.14.0 décrit l’utilisation des fonds ajoutés après confirmation. La documentation Core Lightning décrit aussi des limites de solde utilisable pendant l’attente ; il ne faut pas promettre un montant immédiatement disponible partout.
- Les anciens prototypes et les versions normalisées ne sont pas nécessairement compatibles. Vérifier les versions des 2 participants.
- Cette fiche explique le mécanisme. Elle ne constate pas son activation dans Alice ni dans le nœud personnel de l’utilisateur.

## Approfondissements

- [[lightning-liquidity-path.fr|Liquidité et chemins de paiement Lightning]] (lightning-liquidity-path) pour comprendre pourquoi augmenter 1 canal ne garantit pas un chemin utilisable.
- [[lightning-network.fr|Comprendre Lightning]] (lightning-network) pour revenir à l’introduction générale.

## Références

- [Core Lightning, initiation d’un splice](https://docs.corelightning.org/reference/splice_init) pour l’ajout ou le retrait de fonds, les frais et les conditions de support du pair.
- [Eclair 0.14.0, notes de version](https://github.com/ACINQ/eclair/blob/master/docs/release-notes/eclair-v0.14.0.md) pour splice-in, splice-out, confirmations et compatibilité avec les anciens prototypes.
- [Core Lightning, configuration](https://docs.corelightning.org/reference/lightningd-config) pour les limites pendant la transition. La section historique experimental-splicing est indiquée comme obsolète à partir de 26.04 ; elle ne doit pas devenir une consigne d’activation actuelle.
