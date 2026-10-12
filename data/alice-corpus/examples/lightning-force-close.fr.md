---
type: "project_note"
id: "lightning-force-close"
title: "La fermeture forcée"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Lightning Force Close"]
parent_ids: []
related_ids: ["lightning-node-backup", "watchtower", "secondary-lightning-commitment-transaction"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB lnp202 — Set up Your First Lightning Node"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La fermeture forcée

## Questions couvertes

- Pourquoi une fermeture peut-elle imposer une attente ?

## Réponse courte

Une fermeture forcée publie sur Bitcoin une transaction d’engagement du canal sans coopération immédiate de l’autre participant. C’est un recours utile, mais ses fonds peuvent rester immobilisés pendant des délais de sécurité.

## Explication

Le canal possède des engagements signés qui permettent de revenir à la chaîne. La publication d’un engagement valide ne suppose pas que le pair accepte une nouvelle fermeture. Après confirmation, certaines sorties peuvent demander une attente et des opérations de récupération supplémentaires.

Ce mécanisme sert notamment lorsque le pair ne coopère plus ou dans certaines procédures de restauration. Il faut prévoir les frais on-chain et disposer des données nécessaires. Les détails du délai et des dépenses dépendent du canal et du logiciel.

## Limites et confusions

Forcer la fermeture ne signifie ni récupérer instantanément tous les fonds ni perdre automatiquement leur propriété. Il faut distinguer la transaction publiée, ses confirmations et la disponibilité finale des sorties.

Publier un ancien état révoqué peut être dangereux et exposer à une pénalité. Une copie ancienne de la base de données ne doit donc pas être relancée comme si elle était à jour. Une watchtower surveille certaines triches, mais ne remplace pas une sauvegarde ni toutes les étapes de récupération.

## Approfondissements

- [[lightning-node-backup.fr|Les sauvegardes Lightning]] — éviter les restaurations dangereuses
- [[watchtower.fr|Le rôle d’une watchtower]] — comprendre la surveillance des anciens états

- [[secondary-lightning-commitment-transaction.fr|Les transactions d’engagement Lightning]].

## Références

- PlanB lnp202 — Set up Your First Lightning Node (référence de la note source, non reconsultée directement pour cette adaptation).
