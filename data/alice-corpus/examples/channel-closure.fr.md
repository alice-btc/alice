---
type: "project_note"
id: "channel-closure"
title: "Fermer un canal"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Channel Closure"]
parent_ids: []
related_ids: ["lightning-force-close", "lightning-node-backup", "secondary-lightning-static-channel-backup"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB lnp201 — Lightning Network Theory"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Fermer un canal

## Questions couvertes

- Comment les fonds reviennent-ils sur la chaîne ?

## Réponse courte

Fermer un canal Lightning règle ses fonds sur la chaîne Bitcoin. Une fermeture coopérative repose sur l’accord des participants ; une fermeture unilatérale publie un engagement sans obtenir cet accord au même moment.

## Explication

Pendant la vie du canal, les participants mettent à jour la répartition des fonds hors chaîne. La fermeture transforme ce règlement en sorties Bitcoin utilisables selon les règles et délais applicables. Les frais on-chain redeviennent donc directement importants.

Si les participants coopèrent, ils peuvent négocier la fermeture. Si un pair ne répond plus, l’autre dispose d’un recours unilatéral fondé sur ses transactions et données de canal. La publication d’un ancien état révoqué est un autre cas, qui déclenche des mécanismes de protection contre la triche.

## Limites et confusions

Une fermeture forcée n’est pas en elle-même une tentative de vol. Elle peut être nécessaire pour récupérer des fonds quand un pair est indisponible. Elle peut cependant imposer un délai et des transactions supplémentaires.

La capacité totale du canal ne revient pas à 1 seul participant. Le règlement dépend de la part de chacun, des paiements en cours et des frais. Pour récupérer un canal, suivre la procédure du logiciel plutôt que restaurer au hasard une ancienne base de données.

## Approfondissements

- [[lightning-force-close.fr|La fermeture forcée]] — comprendre le recours unilatéral
- [[lightning-node-backup.fr|Les sauvegardes Lightning]] — préparer une récupération adaptée au logiciel

- [[secondary-lightning-static-channel-backup.fr|La sauvegarde statique des canaux LND]].

## Références

- PlanB lnp201 — Lightning Network Theory (référence de la note source, non reconsultée directement pour cette adaptation).
