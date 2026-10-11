---
type: "project_note"
id: "cryptographic-hash-function"
title: "L’empreinte cryptographique"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Cryptographie et limites du protocole"]
aliases: ["Cryptographic Hash Function"]
parent_ids: []
related_ids: ["merkle-tree", "document-timestamping", "secondary-bitcoin-collision-resistance", "secondary-bitcoin-cryptographic-commitment", "secondary-bitcoin-hash160", "secondary-bitcoin-message-integrity", "secondary-bitcoin-pedersen-commitment", "secondary-bitcoin-preimage-resistance", "secondary-bitcoin-sha-256"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://csrc.nist.gov/glossary/term/cryptographic_hash_function"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# L’empreinte cryptographique

## Questions couvertes

- À quoi sert un hash dans Bitcoin ?

## Réponse courte

Une fonction de hachage cryptographique transforme des données en une empreinte de taille fixe. Elle permet de les identifier et de vérifier leur cohérence sans recopier tout leur contenu.

## Explication

La même entrée donne la même empreinte. Modifier les données change normalement le résultat. Bitcoin utilise ces empreintes notamment pour les transactions, les blocs et les arbres de Merkle.

La sécurité demande plusieurs propriétés. Il doit être difficile de retrouver une entrée à partir d’une empreinte, de trouver une seconde entrée correspondant à une donnée connue ou de trouver 2 entrées distinctes ayant la même empreinte. Ces problèmes sont liés, mais ne sont pas identiques.

## Limites et confusions

Les collisions existent mathématiquement quand les entrées possibles sont plus nombreuses que les empreintes. La propriété recherchée est la difficulté pratique de les trouver, pas leur impossibilité absolue. Une sortie qui ressemble à de l’aléatoire ne suffit pas à démontrer cette sécurité.

Le hachage n’est pas un chiffrement et n’utilise pas de clé pour retrouver le contenu. Si les entrées sont prévisibles, quelqu’un peut néanmoins les essayer et comparer les empreintes. Hacher une information courte ou connue ne garantit donc pas sa confidentialité.

## Approfondissements

- [[merkle-tree.fr|Les arbres de Merkle]] — voir comment combiner des empreintes
- [[document-timestamping.fr|L’horodatage de documents]] — comprendre une preuve d’existence

- [[secondary-bitcoin-collision-resistance.fr|La résistance aux collisions]].
- [[secondary-bitcoin-cryptographic-commitment.fr|Les engagements cryptographiques]].
- [[secondary-bitcoin-hash160.fr|La fonction HASH160]].
- [[secondary-bitcoin-message-integrity.fr|L’intégrité d’un message]].
- [[secondary-bitcoin-pedersen-commitment.fr|Les engagements de Pedersen]].
- [[secondary-bitcoin-preimage-resistance.fr|La résistance à la préimage]].
- [[secondary-bitcoin-sha-256.fr|SHA-256 et la preuve de travail]].

## Références

- [NIST — propriétés d’une fonction de hachage cryptographique](https://csrc.nist.gov/glossary/term/cryptographic_hash_function).
