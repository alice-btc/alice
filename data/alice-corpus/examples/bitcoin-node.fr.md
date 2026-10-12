---
type: "project_note"
id: "bitcoin-node"
title: "Le rôle d’un nœud Bitcoin"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["nodes"]
aliases: ["nœud Bitcoin", "node"]
parent_ids: []
related_ids: ["pruned-node-history", "node-initial-sync", "secondary-bitcoin-eclipse-attack", "secondary-nodes-node-in-a-box"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/operating_modes.html", "https://developer.bitcoin.org/devguide/p2p_network.html", "https://bitcoincore.org/en/releases/0.11.0/#block-file-pruning"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Le rôle d’un nœud Bitcoin

## Questions couvertes

- À quoi sert un nœud si je ne mine pas ?
- Un nœud complet doit-il conserver tous les blocs ?

## Réponse courte

Un nœud de validation vérifie les blocs et les transactions selon les règles qu’il applique. Il permet de contrôler les données reçues au lieu de dépendre uniquement du résultat fourni par un service.

## Explication

Miner et vérifier sont 2 fonctions différentes. Un nœud peut vérifier sans participer au minage. La validation complète n’impose pas de conserver éternellement les anciens fichiers de blocs : un nœud élagué peut les supprimer après traitement.

## Limites et confusions

Faire tourner un nœud ne signifie pas que toutes les applications l’utilisent. Leur connexion doit être configurée. Un nœud ne remplace pas la sauvegarde des clés.

## Approfondissements

- [[pruned-node-history.fr|Élagage et accès à l’historique]] (pruned-node-history) pour distinguer validation et disponibilité des données anciennes.
- [[node-initial-sync.fr|Comprendre la première synchronisation]] (node-initial-sync) pour comprendre le travail de synchronisation.

- [[secondary-bitcoin-eclipse-attack.fr|L’isolement d’un nœud par attaque eclipse]].
- [[secondary-nodes-node-in-a-box.fr|Les solutions de nœud prêtes à installer]].

## Références

- [Bitcoin Developer Guide, modes de vérification](https://developer.bitcoin.org/devguide/operating_modes.html).
- [Bitcoin Developer Guide, réseau P2P et nœuds élagués](https://developer.bitcoin.org/devguide/p2p_network.html).
- [Bitcoin Core 0.11.0, introduction historique de l’élagage](https://bitcoincore.org/en/releases/0.11.0/#block-file-pruning).
