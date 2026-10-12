---
type: "project_note"
id: "exchange-custody-risk"
title: "Le risque de laisser ses fonds à une plateforme"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["security"]
aliases: ["Exchange Custody Risk"]
parent_ids: []
related_ids: ["custodial-wallet", "self-custody", "kyc-data-leakage"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc102 — Getting your first bitcoins"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Le risque de laisser ses fonds à une plateforme

## Questions couvertes

- Quels risques subsistent quand un service détient mes clés ?

## Réponse courte

Lorsque des fonds restent sur une plateforme, leur disponibilité dépend de cet intermédiaire. Un solde affiché ne donne pas à l’utilisateur le contrôle direct des UTXO correspondants.

## Explication

La plateforme peut subir une attaque, manquer de fonds ou restreindre les retraits. Les raisons techniques, économiques et réglementaires sont distinctes, mais peuvent toutes affecter l’accès. Protéger son mot de passe ne résout pas la solvabilité ou les obligations du service.

La garde personnelle remplace ce risque par d’autres responsabilités, notamment la sauvegarde et la sécurité des clés. Comparer les modèles demande donc d’identifier qui peut réellement dépenser et dans quelles conditions l’utilisateur peut récupérer ses fonds.

## Limites et confusions

La réputation, une interface fonctionnelle ou une preuve partielle de réserves ne démontrent pas à elles seules toute la situation du dépositaire. Les services d’identification exposent aussi des données personnelles. Cette fiche décrit les risques de garde ; elle ne porte pas de jugement actualisé sur une plateforme précise et ne recommande pas une opération financière.

## Approfondissements

- [[custodial-wallet.fr|La garde déléguée]].
- [[self-custody.fr|La garde personnelle des clés]].
- [[kyc-data-leakage.fr|Les données d’identification exposées]].

## Références

- PlanB btc102 — Getting your first bitcoins.
