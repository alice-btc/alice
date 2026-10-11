---
type: "project_note"
id: "sim-swap"
title: "Le détournement de carte SIM"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["security"]
aliases: ["SIM Swap"]
parent_ids: []
related_ids: ["two-factor-authentication", "exchange-custody-risk", "threat-model"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB scu101 — Update Your Online Security"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Le détournement de carte SIM

## Questions couvertes

- Pourquoi les codes par SMS ont-ils des limites ?

## Réponse courte

Le SIM swap détourne un numéro de téléphone vers une carte ou un accès contrôlé par l’attaquant. Celui-ci peut alors recevoir des SMS et des appels destinés à la victime.

## Explication

Un service qui utilise le SMS pour se connecter ou récupérer un compte dépend ainsi de la maîtrise du numéro. Le détournement peut permettre à l’attaquant de franchir cette étape, même sans posséder le téléphone habituel.

Il faut donc distinguer possession du numéro, possession de l’appareil et identité réelle. Les codes d’une application locale ou certaines clés d’authentification réduisent la dépendance au circuit téléphonique, sous réserve de la configuration du compte et de sa récupération.

## Limites et confusions

Changer le facteur habituel ne suffit pas si le SMS reste une voie de secours permettant de reprendre le compte. Une perte de réseau n’est pas, à elle seule, une preuve de SIM swap. Cette attaque ne donne pas automatiquement accès à une phrase Bitcoin conservée séparément, mais peut compromettre des services et informations utilisés autour du portefeuille.

## Approfondissements

- [[two-factor-authentication.fr|La double authentification]].
- [[exchange-custody-risk.fr|Le risque de laisser ses fonds à une plateforme]].
- [[threat-model.fr|Adapter la protection aux risques]].

## Références

- PlanB scu101 — Update Your Online Security.
