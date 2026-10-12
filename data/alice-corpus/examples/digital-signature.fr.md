---
type: "project_note"
id: "digital-signature"
title: "La signature numérique"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Cryptographie et limites du protocole"]
aliases: ["Digital Signature", "PGP Signature Verification"]
parent_ids: []
related_ids: ["bitcoin-script", "encryption", "secondary-bitcoin-adaptor-signature", "secondary-bitcoin-deterministic-ecdsa-nonce", "secondary-bitcoin-ecdsa-signature", "secondary-bitcoin-elliptic-curve-cryptography", "secondary-bitcoin-message-authenticity", "secondary-bitcoin-schnorr-signature", "secondary-bitcoin-secp256k1", "secondary-bitcoin-wallet-as-identity"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La signature numérique

## Questions couvertes

- Comment prouver l’autorisation de dépenser sans révéler la clé ?

## Réponse courte

Une signature numérique permet de vérifier qu’une clé privée a autorisé des données précises, sans révéler cette clé. Dans Bitcoin, elle participe à la vérification des conditions de dépense.

## Explication

Le portefeuille prépare les informations à signer selon les règles de la transaction. La clé privée produit une signature ; les nœuds peuvent vérifier celle-ci à l’aide de la clé publique et des conditions correspondantes. Une signature invalide ne satisfait pas la condition qu’elle est censée remplir.

La signature relie donc une autorisation à un message, mais ne cache pas nécessairement ce message. Bitcoin emploie notamment ECDSA et Schnorr selon les types de dépense. Un utilisateur n’a pas besoin d’en maîtriser le calcul pour comprendre qu’il doit protéger la clé et vérifier ce qu’il autorise.

## Limites et confusions

Une signature valide ne prouve pas l’identité civile de la personne derrière la clé, son consentement éclairé ou la légitimité d’un destinataire. Un appareil compromis peut demander de signer une mauvaise opération.

Avec un hardware wallet, les informations affichées par l’appareil doivent être comparées à la demande fiable du destinataire. L’ordinateur peut transmettre une transaction différente de l’intention initiale ; l’appareil ne devine pas cette intention. Ne jamais partager une clé pour permettre une vérification de signature.

## Approfondissements

- [[bitcoin-script.fr|Les conditions de dépense]] — comprendre les conditions autorisant une dépense
- [[encryption.fr|Chiffrement et signature]] — distinguer signature et confidentialité

- [[secondary-bitcoin-adaptor-signature.fr|Les signatures adaptatrices]].
- [[secondary-bitcoin-deterministic-ecdsa-nonce.fr|Les nonces déterministes d’ECDSA]].
- [[secondary-bitcoin-ecdsa-signature.fr|Les signatures ECDSA dans Bitcoin]].
- [[secondary-bitcoin-elliptic-curve-cryptography.fr|La cryptographie sur courbes elliptiques]].
- [[secondary-bitcoin-message-authenticity.fr|L’authenticité d’un message]].
- [[secondary-bitcoin-schnorr-signature.fr|Les signatures Schnorr]].
- [[secondary-bitcoin-secp256k1.fr|La courbe secp256k1]].
- [[secondary-bitcoin-wallet-as-identity.fr|Le portefeuille comme moyen d’authentification]].

## Références

- PlanB cyp201 — Bitcoin Wallet Architecture (référence de la note source, non reconsultée directement pour cette adaptation).
