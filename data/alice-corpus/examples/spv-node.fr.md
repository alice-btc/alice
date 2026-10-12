---
type: "project_note"
id: "spv-node"
title: "La vérification légère"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["nodes"]
aliases: ["SPV Node"]
parent_ids: []
related_ids: ["full-node", "pruned-node", "wallet-node-connection", "secondary-bitcoin-compact-block-filters", "secondary-bitcoin-merkle-proof"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://bitcoin.org/bitcoin.pdf", "https://developer.bitcoin.org/devguide/operating_modes.html"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La vérification légère

## Questions couvertes

- Que vérifie un client léger ?

## Réponse courte

Un client SPV effectue une vérification légère à partir des en-têtes de blocs et de preuves d’inclusion. Il ne vérifie pas toutes les transactions et toutes les règles comme un nœud complet.

## Explication

Le client peut contrôler le travail représenté par les en-têtes et une preuve reliant une transaction à un bloc. Il compare les chaînes qu’il connaît selon leur travail cumulé. Cela réduit les ressources nécessaires par rapport au traitement de tous les blocs.

La preuve montre une inclusion dans le bloc concerné. Elle ne démontre pas à elle seule que chaque dépense et chaque règle monétaire de tout cet historique ont été vérifiées par le client.

## Limites et confusions

La vue du client dépend des pairs ou serveurs auxquels il accède. Il faut distinguer moins de données téléchargées et mêmes garanties de validation. Les effets de confidentialité dépendent aussi de la manière dont les transactions sont demandées. Un nœud élagué n’est pas un client SPV ; il peut conserver moins d’historique tout en effectuant la validation complète.

## Approfondissements

- [[full-node.fr|La validation complète]].
- [[pruned-node.fr|Le nœud élagué]].
- [[wallet-node-connection.fr|Relier un portefeuille à son nœud]].

- [[secondary-bitcoin-compact-block-filters.fr|Les filtres compacts de blocs]].
- [[secondary-bitcoin-merkle-proof.fr|Les preuves de Merkle]].

## Références

- [Référence publique conservée de la note source](https://bitcoin.org/bitcoin.pdf).
- [Référence publique conservée de la note source](https://developer.bitcoin.org/devguide/operating_modes.html).
