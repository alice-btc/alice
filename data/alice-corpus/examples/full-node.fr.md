---
type: "project_note"
id: "full-node"
title: "La validation complète"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["nodes"]
aliases: ["Full Node"]
parent_ids: []
related_ids: ["pruned-node", "node-initial-sync", "wallet-node-connection", "secondary-bitcoin-validationless-mining"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/p2p_network.html", "https://bitcoincore.org/en/releases/0.11.0/#block-file-pruning"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La validation complète

## Questions couvertes

- Que vérifie un nœud complet ?

## Réponse courte

Un nœud complet vérifie les règles des blocs et des transactions, au lieu de déléguer cette validation à un serveur. Le stockage de tout l’historique est une question distincte.

## Explication

Le nœud contrôle notamment les dépenses, l’émission monétaire et la preuve de travail. Il entretient l’état nécessaire pour vérifier les nouveaux blocs. Un portefeuille connecté à ce nœud peut utiliser les informations qu’il a lui-même vérifiées.

Un nœud d’archive conserve les anciens blocs. Un nœud élagué peut supprimer certains fichiers après traitement tout en restant un nœud de validation complète. Le qualificatif « complet » ne doit donc pas être opposé automatiquement à « élagué ».

## Limites et confusions

Le démarrage et les optimisations de synchronisation demandent de préciser quelles vérifications sont effectuées et à quel moment. Un nœud ne protège pas contre le vol des clés d’un portefeuille ni contre une adresse malveillante approuvée. Il faut réellement relier le portefeuille au nœud pour bénéficier de ses données ; le simple fait d’en faire tourner un ailleurs ne suffit pas.

## Approfondissements

- [[pruned-node.fr|Le nœud élagué]].
- [[node-initial-sync.fr|Comprendre la première synchronisation]].
- [[wallet-node-connection.fr|Relier un portefeuille à son nœud]].

- [[secondary-bitcoin-validationless-mining.fr|Miner sans avoir validé le bloc précédent]].

## Références

- [Référence publique conservée de la note source](https://developer.bitcoin.org/devguide/p2p_network.html).
- [Référence publique conservée de la note source](https://bitcoincore.org/en/releases/0.11.0/#block-file-pruning).
