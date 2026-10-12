---
type: "project_note"
id: "entropy"
title: "L’aléa nécessaire aux clés"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Cryptographie et limites du protocole"]
aliases: ["Entropy"]
parent_ids: []
related_ids: ["digital-signature", "cryptographic-hash-function", "secondary-bitcoin-deterministic-ecdsa-nonce", "secondary-bitcoin-pseudorandom-number-generator", "secondary-bitcoin-random-number-generation"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki", "https://coldcard.com/docs/verifying-dice-roll-math/"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# L’aléa nécessaire aux clés

## Questions couvertes

- Pourquoi les clés ne doivent-elles pas être prévisibles ?

## Réponse courte

L’entropie désigne l’imprévisibilité nécessaire pour produire des secrets difficiles à deviner. Une clé ou une phrase longue mais prévisible peut être beaucoup moins sûre qu’elle n’en a l’air.

## Explication

Un portefeuille doit employer un générateur cryptographiquement adapté. Celui-ci peut combiner des mécanismes logiciels ou matériels ; la présence d’une puce ne garantit pas à elle seule un bon aléa.

Dans BIP39, la phrase encode de 128 à 256 bits d’entropie, par multiples de 32, avec un contrôle d’erreur. Ce contrôle aide à détecter certaines erreurs, mais n’ajoute pas de secret imprévisible. Choisir soi-même des mots qui paraissent originaux n’est pas une méthode sûre de génération.

## Limites et confusions

Allonger une phrase connue ou une suite répétitive n’apporte pas automatiquement plus d’entropie. La sécurité dépend de la façon dont le secret a été produit, pas simplement de son aspect.

Des dés peuvent participer à certaines procédures documentées, à condition d’avoir suffisamment de tirages indépendants et non biaisés ainsi qu’une conversion correcte. Il faut suivre la procédure vérifiée du logiciel, sans improviser un nombre de lancers. Alice ne doit jamais demander la phrase produite pour en « vérifier » la qualité.

## Approfondissements

- [[digital-signature.fr|La signature numérique]] — relier le secret à l’autorisation de dépense
- [[cryptographic-hash-function.fr|L’empreinte cryptographique]] — distinguer imprévisibilité et empreinte

- [[secondary-bitcoin-deterministic-ecdsa-nonce.fr|Les nonces déterministes d’ECDSA]].
- [[secondary-bitcoin-pseudorandom-number-generator.fr|Les générateurs pseudo-aléatoires cryptographiques]].
- [[secondary-bitcoin-random-number-generation.fr|La génération de secrets aléatoires]].

## Références

- [BIP39 — entropie, checksum et distinction avec les phrases inventées](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki).
- [Coldcard — vérification et conditions de sa procédure avec des dés](https://coldcard.com/docs/verifying-dice-roll-math/).
