---
type: "project_note"
id: "document-timestamping"
title: "L’horodatage de documents"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Usages et comparaisons"]
aliases: ["Document Timestamping"]
parent_ids: []
related_ids: ["cryptographic-hash-function", "merkle-tree"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://opentimestamps.org/"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# L’horodatage de documents

## Questions couvertes

- Que peut prouver l’ancrage d’une empreinte dans Bitcoin ?

## Réponse courte

L’horodatage cryptographique permet de prouver qu’une empreinte de données existait au plus tard à un certain repère. Un ancrage dans Bitcoin peut fournir ce repère sans publier le document lui-même.

## Explication

Le service calcule ou utilise une empreinte du document et l’engage dans une structure liée à la chaîne. Pour vérifier plus tard, on fournit le document correspondant et la preuve permettant de relier son empreinte à l’ancrage. OpenTimestamps est un exemple de système qui produit ce type de preuve.

Changer le document modifie normalement son empreinte ; la preuve concerne donc la version correspondante. Conserver le fichier et les éléments de vérification est essentiel. La blockchain apporte un historique ordonné, mais n’est pas une horloge d’une précision absolue.

## Limites et confusions

Cette preuve ne démontre ni l’identité de l’auteur, ni la vérité du contenu, ni sa propriété juridique. Elle ne remplace pas automatiquement les exigences d’un contrat ou d’une procédure légale.

Le document n’est pas enregistré automatiquement sur Bitcoin. Hacher des données ne les rend pas secrètes si quelqu’un peut deviner les entrées et comparer les empreintes. Il faut donc distinguer preuve d’existence, conservation du fichier et confidentialité de son contenu.

## Approfondissements

- [[cryptographic-hash-function.fr|L’empreinte cryptographique]] — comprendre l’empreinte
- [[merkle-tree.fr|Les arbres de Merkle]] — voir les preuves compactes d’inclusion

## Références

- [Documentation officielle](https://opentimestamps.org/).
