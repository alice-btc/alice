---
type: "project_note"
id: "cashu-et-confiance-dans-le-mint"
title: "L’ecash et la confiance dans un mint"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Ark et autres couches"]
aliases: ["Cashu et confiance dans le mint"]
parent_ids: []
related_ids: ["fedimint-custody-and-privacy", "custodial-lightning-wallet", "secondary-bitcoin-blind-signatures", "secondary-bitcoin-digicash"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://docs.cashu.space/faq"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# L’ecash et la confiance dans un mint

## Questions couvertes

- Qui doit-on croire lorsqu’on utilise un mint Cashu ?

## Réponse courte

Cashu utilise des jetons numériques au porteur émis par un mint. Le wallet conserve ces jetons, tandis que le mint garde les bitcoins qui doivent permettre leur conversion en paiements.

## Explication

Les signatures aveugles limitent le rapprochement entre l’émission et la dépense des jetons. Cette propriété vise la confidentialité de l’ecash. Elle ne retire pas au mint la garde des BTC sous-jacents.

Chaque mint émet ses propres jetons. Pour passer de l’un à l’autre, il faut une conversion, par exemple via Lightning. La réception d’un jeton d’un mint donné expose donc au fonctionnement de ce mint, pas à une créance universellement interchangeable entre tous les opérateurs.

## Limites et confusions

Détenir les fichiers ou jetons dans son téléphone ne signifie pas contrôler les clés des bitcoins de réserve. Le mint peut être indisponible, insolvable ou refuser la conversion.

La confidentialité cryptographique ne cache pas automatiquement toutes les métadonnées réseau ou toutes les informations fournies au service. Il faut distinguer l’avantage des signatures aveugles du modèle de garde. Alice doit présenter l’ecash comme un compromis de paiement et de confidentialité, sans le qualifier de self-custody Bitcoin sur la seule présence locale des jetons.

## Approfondissements

- [[fedimint-custody-and-privacy.fr|Fedimint, garde fédérée et confidentialité]] — Fedimint — comparer avec un mint fédéré
- [[custodial-lightning-wallet.fr|La garde sur Lightning]] — comprendre la garde des fonds sous-jacents

- [[secondary-bitcoin-blind-signatures.fr|Les signatures aveugles]].
- [[secondary-bitcoin-digicash.fr|DigiCash avant Bitcoin]].

## Références

- [FAQ officielle Cashu](https://docs.cashu.space/faq).
