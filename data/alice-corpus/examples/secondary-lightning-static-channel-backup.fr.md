---
type: "project_note"
id: "secondary-lightning-static-channel-backup"
title: "La sauvegarde statique des canaux LND"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Static Channel Backup"]
parent_ids: ["lightning-node-backup", "channel-closure"]
related_ids: ["lightning-node-backup", "channel-closure"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB lnp202 — Set up Your First Lightning Node"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# La sauvegarde statique des canaux LND

## Questions couvertes

- La sauvegarde statique des canaux LND — quel mécanisme et quelles limites ?

## Réponse courte

Un Static Channel Backup de LND conserve des informations permettant de retrouver les pairs et de demander une fermeture de canaux après perte des données locales. Il sert à récupérer les fonds sur Bitcoin, pas à reprendre le nœud à l’identique.

## Explication

- Il ne contient pas l’état dynamique complet des canaux.
- La récupération utilise les informations de sauvegarde et les clés appropriées.
- Les pairs sont sollicités pour publier leur transaction de fermeture.
- La sauvegarde doit refléter les changements de canaux selon la procédure de LND.

## Limites et confusions

Cette procédure concerne LND et dépend de la coopération/disponibilité des pairs. Elle ne restaure pas les canaux ouverts à leur dernier état et ne remplace pas les clés nécessaires.

## Approfondissements

- [[lightning-node-backup.fr|Les sauvegardes Lightning]] pour replacer ce mécanisme dans son contexte.
- [[channel-closure.fr|Fermer un canal]] pour replacer ce mécanisme dans son contexte.

## Références

- PlanB lnp202 — Set up Your First Lightning Node
