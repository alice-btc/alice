---
type: "project_note"
id: "secure-backups"
title: "Les risques qui menacent une sauvegarde"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["security"]
aliases: ["Secure Backups"]
parent_ids: []
related_ids: ["wallet-backup", "wallet-backup-test", "bitcoin-inheritance-plan", "secondary-privacy-backup-3-2-1-method", "secondary-privacy-file-encryption", "secondary-privacy-ransomware"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB scu202 et scu101, sécurité numérique et sauvegardes"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les risques qui menacent une sauvegarde

## Questions couvertes

- Comment penser perte, vol et destruction d’une sauvegarde ?

## Réponse courte

Une sauvegarde utile doit résister à la perte de l’original tout en restant récupérable par les bonnes personnes. Pour Bitcoin, elle doit aussi éviter d’exposer les secrets qui autorisent une dépense.

## Explication

La synchronisation propage les changements ; elle peut aussi propager une suppression ou une erreur. Un historique sur le même disque ne protège pas de la perte de ce disque. Une copie indépendante et une restauration vérifiée répondent à des besoins différents.

Le contenu à protéger dépend du portefeuille. Il peut inclure des mots, une passphrase, des descripteurs et une procédure de récupération. Séparer les copies peut limiter un sinistre commun, mais multiplier les secrets accessibles crée aussi des points d’exposition.

## Limites et confusions

Une règle générale de sauvegarde informatique ne s’applique pas mécaniquement aux clés Bitcoin. Le chiffrement ajoute son propre secret à préserver. Une empreinte correcte ne prouve pas qu’une restauration complète est possible. La meilleure organisation est celle dont les risques de perte, de vol et d’incompréhension ont été explicitement envisagés.

## Approfondissements

- [[wallet-backup.fr|Préparer une sauvegarde]].
- [[wallet-backup-test.fr|Vérifier sa sauvegarde]].
- [[bitcoin-inheritance-plan.fr|Préparer la transmission]].

- [[secondary-privacy-backup-3-2-1-method.fr|La méthode de sauvegarde 3-2-1]].
- [[secondary-privacy-file-encryption.fr|Chiffrer des fichiers sensibles]].
- [[secondary-privacy-ransomware.fr|Rançongiciels et limites des sauvegardes]].

## Références

- PlanB scu202 et scu101, sécurité numérique et sauvegardes.
