---
type: "project_note"
id: "bip39-passphrase"
title: "La passphrase optionnelle"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["BIP39 Passphrase"]
parent_ids: []
related_ids: ["bitcoin-seed", "wallet-backup", "bitcoin-inheritance-plan", "secondary-bitcoin-pbkdf2"]
reviewed_at: "2026-11-06"
review_due: null
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture", "PlanB Extraction — 2026-05-23", "https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# La passphrase optionnelle

## Questions couvertes

- Une passphrase est-elle simplement un mot de passe ?
- Ma phrase de récupération suffit-elle si j’ai aussi défini une passphrase ?

## Réponse courte

La passphrase BIP39 est un secret optionnel qui modifie la seed dérivée des mots de récupération. Elle ne se limite pas à déverrouiller l’interface comme un mot de passe d’application.

## Explication

BIP39 combine les mots de récupération et la passphrase exacte pour dériver une seed, dont dérivent les clés privées. Toute passphrase, y compris la chaîne vide, produit une seed valide. BIP39 ne signale pas si elle correspond au portefeuille initialement voulu. Avec les mêmes mots, changer la passphrase change normalement les clés et les adresses ; ce fait ne suffit pas à expliquer un affichage vide.

Un PIN d’appareil ou mot de passe local d’application contrôle l’accès à l’appareil ou à l’application. La passphrase BIP39 participe, elle, à la dérivation des clés. Réinitialiser un mot de passe local ne reconstitue pas une passphrase oubliée ; les mots seuls ne recréent pas le même portefeuille protégé par passphrase.

Un solde nul ou un affichage vide ne prouve pas, à lui seul, qu’un portefeuille différent a été dérivé, que la passphrase est correcte ou que les fonds ont disparu. Une passphrase différente est possible, mais un autre chemin de dérivation, compte ou réseau, ou une synchronisation incomplète, peut aussi expliquer cet affichage. Comparer localement des repères publics connus, comme une adresse déjà utilisée, avec les paramètres de restauration appropriés. Ne communiquer ni mots ni passphrase à un assistant, site ou support.

BIP39 ne fournit pas de mécanisme de réinitialisation et la récupération n’est pas garantie. Sa faisabilité dépend des éléments encore connus et de la robustesse de la passphrase. Vérifier un ensemble limité de candidats connus peut parfois fonctionner ; reconstituer un secret robuste inconnu peut être irréalisable en pratique. Ni un succès certain ni une impossibilité mathématique universelle ne découlent du seul oubli de la passphrase.

Cette séparation peut limiter les conséquences de la découverte des seuls mots. Elle introduit aussi un risque de perte supplémentaire si le détenteur ou ses proches ne disposent plus de la bonne passphrase.

## Limites et confusions

Ajouter une passphrase n’améliore pas automatiquement la sécurité. Son intérêt dépend de sa qualité, de sa conservation et de la compréhension de son rôle. Elle ne remplace pas une sauvegarde complète ni les paramètres nécessaires à la restauration. La présenter simplement comme un « mot supplémentaire » peut masquer son fonctionnement et ses contraintes de compatibilité.

## Approfondissements

- [[bitcoin-seed.fr|De la phrase aux clés]].
- [[wallet-backup.fr|Préparer une sauvegarde]].
- [[bitcoin-inheritance-plan.fr|Préparer la transmission]].

- [[secondary-bitcoin-pbkdf2.fr|La dérivation BIP39 avec PBKDF2]].

## Références

- PlanB cyp201 — Bitcoin Wallet Architecture.
- PlanB Extraction — 2026-05-23.

- https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
