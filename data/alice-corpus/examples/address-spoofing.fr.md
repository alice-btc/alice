---
type: "project_note"
id: "address-spoofing"
title: "La substitution d’adresse"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["security"]
aliases: ["Address Spoofing"]
parent_ids: []
related_ids: ["hardware-wallet", "bitcoin-uri", "phishing-and-social-engineering"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://trezor.io/guides/trezor-devices/trezor-fundamentals/trezor-s-trusted-display-verify-every-address-on-your-device", "https://arxiv.org/abs/2501.16681", "https://arxiv.org/abs/2108.14004"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La substitution d’adresse

## Questions couvertes

- Pourquoi vérifier l’adresse de destination ?

## Réponse courte

La substitution d’adresse détourne un paiement vers une destination contrôlée par un attaquant. Une adresse qui ressemble à une autre n’est pas une preuve qu’elle appartient au destinataire voulu.

## Explication

Un logiciel malveillant peut remplacer le contenu du presse-papiers. Un autre mécanisme consiste à faire apparaître une adresse ressemblante dans un historique, dans l’espoir qu’elle soit recopiée. Ces attaques sont distinctes et ne se résolvent pas simplement en changeant souvent d’adresse.

Avec un hardware wallet, son écran sert de référence pour ce qui sera signé. Il faut comparer l’adresse entière et le montant à des informations obtenues de manière fiable auprès du destinataire, pas seulement aux caractères visibles sur l’ordinateur.

## Limites et confusions

L’appareil ne devine pas l’intention humaine. Une mauvaise adresse confirmée sur son écran reste une mauvaise destination. Les études citées dans la note source ne mesurent pas toutes la fréquence de ces attaques sur Bitcoin ; leurs résultats ne doivent pas être transposés comme des statistiques Bitcoin.

## Approfondissements

- [[hardware-wallet.fr|Le rôle d’un appareil de signature]].
- [[bitcoin-uri.fr|Les demandes de paiement et QR codes]].
- [[phishing-and-social-engineering.fr|Les faux supports et le phishing]].

## Références

- [Référence publique conservée de la note source](https://trezor.io/guides/trezor-devices/trezor-fundamentals/trezor-s-trusted-display-verify-every-address-on-your-device).
- [Référence publique conservée de la note source](https://arxiv.org/abs/2501.16681).
- [Référence publique conservée de la note source](https://arxiv.org/abs/2108.14004).
