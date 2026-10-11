---
type: "project_note"
id: "secondary-lightning-commitment-transaction"
title: "Les transactions d’engagement Lightning"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Commitment Transaction"]
parent_ids: ["lightning-channel", "lightning-force-close"]
related_ids: ["lightning-channel", "lightning-force-close"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB lnp201 — Lightning Network Theory"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Les transactions d’engagement Lightning

## Questions couvertes

- Les transactions d’engagement Lightning — quel mécanisme et quelles limites ?

## Réponse courte

Dans les canaux Lightning à révocation, une transaction d’engagement représente un état qui peut être publié sur Bitcoin pour fermer le canal. Les mises à jour remplacent les engagements utilisables et rendent les états précédents pénalisables.

## Explication

- Chaque participant dispose d’une transaction d’engagement correspondant à sa perspective.
- Les engagements restent normalement hors chaîne tant que le canal fonctionne.
- Une fermeture forcée publie un engagement sur Bitcoin.
- Les secrets de révocation et conditions temporelles permettent de réagir à la publication d’un état révoqué.

## Limites et confusions

Un état ancien peut être publié à cause d’une restauration incorrecte, sans intention de fraude. La réaction dépend du type de canal et de la capacité à agir dans le délai prévu.

## Approfondissements

- [[lightning-channel.fr|Les canaux Lightning]] pour replacer ce mécanisme dans son contexte.
- [[lightning-force-close.fr|La fermeture forcée]] pour replacer ce mécanisme dans son contexte.

## Références

- PlanB lnp201 — Lightning Network Theory
