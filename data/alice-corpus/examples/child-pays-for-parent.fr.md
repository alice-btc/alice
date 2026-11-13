---
type: "project_note"
id: "child-pays-for-parent"
title: "Accélérer avec CPFP"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["CPFP", "Child Pays For Parent"]
parent_ids: []
related_ids: ["replace-by-fee", "transaction-fees", "bitcoin-mempool-policy"]
reviewed_at: "2026-11-06"
review_due: null
sources: ["https://github.com/bitcoin/bitcoin/blob/master/doc/policy/packages.md", "https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Accélérer avec CPFP

## Questions couvertes

- Qui peut utiliser CPFP pour aider une transaction non confirmée ?
- Quelle différence avec RBF ?

## Réponse courte

CPFP signifie « Child Pays For Parent ». Une transaction enfant dépense une sortie non confirmée de la transaction parent, avec des frais qui peuvent améliorer l’intérêt du paquet parent-enfant pour les mineurs.

## Explication

Un destinataire peut construire cet enfant s’il contrôle une sortie du parent et peut la dépenser. Il signe l’enfant avec ses propres clés ; il n’a pas besoin des clés de l’expéditeur. Un expéditeur peut aussi utiliser une sortie de monnaie rendue qu’il contrôle.

CPFP ne remplace pas le parent et ne nécessite pas que celui-ci signale RBF. Remplacer le parent par RBF nécessite au contraire les autorisations de dépense des entrées du remplacement.

Les mineurs évaluent le parent et l’enfant ensemble : le taux du paquet vaut (frais du parent + frais de l’enfant) ÷ (taille du parent + taille de l’enfant). Les frais de l’enfant doivent relever ce taux combiné ; ils paient donc aussi pour la taille du parent et ne peuvent pas dépasser la valeur de la sortie dépensée.

## Limites et confusions

Il faut que la sortie soit dépensable, que sa valeur couvre les frais, que le portefeuille permette cette dépense et que les politiques de relais et de minage acceptent les transactions ou le paquet. Le soutien aux paquets varie. Aucun délai ni inclusion ne sont garantis ; si le parent devient invalide, son enfant ne peut pas être confirmé tel quel.

## Approfondissements

- [[replace-by-fee.fr|Augmenter les frais avec RBF]].

## Références

- [Bitcoin Core, package relay](https://github.com/bitcoin/bitcoin/blob/master/doc/policy/packages.md).
- [BIP125, replacement policy](https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki).
