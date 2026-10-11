---
type: "project_note"
id: "derivation-path"
title: "Le chemin de dérivation"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Derivation Path"]
parent_ids: []
related_ids: ["hd-wallet", "wallet-backup", "descriptor-wallet", "secondary-bitcoin-hardened-derivation"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Le chemin de dérivation

## Questions couvertes

- Pourquoi 2 logiciels ne retrouvent-ils pas toujours les mêmes adresses ?

## Réponse courte

Le chemin de dérivation indique la position d’une clé dans l’arbre d’un portefeuille HD. Il aide à retrouver les mêmes comptes et adresses dans un logiciel compatible.

## Explication

Des conventions organisent l’arbre selon le type d’usage, le réseau ou actif, le compte, les adresses de réception et la monnaie rendue. Le chemin est une description de cette organisation, distincte du secret qui permet de calculer les clés.

Lors d’une restauration, 2 logiciels peuvent utiliser les mêmes mots mais examiner des branches différentes. Ils n’affichent alors pas les mêmes adresses. Le type de sortie attendu doit aussi correspondre.

## Limites et confusions

Le chemin seul ne permet pas de dépenser des fonds. À l’inverse, les mots seuls ne garantissent pas une récupération automatique dans toute application. Les notations techniques et dérivations renforcées doivent être reprises depuis la documentation du portefeuille concerné. Cette fiche explique la compatibilité ; elle n’invite pas à tester au hasard des secrets sur des sites ou logiciels inconnus.

## Approfondissements

- [[hd-wallet.fr|Les portefeuilles déterministes]].
- [[wallet-backup.fr|Préparer une sauvegarde]].
- [[descriptor-wallet.fr|Les portefeuilles à descripteurs]].

- [[secondary-bitcoin-hardened-derivation.fr|La dérivation renforcée des clés]].

## Références

- PlanB cyp201 — Bitcoin Wallet Architecture.
