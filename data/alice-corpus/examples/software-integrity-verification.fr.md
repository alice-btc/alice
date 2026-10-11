---
type: "project_note"
id: "software-integrity-verification"
title: "Vérifier un téléchargement"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["security"]
aliases: ["Software Integrity Verification", "PGP Signature Verification"]
parent_ids: []
related_ids: ["software-download-hygiene", "bitcoin-core", "malware", "secondary-bitcoin-kerckhoffs-principle", "secondary-bitcoin-message-integrity", "secondary-bitcoin-open-source-security-review"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB scu202 — Improve Your Personal Digital Security", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Vérifier un téléchargement

## Questions couvertes

- À quoi servent une empreinte et une signature de logiciel ?

## Réponse courte

Une empreinte aide à vérifier qu’un fichier correspond à une référence. Une signature aide à vérifier qu’une clé donnée a signé ce fichier ou son empreinte. Ce sont des contrôles différents.

## Explication

Si le fichier est modifié, son empreinte doit changer. Mais un attaquant qui remplace à la fois le fichier et l’empreinte sur une fausse page peut rendre cette comparaison trompeuse. La référence doit donc provenir d’une origine fiable.

Une signature ajoute un lien cryptographique avec une clé. Il faut encore établir que cette clé appartient bien à l’éditeur attendu. Vérifier seulement qu’une signature quelconque est correcte ne résout pas ce problème d’identité.

## Limites et confusions

Un fichier authentique peut contenir des défauts. La vérification d’origine ne constitue pas un audit du programme et ne garantit pas que le système qui l’exécute est sain. Les procédures exactes varient selon le projet et la plateforme. Cette fiche explique leur utilité ; elle ne fournit pas de commande universelle applicable à tous les téléchargements.

## Approfondissements

- [[software-download-hygiene.fr|Télécharger le bon logiciel]].
- [[bitcoin-core.fr|Le logiciel Bitcoin Core]].
- [[malware.fr|Les logiciels malveillants]].

- [[secondary-bitcoin-kerckhoffs-principle.fr|Le principe de Kerckhoffs]].
- [[secondary-bitcoin-message-integrity.fr|L’intégrité d’un message]].
- [[secondary-bitcoin-open-source-security-review.fr|La revue de sécurité du code ouvert]].

## Références

- PlanB scu202 — Improve Your Personal Digital Security.
- PlanB Extraction — 2026-05-23.
