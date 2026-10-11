---
type: "project_note"
id: "merkle-tree"
title: "Les arbres de Merkle"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Cryptographie et limites du protocole"]
aliases: ["Merkle Tree"]
parent_ids: []
related_ids: ["cryptographic-hash-function", "bitcoin-node", "secondary-addresses-mast", "secondary-bitcoin-collision-resistance", "secondary-bitcoin-merkle-proof"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB min101 — Introduction to Bitcoin mining"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les arbres de Merkle

## Questions couvertes

- Comment résumer les transactions d’un bloc ?

## Réponse courte

Un arbre de Merkle combine des empreintes pour résumer un ensemble de données dans une racine. Dans Bitcoin, cette structure permet notamment de prouver l’inclusion d’une transaction dans un bloc.

## Explication

Les empreintes de transactions sont combinées progressivement jusqu’à obtenir une empreinte racine engagée dans l’en-tête du bloc. Pour vérifier l’inclusion d’une transaction, une preuve fournit les empreintes nécessaires le long du chemin. Il n’est pas nécessaire de transmettre toutes les autres transactions pour cette vérification précise.

Cette construction rend possible une preuve compacte liée au contenu du bloc. Si une donnée change, les valeurs calculées sur le chemin ne correspondent plus à la racine attendue, sous les hypothèses de sécurité du hachage.

## Limites et confusions

Une preuve d’inclusion ne prouve pas à elle seule que toutes les règles du bloc ont été correctement appliquées. Elle ne démontre pas non plus que la sortie est encore non dépensée ni que le bloc restera dans la chaîne suivie.

Les clients légers et les nœuds complets n’effectuent donc pas nécessairement les mêmes vérifications. L’arbre de Merkle est une brique utile, pas un substitut universel à la validation des transactions et au suivi de l’historique.

## Approfondissements

- [[cryptographic-hash-function.fr|L’empreinte cryptographique]] — comprendre l’empreinte utilisée
- [[bitcoin-node.fr|Le rôle d’un nœud Bitcoin]] — distinguer inclusion et validation complète

- [[secondary-addresses-mast.fr|Les arbres de conditions de dépense]].
- [[secondary-bitcoin-collision-resistance.fr|La résistance aux collisions]].
- [[secondary-bitcoin-merkle-proof.fr|Les preuves de Merkle]].

## Références

- PlanB min101 — Introduction to Bitcoin mining (référence de la note source, non reconsultée directement pour cette adaptation).
