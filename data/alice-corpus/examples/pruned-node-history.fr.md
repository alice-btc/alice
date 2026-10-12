---
type: "project_note"
id: "pruned-node-history"
title: "Élagage et accès à l’historique"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["nodes"]
aliases: ["pruning", "blocs élagués"]
parent_ids: ["bitcoin-node"]
related_ids: ["node-initial-sync"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://bitcoincore.org/en/releases/0.11.0/#block-file-pruning", "https://bitcoincore.org/en/doc/30.0.0/rpc/blockchain/getblockfrompeer/"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Élagage et accès à l’historique

## Questions couvertes

- Pourquoi mon nœud élagué ne retrouve-t-il pas un ancien bloc ?
- Élagué veut-il dire vérification incomplète ?

## Réponse courte

L’élagage réduit les fichiers de blocs conservés. Il ne transforme pas, à lui seul, un nœud de validation complète en client léger.

## Explication

Après avoir traité les blocs, le nœud conserve l’état nécessaire à la validation courante et peut supprimer des données anciennes. Une demande portant sur un bloc supprimé ne peut pas être servie depuis ce fichier local absent. Une opération historique peut donc nécessiter de récupérer à nouveau des données.

Il faut distinguer la consultation d’un bloc précis et une opération nécessitant une longue période d’historique. Bitcoin Core 30.0 documente `getblockfrompeer`, qui permet de demander un bloc à un pair connecté lorsque son en-tête est connu. Cela peut éviter de reprendre toute la chaîne pour cette seule consultation. La requête ne garantit pas que le pair fournira le bloc ; une réponse indiquant que la demande est planifiée n’est pas une confirmation de réception.

Une opération couvrant beaucoup de transactions anciennes peut nécessiter davantage de blocs, l’utilisation d’une autre source d’historique ou un retéléchargement plus large. L’étendue dépend du besoin, des données conservées et des capacités du logiciel. Il ne faut donc affirmer ni qu’un bloc isolé suffit toujours, ni que toute demande historique impose de retélécharger la chaîne entière.

## Limites et confusions

Les possibilités de récupération et d’indexation dépendent du logiciel et de sa version. La source historique citée documente le principe ; ses limites logicielles de 2015 ne sont pas présentées comme les capacités actuelles.

Selon la documentation Bitcoin Core 30.0, le bloc récupéré auprès d’un pair peut être élagué à nouveau dès sa réception. Cette récupération ne recrée pas les données d’annulation du bloc, ce qui limite les usages qui en dépendent. Récupérer un bloc ne transforme donc pas le nœud en nœud d’archive et ne reconstitue pas automatiquement tout l’historique nécessaire à une autre opération.

## Approfondissements

- [[node-initial-sync.fr|Comprendre la première synchronisation]] (node-initial-sync) pour distinguer la synchronisation initiale du stockage conservé.

## Références

- [Bitcoin Core 0.11.0, introduction historique de l’élagage](https://bitcoincore.org/en/releases/0.11.0/#block-file-pruning).
- [Bitcoin Core 30.0, récupération ciblée d’un bloc auprès d’un pair et limites](https://bitcoincore.org/en/doc/30.0.0/rpc/blockchain/getblockfrompeer/).
