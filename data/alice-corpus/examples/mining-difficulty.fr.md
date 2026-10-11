---
type: "project_note"
id: "mining-difficulty"
title: "La difficulté de minage"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["mining"]
aliases: ["Mining Difficulty"]
parent_ids: []
related_ids: ["hashrate", "difficulty-adjustment", "mining-difficulty-details"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bitcoin/blob/v28.0/src/pow.cpp"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La difficulté de minage

## Questions couvertes

- Que signifie une hausse de difficulté ?

## Réponse courte

La difficulté exprime à quel point il est exigeant de trouver une preuve de travail par rapport à une référence. Une hausse signifie qu’il faut en moyenne davantage d’essais pour produire un bloc.

## Explication

Les mineurs cherchent un hash inférieur ou égal à une cible. Une cible plus basse rend la condition plus difficile à satisfaire. Cela ne transforme pas l’essai individuel en calcul plus complexe ; cela réduit la proportion de résultats acceptables.

Sur le réseau principal, la difficulté est ajustée tous les 2 016 blocs afin de viser une moyenne d’environ 10 minutes. Le mécanisme réagit au rythme observé, notamment quand la puissance de calcul change.

## Limites et confusions

La difficulté n’est pas le hashrate, même si les 2 sont liés. Elle ne garantit pas un bloc exactement toutes les 10 minutes et ne mesure pas à elle seule la rentabilité d’un mineur. Les limites d’ajustement et la mesure de 2 015 intervalles demandent un niveau de détail supplémentaire, conservé dans la fiche secondaire.

## Approfondissements

- [[hashrate.fr|La puissance de calcul]].
- [[difficulty-adjustment.fr|L’ajustement de difficulté]].
- [[mining-difficulty-details.fr|L’ajustement de difficulté en détail]].

## Références

- [Référence publique conservée de la note source](https://github.com/bitcoin/bitcoin/blob/v28.0/src/pow.cpp).
