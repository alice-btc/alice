---
type: "project_note"
id: "bitcoin-mining"
title: "Comprendre le minage"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["mining"]
aliases: ["minage", "mining"]
parent_ids: []
related_ids: ["mining-difficulty-details", "bitcoin-energy-debate", "mining-curtailed-energy", "mining-grid-flexibility", "mining-heat-reuse-details", "mining-methane-mitigation", "mining-renewable-projects", "secondary-bitcoin-stale-block", "secondary-bitcoin-validationless-mining"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/mining.html", "https://bitcoin.org/bitcoin.pdf", "https://developer.bitcoin.org/devguide/block_chain.html"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Comprendre le minage

## Questions couvertes

- À quoi sert le minage de Bitcoin ?
- Les mineurs décident-ils seuls des règles ?

## Réponse courte

Le minage ajoute des blocs à la chaîne et rend coûteuse la réécriture de l’historique. Les mineurs recherchent une preuve de travail ; chaque nœud vérifie que le bloc respecte ses règles. La subvention autorisée met aussi de nouveaux bitcoins en circulation.

## Explication

Les mineurs choisissent les transactions qu’ils proposent dans leurs blocs, généralement en tenant compte des frais. Ils peuvent retarder certaines transactions en les omettant de leurs propres blocs. Ils ne peuvent pas imposer aux autres nœuds un bloc que ceux-ci jugent invalide.

Le calcul consiste à chercher une empreinte de l’en-tête du bloc inférieure ou égale à une valeur cible. Trouver cette preuve demande de nombreux essais ; la vérifier est rapide. La transaction coinbase peut attribuer au mineur au plus la subvention autorisée et les frais des transactions incluses. Ces revenus incitent au minage ; ils ne remplacent pas le rôle de la preuve de travail dans la protection de l’historique.

## Limites et confusions

Une grande puissance de calcul ne permet pas de faire accepter automatiquement un bloc invalide. Le temps entre 2 blocs varie. Miner ne garantit ni revenu régulier ni bénéfice.

## Approfondissements

- [[bitcoin-energy-debate.fr|Bitcoin et énergie — comprendre les coûts et les usages utiles]] (bitcoin-energy-debate) pour explorer les sources d’électricité et les services énergétiques possibles.
- [[mining-difficulty-details.fr|L’ajustement de difficulté en détail]] (mining-difficulty-details) pour comprendre comment la cible évolue lorsque le hashrate change.

- [[mining-curtailed-energy.fr|Quand le minage valorise une énergie sans débouché]].
- [[mining-grid-flexibility.fr|Comment les mineurs peuvent aider à équilibrer un réseau électrique]].
- [[mining-heat-reuse-details.fr|Réutiliser la chaleur du minage pour chauffer]].
- [[mining-methane-mitigation.fr|Quand le minage peut financer une réduction des émissions de méthane]].
- [[mining-renewable-projects.fr|Comment le minage peut soutenir un projet renouvelable]].
- [[secondary-bitcoin-stale-block.fr|Les blocs valides non retenus]].
- [[secondary-bitcoin-validationless-mining.fr|Miner sans avoir validé le bloc précédent]].

## Références

- [Bitcoin Developer Guide, minage](https://developer.bitcoin.org/devguide/mining.html).

- [Livre blanc de Bitcoin, sections 4, 5 et 6](https://bitcoin.org/bitcoin.pdf).

- [Bitcoin Developer Guide, blocs et preuve de travail](https://developer.bitcoin.org/devguide/block_chain.html).
