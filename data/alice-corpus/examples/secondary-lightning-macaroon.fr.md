---
type: "project_note"
id: "secondary-lightning-macaroon"
title: "Les jetons d’accès macaroon de LND"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Macaroon"]
parent_ids: ["threat-model", "lightning-node-online-status"]
related_ids: ["threat-model", "lightning-node-online-status"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB lnp202 — Set up Your First Lightning Node"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les jetons d’accès macaroon de LND

## Questions couvertes

- Les jetons d’accès macaroon de LND — quel mécanisme et quelles limites ?

## Réponse courte

Dans LND, un macaroon est un jeton qui autorise certaines opérations sur le nœud. Une application qui le possède peut exercer les droits qui lui sont accordés.

## Explication

- Les droits doivent correspondre aux seules opérations nécessaires.
- Un jeton d’administration donne des pouvoirs beaucoup plus larges qu’un accès en lecture.
- Les budgets ou autres restrictions doivent être vérifiés dans le mécanisme utilisé, sans être supposés universels.
- Le jeton doit être transmis et conservé comme un secret d’accès.

## Limites et confusions

Un macaroon n’est pas une phrase de récupération. Certains droits permettent toutefois de déclencher des paiements ; il faut protéger le jeton et limiter ses permissions.

## Approfondissements

- [[threat-model.fr|Adapter la protection aux risques]] pour replacer ce mécanisme dans son contexte.
- [[lightning-node-online-status.fr|La disponibilité du nœud]] pour replacer ce mécanisme dans son contexte.

## Références

- PlanB lnp202 — Set up Your First Lightning Node
