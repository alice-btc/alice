---
type: "project_note"
id: "seed-phrase-backup"
title: "Sauvegarder la phrase de récupération"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Seed Phrase Backup", "sauvegarde de la seed", "phrase sur papier", "plaque métal"]
parent_ids: []
related_ids: ["wallet-recovery-phrase", "wallet-backup", "wallet-backup-test", "secure-backups", "password-manager", "bip39-passphrase"]
reviewed_at: "2026-11-02"
review_due: null
sources: ["https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki", "PlanB btc102 — Getting your first bitcoins", "PlanB scu202 — Improve Your Personal Digital Security"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Sauvegarder la phrase de récupération

## Questions couvertes

- Puis-je garder une photo de ma phrase de récupération dans mon gestionnaire de mots de passe ?
- Sur quel support écrire ma phrase de récupération ?
- Combien de copies de ma phrase faut-il, et où les ranger ?

## Réponse courte

La phrase de récupération s’écrit à la main sur papier ou se grave sur métal, hors de tout appareil connecté. Jamais en photo, dans une note, dans un e-mail, dans un fichier dans le cloud ni dans un gestionnaire de mots de passe, même chiffré.

## Explication

Qui lit la phrase peut dépenser tous les fonds, maintenant et plus tard. Un appareil connecté peut être compromis par un logiciel malveillant, une sauvegarde automatique, une synchronisation ou un accès au compte ; une copie numérique y reste exposée tant qu’elle existe. Le chiffrement déplace le problème : il ajoute un mot de passe à ne pas perdre et ne protège pas contre une saisie sur un appareil déjà compromis. Un gestionnaire de mots de passe convient pour des mots de passe, pas pour un secret qui ne doit jamais passer par un écran ou un clavier connecté.

Le papier et le métal n’ont ni logiciel ni réseau. Le papier craint le feu, l’eau et le temps ; une plaque métallique y résiste. Deux copies au moins, dans des lieux séparés, protègent de la perte d’un lieu. Une copie rangée avec l’appareil de signature partage son sort en cas de vol ou de sinistre. Un test de restauration, sur un appareil de confiance et avec peu de fonds, prouve que la phrase est complète et lisible avant qu’il soit trop tard.

## Limites et confusions

La phrase seule ne suffit pas toujours : une passphrase, les chemins de dérivation ou la configuration d’un multisig peuvent être nécessaires, et doivent être sauvegardés aussi. Multiplier les copies multiplie les lieux où un intrus peut lire le secret ; chaque copie doit être aussi protégée que la première. Aucun support, aucun site et aucun assistant, Alice comprise, n’a besoin de la phrase pour aider. Cette fiche ne décrit ni le partage de secret entre plusieurs personnes ni les dispositifs de succession.

## Approfondissements

- [[wallet-recovery-phrase.fr|La phrase de récupération]].
- [[wallet-backup.fr|Préparer une sauvegarde]].
- [[wallet-backup-test.fr|Vérifier sa sauvegarde]].
- [[secure-backups.fr|Les risques qui menacent une sauvegarde]].
- [[password-manager.fr|Les gestionnaires de mots de passe]].

## Références

- [BIP39, phrases mnémoniques](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki).
- PlanB btc102 — Getting your first bitcoins.
- PlanB scu202 — Improve Your Personal Digital Security.
