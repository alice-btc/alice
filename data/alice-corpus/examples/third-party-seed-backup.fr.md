---
type: "project_note"
id: "third-party-seed-backup"
title: "Confier sa phrase de récupération à un service tiers"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["security"]
aliases: ["Ledger Recover", "Sauvegarde de seed par un tiers", "Third-party seed backup", "Seed backup service"]
parent_ids: []
related_ids: ["seed-phrase-backup", "wallet-recovery-phrase", "secure-backups"]
reviewed_at: "2026-11-13"
review_due: null
sources: ["https://shop.ledger.com/pages/ledger-recover"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Confier sa phrase de récupération à un service tiers

## Questions couvertes

- Est-ce que Ledger Recover envoie ma phrase de récupération sur le cloud ?
- Avec un service de sauvegarde de seed, mon secret quitte-t-il l'appareil ?
- À qui faut-il faire confiance avec Ledger Recover ?
- Est-ce une bonne idée de confier sa seed à une entreprise ?

## Réponse courte

Oui, avec un service comme Ledger Recover, une version chiffrée du secret quitte l'appareil. Le service est optionnel, payant par abonnement, et repose sur la confiance accordée aux entreprises qui conservent les fragments.

## Explication

D'après la page du service, la puce sécurisée de l'appareil chiffre le secret, le découpe en 3 fragments et les confie à 3 entreprises distinctes : Coincover, Ledger et EscrowTech. 2 fragments sur 3 suffisent pour restaurer, après une vérification d'identité en ligne.

Il faut donc faire confiance à ces entreprises pour ne pas s'entendre et ne pas être contraintes de coopérer, au processus de vérification d'identité, et au logiciel de l'appareil qui effectue le chiffrement et le découpage. C'est un compromis : on gagne une solution en cas de perte, au prix d'une dépendance et d'un lien entre son identité et sa sauvegarde.

Une phrase notée à la main sur papier ou gravée sur métal, gardée en plusieurs exemplaires, n'envoie rien nulle part.

## Limites et confusions

Les détails techniques et le prix relèvent de la documentation actuelle du fournisseur et peuvent changer. Cette fiche ne recommande ni ne déconseille un produit. Alice App ne stocke ni ne récupère aucune phrase de récupération.

## Approfondissements

- [[seed-phrase-backup.fr|Sauvegarder sa phrase de récupération]].
- [[wallet-recovery-phrase.fr|La phrase de récupération]].
- [[secure-backups.fr|Des sauvegardes sûres]].

## Références

- https://shop.ledger.com/pages/ledger-recover.
