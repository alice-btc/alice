---
type: "project_note"
id: "soft-fork"
title: "Les soft forks"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Histoire et évolution du protocole"]
aliases: ["Soft Fork"]
parent_ids: []
related_ids: ["hard-fork", "bitcoin-improvement-proposal", "secondary-bitcoin-bitcoin-covenants", "secondary-governance-taproot-activation"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/block_chain.html#consensus-rule-changes", "https://github.com/bitcoin/bips/blob/master/bip-0009.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0008.mediawiki"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les soft forks

## Questions couvertes

- Qu’est-ce qu’un soft fork ?

## Réponse courte

Un soft fork resserre les règles de validité. Les blocs conformes aux nouvelles restrictions restent acceptables selon les anciennes règles, mais les anciens nœuds ne vérifient pas eux-mêmes ces restrictions supplémentaires.

## Explication

On peut le comprendre comme une réduction de l’ensemble des blocs autorisés. Un nœud mis à jour peut rejeter un bloc qu’un ancien nœud jugerait encore valide. C’est la raison pour laquelle la compatibilité doit être décrite par le comportement des nœuds, plutôt que par une promesse vague de mise à jour sans risque.

L’activation demande une coordination et un mécanisme définis. Certains dispositifs utilisent un signalement des mineurs, mais ce signalement ne met pas automatiquement tous les utilisateurs à jour et ne constitue pas l’unique voie possible.

## Limites et confusions

La compatibilité n’empêche pas toute scission si les restrictions ne sont pas appliquées de manière cohérente. Un ancien nœud peut suivre des blocs sans vérifier toutes les nouvelles conditions.

Une proposition de soft fork n’est pas une activation. Il faut distinguer le texte, le code qui implémente la règle, les paramètres de déploiement et ce qui est effectivement appliqué sur le réseau. Le terme ne garantit pas non plus qu’une modification soit souhaitable.

## Approfondissements

- [[hard-fork.fr|Les hard forks]] — comparer le comportement des anciens nœuds
- [[bitcoin-improvement-proposal.fr|Les propositions BIP]] — séparer proposition et déploiement

- [[secondary-bitcoin-bitcoin-covenants.fr|Les restrictions de dépenses futures]].
- [[secondary-governance-taproot-activation.fr|L’activation de Taproot en 2021]].

## Références

- [Bitcoin Developer Guide — changements de consensus et risques de fork](https://developer.bitcoin.org/devguide/block_chain.html#consensus-rule-changes).
- [BIP9 — activation par version bits](https://github.com/bitcoin/bips/blob/master/bip-0009.mediawiki).
- [BIP8 — activation et signalement obligatoires selon les paramètres](https://github.com/bitcoin/bips/blob/master/bip-0008.mediawiki).
