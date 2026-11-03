---
type: "project_note"
id: "pruned-node"
title: "Le nœud élagué"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["nodes"]
aliases: ["Pruned Node", "prune", "espace disque d’un nœud"]
parent_ids: []
related_ids: ["full-node", "pruned-node-history", "node-initial-sync"]
reviewed_at: "2026-11-02"
review_due: null
sources: ["https://bitcoincore.org/en/releases/0.11.0/#block-file-pruning", "https://ycharts.com/indicators/bitcoin_blockchain_size", "PlanB btc202 — Setting up your first Bitcoin node", "PlanB Extraction — 2026-05-23 — lnp404"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Le nœud élagué

## Questions couvertes

- Peut-on vérifier Bitcoin sans stocker tous les anciens blocs ?
- Combien d’espace disque faut-il pour un nœud élagué ?

## Réponse courte

Un nœud élagué télécharge et vérifie toute la chaîne comme un nœud complet, puis supprime les anciens fichiers de blocs pour tenir dans quelques dizaines de Go au plus. Il conserve l’état nécessaire à la validation des nouveaux blocs et ne fait confiance à aucun serveur.

## Explication

L’élagage n’est pas activé par défaut dans Bitcoin Core : il se demande par le réglage `prune`, exprimé en Mio, avec un minimum de 550 pour conserver au moins les derniers blocs. Une fois activé, le nœud efface les fichiers de blocs les plus anciens à mesure que la cible est dépassée.

La première synchronisation reste entière : le nœud télécharge chaque bloc depuis la genèse, le valide, met à jour l’ensemble des sorties non dépensées, puis seulement jette le fichier. Le temps de synchronisation et le trafic réseau sont ceux d’un nœud complet ; seul l’espace disque final change. La chaîne complète pesait environ 760 Go à l’été 2026 et grossit de plusieurs dizaines de Go par an. Un nœud élagué n’en garde que la cible choisie, plus l’ensemble des sorties non dépensées et ses index, soit une quinzaine de Go environ avec la cible minimale. Un portable avec 100 Go libres suffit largement.

## Limites et confusions

Élagué ne signifie pas SPV : la validation est la même. La récupération d’un ancien bloc dépend des pairs, du logiciel et de leur disponibilité. Selon l’opération, un bloc précis peut suffire ou davantage d’historique peut être nécessaire. Un nœud élagué ne peut pas servir l’historique complet à d’autres nœuds ni à un explorateur, et l’import d’un portefeuille ancien peut demander de retélécharger des blocs. La taille de la chaîne citée est un ordre de grandeur daté, pas une valeur courante.

## Approfondissements

- [[full-node.fr|La validation complète]].
- [[pruned-node-history.fr|Élagage et accès à l’historique]].
- [[node-initial-sync.fr|Comprendre la première synchronisation]].

## Références

- [Bitcoin Core 0.11.0, introduction de l’élagage des fichiers de blocs](https://bitcoincore.org/en/releases/0.11.0/#block-file-pruning).
- [Taille de la chaîne Bitcoin, série quotidienne](https://ycharts.com/indicators/bitcoin_blockchain_size).
- PlanB btc202 — Setting up your first Bitcoin node.
- PlanB Extraction — 2026-05-23 — lnp404.
