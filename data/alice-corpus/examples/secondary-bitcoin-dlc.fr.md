---
type: "project_note"
id: "secondary-bitcoin-dlc"
title: "Les contrats DLC et leurs oracles"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["DLC"]
parent_ids: ["atomic-swap", "bitcoin-script"]
related_ids: ["atomic-swap", "bitcoin-script"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["Synthèse du vault — DLC ; référence externe non précisée dans la note source."]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les contrats DLC et leurs oracles

## Questions couvertes

- Comment un contrat Bitcoin peut-il dépendre d’un événement extérieur ?

## Réponse courte

Un DLC permet de conditionner le règlement d'un contrat à une attestation cryptographique d'oracle, sans publier tous les termes du contrat dans la chaîne.

## Explication

- Les parties définissent à l’avance des règlements correspondant aux résultats possibles et à l’attestation attendue de l’oracle.
- L’oracle peut influencer le règlement par ce qu’il atteste ; l’absence de garde des fonds ne rend donc pas son rôle sans risque.

## Limites et confusions

L'oracle ne détient normalement pas les clés des fonds mais peut mentir, disparaître ou colluder ; le résultat n'est pas forcément lisible publiquement.

## Approfondissements

- [[atomic-swap.fr|Les échanges atomiques]] pour revenir à la notion de base.
- [[bitcoin-script.fr|Les conditions de dépense]] pour revenir à la notion de base.

## Références

- Synthèse du vault — DLC ; référence externe non précisée dans la note source.
