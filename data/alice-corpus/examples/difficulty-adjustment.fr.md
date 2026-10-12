---
type: "project_note"
id: "difficulty-adjustment"
title: "L’ajustement de difficulté"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["mining"]
aliases: ["Difficulty Adjustment"]
parent_ids: []
related_ids: ["mining-difficulty", "mining-difficulty-details", "bitcoin-monetary-policy"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bitcoin/blob/v28.0/src/pow.cpp", "https://github.com/bitcoin/bitcoin/blob/v28.0/src/kernel/chainparams.cpp"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# L’ajustement de difficulté

## Questions couvertes

- Comment Bitcoin réagit-il quand des mineurs arrivent ou partent ?

## Réponse courte

Sur le réseau principal, Bitcoin recalcule la difficulté tous les 2 016 blocs pour viser une cadence moyenne de 10 minutes. Il réagit à la vitesse observée, pas à une décision d’un comité.

## Explication

Si la puissance augmente et que les blocs arrivent plus vite, la difficulté tend à monter. Si beaucoup de mineurs s’arrêtent et que les blocs ralentissent, elle tend à baisser. Entre les ajustements, le temps d’attente peut donc s’écarter durablement de la moyenne visée.

Ce mécanisme évite que l’amélioration du matériel accélère sans limite le calendrier d’émission. Il ne modifie pas la quantité autorisée de subvention à une hauteur donnée.

## Limites et confusions

L’ajustement a des bornes. Une très forte variation de puissance peut demander plusieurs périodes avant un retour vers la cadence attendue. Les limites usuelles sont ÷4, soit −75 %, et ×4, soit +300 % de difficulté, sous les contraintes de cible maximale et d’encodage. La différence entre 2 016 blocs et 2 015 intervalles mesurés est détaillée dans l’approfondissement.

## Approfondissements

- [[mining-difficulty.fr|La difficulté de minage]].
- [[mining-difficulty-details.fr|L’ajustement de difficulté en détail]].
- [[bitcoin-monetary-policy.fr|L’émission monétaire de Bitcoin]].

## Références

- [Référence publique conservée de la note source](https://github.com/bitcoin/bitcoin/blob/v28.0/src/pow.cpp).
- [Référence publique conservée de la note source](https://github.com/bitcoin/bitcoin/blob/v28.0/src/kernel/chainparams.cpp).
