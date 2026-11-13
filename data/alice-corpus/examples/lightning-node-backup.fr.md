---
type: "project_note"
id: "lightning-node-backup"
title: "Les sauvegardes Lightning"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Lightning Node Backup"]
parent_ids: []
related_ids: ["lightning-force-close", "watchtower", "secondary-lightning-lightning-node-implementation", "secondary-lightning-lightning-node-recovery-tradeoff", "secondary-lightning-lnd-aezeed", "secondary-lightning-static-channel-backup"]
reviewed_at: "2026-11-06"
review_due: null
sources: ["https://docs.lightning.engineering/lightning-network-tools/lnd/recovery-planning-for-failure", "https://github.com/lightningnetwork/lnd/blob/master/docs/recovery.md"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Les sauvegardes Lightning

## Questions couvertes

- Pourquoi sauvegarder Lightning demande-t-il une attention particulière ?

## Réponse courte

Sauvegarder Lightning demande de tenir compte de l’état vivant des canaux, pas seulement des clés. La procédure dépend du logiciel ; une recette prévue pour LND ne s’applique pas automatiquement aux autres nœuds.

## Explication

Pour LND, la seed seule ne suffit pas à restaurer les canaux ouverts. La sauvegarde statique des canaux, ou SCB, aide à retrouver les pairs et à demander un règlement des canaux dans la procédure de récupération. Elle ne remet pas le nœud en fonctionnement avec tous ses anciens canaux intacts.

La phrase aezeed restaure les clés du portefeuille concerné ; la SCB ne remplace pas ces clés et ne constitue pas une copie des derniers soldes. Dans la récupération standard par SCB, LND utilise les informations sauvegardées sur les canaux et les pairs pour demander des fermetures forcées avec leur aide. Reconnecter les pairs ne suffit pas à reconstruire les canaux actifs ni à reprendre le routage. La disponibilité des pairs et des données valides compte ; après fermeture, les confirmations on-chain et les timelocks applicables peuvent retarder la dépense. Ni la seed seule ni la présence d’une SCB ne garantissent de récupérer chaque canal.

La base channel.db contient un état dynamique. Reprendre une vieille copie peut conduire à utiliser un engagement périmé et mettre les fonds en danger. Il faut préparer une sauvegarde cohérente avec la documentation de la version employée avant qu’une panne survienne.

## Limites et confusions

Une sauvegarde on-chain et une sauvegarde Lightning ne couvrent pas le même besoin. Une watchtower ne remplace pas les données de récupération.

Alice doit demander quel logiciel est utilisé avant de proposer une procédure précise. Elle ne doit jamais demander à l’utilisateur de publier sa seed, ses clés ou ses fichiers secrets dans la conversation. Une explication générale ne constitue pas un test de restauration effectivement réussi.

## Approfondissements

- [[lightning-force-close.fr|La fermeture forcée]] — comprendre le règlement lors d’une récupération
- [[watchtower.fr|Le rôle d’une watchtower]] — distinguer surveillance et restauration

- [[secondary-lightning-lightning-node-implementation.fr|Les implémentations de Lightning]].
- [[secondary-lightning-lightning-node-recovery-tradeoff.fr|Les dépendances de récupération d’un nœud Lightning]].
- [[secondary-lightning-lnd-aezeed.fr|Le format de récupération aezeed de LND]].
- [[secondary-lightning-static-channel-backup.fr|La sauvegarde statique des canaux LND]].

## Références

- [Lightning Labs, récupération LND](https://docs.lightning.engineering/lightning-network-tools/lnd/recovery-planning-for-failure).

- https://github.com/lightningnetwork/lnd/blob/master/docs/recovery.md
