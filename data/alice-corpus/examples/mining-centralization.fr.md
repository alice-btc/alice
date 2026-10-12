---
type: "project_note"
id: "mining-centralization"
title: "La concentration du minage"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Minage et énergie"]
aliases: ["Mining Centralization"]
parent_ids: []
related_ids: ["mining-pool", "51-attack", "secondary-bitcoin-open-source-mining-hardware"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/mining.html"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La concentration du minage

## Questions couvertes

- Quels risques pose la concentration des mineurs ou des pools ?

## Réponse courte

La concentration du minage peut concerner les machines, les pools, les fabricants ou les lieux d’exploitation. Un seul pourcentage ne décrit pas toutes ces dépendances.

## Explication

Un pool peut sélectionner beaucoup de blocs sans posséder les machines qui calculent pour lui. Inversement, un propriétaire de matériel peut répartir ses machines entre plusieurs pools. Il faut donc distinguer la production physique du hashrate et le choix des transactions à inclure.

La concentration géographique expose des installations à des contraintes communes, comme l’électricité, une réglementation ou une interruption locale. La concentration industrielle crée d’autres dépendances, notamment pour acheter ou réparer les ASIC. Ces dimensions peuvent se renforcer, mais elles ne sont pas interchangeables.

## Limites et confusions

Disperser les machines réduit certains points de concentration. Cela ne garantit pas à chaque mineur le choix des transactions si son pool construit les blocs. L’effet du minage domestique sur la résistance à la censure dépend aussi de son poids réel et des juridictions concernées.

Il ne faut pas confondre ce pouvoir de production avec le pouvoir de changer seul les règles. Les nœuds continuent de vérifier la validité des blocs qu’ils reçoivent.

## Approfondissements

- [[mining-pool.fr|Les pools de minage]] — comprendre le rôle des opérateurs
- [[51-attack.fr|L’attaque majoritaire]] — délimiter les pouvoirs d’une majorité de hashrate

- [[secondary-bitcoin-open-source-mining-hardware.fr|Le matériel de minage ouvert]].

## Références

- [Guide développeur, minage en pool](https://developer.bitcoin.org/devguide/mining.html).
