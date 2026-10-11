---
type: "project_note"
id: "watchtower"
title: "Le rôle d’une watchtower"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Watchtower"]
parent_ids: []
related_ids: ["lightning-force-close", "lightning-node-backup", "secondary-lightning-revocation-key"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB lnp201 — Lightning Network Theory"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Le rôle d’une watchtower

## Questions couvertes

- À quoi sert une watchtower ?

## Réponse courte

Une watchtower surveille la chaîne pour détecter certaines publications frauduleuses d’anciens états de canaux Lightning et réagir dans le délai prévu. Elle complète la surveillance du nœud de l’utilisateur.

## Explication

Dans le modèle de canaux à pénalité, publier un état révoqué peut favoriser indûment un participant. La partie lésée dispose d’une fenêtre pour réagir. Une watchtower reçoit les informations nécessaires au mécanisme prévu par le logiciel et peut intervenir quand l’utilisateur ne suit pas lui-même la chaîne.

Elle peut être auto-hébergée ou fournie par un tiers. Sa disponibilité, sa compatibilité et la manière dont elle reçoit les mises à jour comptent. Utiliser le service demande une configuration adaptée, pas seulement connaître son adresse.

## Limites et confusions

Une watchtower n’est pas une assurance générale contre toutes les pertes Lightning. Elle ne résout pas le manque de liquidité, un wallet compromis ou l’absence de sauvegarde. Elle ne rend pas non plus un nœud hors ligne capable de router normalement.

Le service doit effectivement recevoir les informations pertinentes et pouvoir agir à temps. Les garanties et les métadonnées exposées dépendent de l’implémentation. Il faut éviter de promettre une protection absolue sur le seul nom « watchtower ».

## Approfondissements

- [[lightning-force-close.fr|La fermeture forcée]] — situer le moment où la surveillance intervient
- [[lightning-node-backup.fr|Les sauvegardes Lightning]] — distinguer protection et sauvegarde

- [[secondary-lightning-revocation-key.fr|Réagir à un état de canal révoqué]].

## Références

- PlanB lnp201 — Lightning Network Theory (référence de la note source, non reconsultée directement pour cette adaptation).
