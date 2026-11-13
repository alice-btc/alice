---
type: "project_note"
id: "miner-transaction-selection"
title: "Comment les mineurs choisissent les transactions"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Sélection des transactions", "Transaction selection", "Block template", "Taux de frais des mineurs"]
parent_ids: []
related_ids: ["transaction-fees", "bitcoin-mempool", "bitcoin-mempool-policy", "child-pays-for-parent", "replace-by-fee"]
reviewed_at: "2026-11-13"
review_due: null
sources: ["https://github.com/bitcoin/bitcoin/blob/master/src/consensus/consensus.h", "https://github.com/bitcoin/bitcoin/blob/master/src/node/miner.cpp", "https://github.com/bitcoin/bitcoin/blob/master/src/kernel/mempool_options.h"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Comment les mineurs choisissent les transactions

## Questions couvertes

- Comment un mineur choisit-il les transactions qu'il met dans son bloc ?
- Pourquoi les mineurs prennent-ils en priorité les transactions avec des frais élevés ?
- Que devient une transaction qui paie beaucoup moins que les autres ?
- Les mineurs trient-ils par montant envoyé ?

## Réponse courte

La place dans un bloc est limitée. Pour maximiser leurs revenus, les mineurs retiennent en général les transactions qui paient le meilleur taux de frais, en sat par octet virtuel (sat/vB), et non celles qui envoient le plus gros montant.

## Explication

Un bloc ne peut pas dépasser 4 000 000 unités de poids, soit environ 1 000 000 d'octets virtuels. Le mineur construit son modèle de bloc à partir des transactions en attente qu'il connaît et privilégie celles qui rapportent le plus par octet virtuel occupé.

Des transactions liées sont évaluées ensemble : un enfant qui paie des frais élevés peut faire entrer son parent peu payé dans le bloc, c'est le principe de CPFP. Le logiciel Bitcoin Core regroupe ainsi les transactions dépendantes avant de les classer par taux de frais.

Une transaction qui paie bien moins que les autres attend tant que des transactions mieux payées remplissent les blocs. Elle peut être confirmée quand la demande baisse, ou être oubliée par les nœuds si elle attend trop longtemps (2 semaines par défaut dans Bitcoin Core) ou si leur mémoire sature. Selon le portefeuille, on peut l'accélérer par RBF ou CPFP.

## Limites et confusions

Ce tri est une stratégie économique et une politique du logiciel du mineur, pas une règle de consensus : un mineur peut inclure ou exclure ce qu'il veut tant que le bloc est valide. Le montant envoyé n'influence pas les frais ; c'est la taille de la transaction et son taux qui comptent. Aucun taux ne garantit une confirmation dans un délai précis.

## Approfondissements

- [[transaction-fees.fr|Les frais de transaction]].
- [[bitcoin-mempool.fr|Le mempool]].
- [[child-pays-for-parent.fr|Accélérer avec CPFP]].

## Références

- https://github.com/bitcoin/bitcoin/blob/master/src/consensus/consensus.h.
- https://github.com/bitcoin/bitcoin/blob/master/src/node/miner.cpp.
- https://github.com/bitcoin/bitcoin/blob/master/src/kernel/mempool_options.h.
