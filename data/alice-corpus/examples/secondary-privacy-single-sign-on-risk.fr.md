---
type: "project_note"
id: "secondary-privacy-single-sign-on-risk"
title: "La dépendance à une connexion centralisée"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Single Sign-On Risk"]
parent_ids: ["threat-model", "two-factor-authentication"]
related_ids: ["threat-model", "two-factor-authentication"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB scu101 — Update Your Online Security"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# La dépendance à une connexion centralisée

## Questions couvertes

- La dépendance à une connexion centralisée — quel mécanisme et quelles limites ?

## Réponse courte

Le Single Sign-On simplifie l’accès via un fournisseur central, mais crée un point de dépendance et de censure : si le compte central tombe, de nombreux services deviennent vulnérables ou inaccessibles.

## Explication

- Réduit le nombre de mots de passe mais concentre le risque.
- La disponibilité et la politique du fournisseur deviennent critiques.
- Pour services sensibles, évaluer comptes séparés, passkeys ou clés matérielles.
- Éviter de lier toute son identité numérique à un seul acteur.

## Limites et confusions

La concentration des accès doit être comparée aux avantages possibles d’une authentification centralisée bien protégée. Des comptes séparés mal sécurisés ne sont pas automatiquement plus sûrs.

## Approfondissements

- [[threat-model.fr|Adapter la protection aux risques]] pour replacer ce mécanisme dans son contexte.
- [[two-factor-authentication.fr|La double authentification]] pour replacer ce mécanisme dans son contexte.

## Références

- PlanB scu101 — Update Your Online Security
