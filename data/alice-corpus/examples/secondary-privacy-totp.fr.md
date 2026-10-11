---
type: "project_note"
id: "secondary-privacy-totp"
title: "Les codes d’authentification TOTP"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["privacy"]
aliases: ["TOTP"]
parent_ids: ["two-factor-authentication"]
related_ids: ["two-factor-authentication"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB scu101 — Update Your Online Security"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les codes d’authentification TOTP

## Questions couvertes

- Les codes d’authentification TOTP — quel mécanisme et quelles limites ?

## Réponse courte

TOTP génère un code temporaire à partir d’un secret partagé et de l’heure. Le service calcule les codes attendus pour vérifier celui que présente l’utilisateur.

## Explication

- Le code est généré localement, sans livraison par SMS.
- La protection du secret TOTP et des moyens de récupération reste essentielle.
- Un appareil d’authentification séparé peut limiter certaines expositions.
- TOTP ne bénéficie pas de la liaison au site qu’offrent les authentifications FIDO correctement utilisées.

## Limites et confusions

Le code TOTP peut être relayé par un site de phishing en temps réel. Sa sauvegarde doit être protégée ; une copie du secret permet de générer les mêmes codes.

## Approfondissements

- [[two-factor-authentication.fr|La double authentification]] pour replacer ce mécanisme dans son contexte.

## Références

- PlanB scu101 — Update Your Online Security
