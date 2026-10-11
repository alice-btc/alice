---
type: "project_note"
id: "atomic-swap"
title: "Les échanges atomiques"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Ark et autres couches"]
aliases: ["Atomic Swap"]
parent_ids: []
related_ids: ["counterparty-risk", "bitcoin-layered-architecture", "secondary-addresses-hashlock", "secondary-bitcoin-adaptor-signature", "secondary-bitcoin-dlc", "secondary-lightning-submarine-swap"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/BlockstreamResearch/scriptless-scripts/blob/master/md/atomic-swap.md", "https://docs.lightning.engineering/the-lightning-network/multihop-payments/hash-time-lock-contract-htlc"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les échanges atomiques

## Questions couvertes

- Que signifie échanger sans qu’une partie puisse garder les 2 actifs ?

## Réponse courte

Un échange atomique lie les paiements de 2 parties pour permettre l’échange complet ou la récupération selon les conditions du protocole. Il réduit le besoin de confier simultanément les fonds à un intermédiaire.

## Explication

Les mécanismes peuvent utiliser des contrats fondés sur un secret et des délais, ou des signatures adaptatrices. Le choix dépend des primitives disponibles et de la compatibilité des systèmes. Les conditions organisent le règlement et les recours si une partie cesse de coopérer.

L’atomicité concerne la liaison entre les dépenses. Elle ne garantit pas que la contrepartie acceptera de commencer, que la liquidité sera disponible ou que l’expérience sera instantanée. Les participants doivent conserver leurs données et pouvoir agir sur les réseaux concernés dans les délais.

## Limites et confusions

Une tentative abandonnée peut immobiliser les fonds et coûter des frais, même si le principal reste récupérable. Un défaut d’implémentation ou une échéance mal choisie peut remettre en cause la sécurité attendue.

Les signatures adaptatrices ne sont pas un remplacement universel des autres mécanismes ni une preuve d’anonymat. Pour comparer un service concret, vérifier le protocole réellement utilisé, ses hypothèses et qui peut déclencher une récupération.

## Approfondissements

- [[counterparty-risk.fr|Le risque de contrepartie]] — distinguer réduction et disparition du risque
- [[bitcoin-layered-architecture.fr|Les couches de Bitcoin]] — situer les échanges entre systèmes

- [[secondary-addresses-hashlock.fr|Les conditions de dépense par secret]].
- [[secondary-bitcoin-adaptor-signature.fr|Les signatures adaptatrices]].
- [[secondary-bitcoin-dlc.fr|Les contrats DLC et leurs oracles]].
- [[secondary-lightning-submarine-swap.fr|Passer entre Bitcoin et Lightning par un swap]].

## Références

- [Blockstream Research — protocole de swap par signatures adaptatrices et hypothèses de compatibilité](https://github.com/BlockstreamResearch/scriptless-scripts/blob/master/md/atomic-swap.md).
- [Lightning Labs — HTLC, échéances et remboursement](https://docs.lightning.engineering/the-lightning-network/multihop-payments/hash-time-lock-contract-htlc).
