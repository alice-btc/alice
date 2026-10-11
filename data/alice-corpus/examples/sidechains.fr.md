---
type: "project_note"
id: "sidechains"
title: "Les chaînes latérales"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Ark et autres couches"]
aliases: ["Sidechains"]
parent_ids: []
related_ids: ["liquid-network", "bitcoin-layered-architecture", "secondary-bitcoin-merged-mining"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://docs.liquid.net/docs/technical-overview"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les chaînes latérales

## Questions couvertes

- Qu’est-ce qu’une sidechain ?

## Réponse courte

Une sidechain est une chaîne distincte reliée à Bitcoin par un mécanisme d’ancrage ou de conversion. Elle possède ses propres règles et ne conserve pas automatiquement toutes les garanties de Bitcoin.

## Explication

Pour un actif adossé au BTC, un mécanisme de peg organise généralement le verrouillage de bitcoins et la représentation de leur quantité sur la chaîne séparée. Le trajet inverse doit permettre la restitution selon les conditions du système. La sécurité dépend donc à la fois de la sidechain et de ce passage.

Une fédération peut participer à la production des blocs ou au contrôle des fonds. D’autres architectures proposent des mécanismes différents. Les fonctions ajoutées, comme des actifs ou certaines formes de confidentialité, doivent être évaluées avec ces hypothèses supplémentaires.

## Limites et confusions

Un objectif d’adossement 1:1 ne garantit ni un cours égal en permanence ni un retrait immédiat. Il faut examiner les réserves, les acteurs autorisés et les possibilités d’interruption. Tous les actifs émis sur une sidechain ne sont pas adossés au bitcoin.

L’existence d’une proposition technique ou d’un BIP ne démontre pas son adoption par le réseau. Une sidechain, un canal Lightning et un service custodial ne doivent pas être présentés comme équivalents.

## Approfondissements

- [[liquid-network.fr|Comprendre Liquid]] — étudier une sidechain fédérée
- [[bitcoin-layered-architecture.fr|Les couches de Bitcoin]] — comparer avec les autres architectures

- [[secondary-bitcoin-merged-mining.fr|Le minage fusionné]].

## Références

- [Liquid, présentation technique](https://docs.liquid.net/docs/technical-overview).
