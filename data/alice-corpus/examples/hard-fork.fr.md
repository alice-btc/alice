---
type: "project_note"
id: "hard-fork"
title: "Les hard forks"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Histoire et évolution du protocole"]
aliases: ["Hard Fork"]
parent_ids: []
related_ids: ["soft-fork", "bitcoin-governance", "secondary-governance-chain-split-risk"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/block_chain.html#consensus-rule-changes", "https://github.com/bitcoin/bips/blob/master/bip-0099.mediawiki"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les hard forks

## Questions couvertes

- Qu’est-ce qu’un hard fork ?

## Réponse courte

Un hard fork introduit des règles qui autorisent certains blocs rejetés par les anciennes règles. Les nœuds non mis à jour refusent ces blocs lorsqu’ils les rencontrent.

## Explication

La différence porte sur la validité, pas simplement sur la version affichée par un logiciel. Si des participants maintiennent des règles incompatibles et produisent des chaînes correspondantes, une séparation durable devient possible. L’acceptation de chaque chaîne dépend ensuite de ses utilisateurs et de ses acteurs économiques.

La coordination doit donc préciser ce qui change, quand les nouvelles règles s’appliquent et comment les participants choisissent leur logiciel. Le travail accumulé ne rend pas valide, pour un nœud, un bloc qui enfreint ses règles.

## Limites et confusions

Publier une copie modifiée du code n’est pas à lui seul un hard fork du réseau. Une scission durable ne se crée pas automatiquement à chaque mise à jour ni à chaque branche de développement.

« Soft » et « hard » décrivent une relation de compatibilité, pas un classement moral ou une garantie de sécurité. Pour comprendre une controverse, il faut examiner les nouvelles règles et leurs conséquences concrètes plutôt que déduire la qualité de la proposition de son étiquette.

## Approfondissements

- [[soft-fork.fr|Les soft forks]] — comparer avec un resserrement des règles
- [[bitcoin-governance.fr|L’évolution des règles]] — comprendre la coordination des participants

- [[secondary-governance-chain-split-risk.fr|Le risque de divergence entre chaînes]].

## Références

- [Bitcoin Developer Guide — incompatibilité et scission possible](https://developer.bitcoin.org/devguide/block_chain.html#consensus-rule-changes).
- [BIP99 — motivation et déploiement des changements de consensus](https://github.com/bitcoin/bips/blob/master/bip-0099.mediawiki).
