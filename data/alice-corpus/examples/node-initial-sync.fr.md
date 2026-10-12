---
type: "project_note"
id: "node-initial-sync"
title: "Comprendre la première synchronisation"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["nodes"]
aliases: ["IBD", "initial block download"]
parent_ids: ["bitcoin-node"]
related_ids: ["pruned-node-history"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/p2p_network.html", "https://bitcoincore.org/en/releases/0.14.0/", "https://bitcoincore.org/en/releases/28.0/", "https://github.com/bitcoin/bitcoin/blob/v28.0/doc/design/assumeutxo.md"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Comprendre la première synchronisation

## Questions couvertes

- Pourquoi une première synchronisation est-elle longue ?
- Pourquoi l’élagage ne supprime-t-il pas tout le travail initial ?

## Réponse courte

La première synchronisation construit l’état de chaîne dont le nœud a besoin à partir des données du réseau. Elle implique du téléchargement et du traitement local.

## Explication

La durée dépend du processeur, du disque, de la connexion, de la mémoire disponible et de la configuration du cache. Un cache plus grand peut réduire les accès au disque pendant la validation, dans les limites de la mémoire réellement disponible. Réduire la conservation des anciens blocs n’annule pas automatiquement leur traitement. Les mécanismes de démarrage optimisé doivent être distingués du parcours classique et évalués selon leurs hypothèses.

Bitcoin Core propose notamment 2 mécanismes distincts.

- `assumevalid` permet, sous certaines conditions, de ne pas refaire la vérification des scripts et signatures de blocs anciens précédant un bloc de référence considéré valide. Les blocs sont toujours téléchargés et les autres règles restent vérifiées. Ce mécanisme réduit du travail de calcul ; il ne remplace pas l’historique par un état téléchargé. Il peut être désactivé pour vérifier aussi ces scripts.
- AssumeUTXO permet de charger un instantané de l’ensemble des UTXO à une hauteur reconnue par le logiciel. Son empreinte doit correspondre à celle inscrite dans Bitcoin Core. Le nœud peut alors rejoindre la pointe de la chaîne depuis cet état pendant qu’une autre synchronisation traite l’historique en arrière-plan. L’état reconstruit est comparé à l’état attendu une fois cette vérification historique terminée. Bitcoin Core 28.0 documente cette possibilité sur mainnet à la hauteur 840 000.

## Limites et confusions

Aucune durée universelle n’est garantie. Un pourcentage d’avancement ne prédit pas toujours un temps restant constant. Cette fiche n’affirme pas que toutes les configurations exécutent exactement les mêmes vérifications historiques.

Avec AssumeUTXO, disponibilité plus rapide et vérification historique terminée sont 2 étapes distinctes. Le travail historique n’est pas supprimé. Le téléchargement des blocs, les index et l’espace disque temporaire restent des contraintes ; un instantané ne fournit pas à lui seul l’historique des transactions d’un wallet. Ces descriptions concernent les mécanismes documentés dans Bitcoin Core, sans affirmer qu’Alice les configure ou les utilise.

## Approfondissements

- [[pruned-node-history.fr|Élagage et accès à l’historique]] (pruned-node-history) pour comprendre ce qui reste stocké après traitement.

## Références

- [Bitcoin Developer Guide, réseau et synchronisation](https://developer.bitcoin.org/devguide/p2p_network.html).
- [Bitcoin Core 0.14.0, introduction d’`assumevalid`](https://bitcoincore.org/en/releases/0.14.0/#introduction-of-assumed-valid-blocks).
- [Bitcoin Core 28.0, prise en charge d’AssumeUTXO sur mainnet](https://bitcoincore.org/en/releases/28.0/).
- [Bitcoin Core 28.0, fonctionnement et limites d’AssumeUTXO](https://github.com/bitcoin/bitcoin/blob/v28.0/doc/design/assumeutxo.md).
