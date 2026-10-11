---
type: "project_note"
id: "bitcoin-uri"
title: "Les demandes de paiement et QR codes"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Bitcoin URI"]
parent_ids: []
related_ids: ["bitcoin-address", "address-spoofing", "hardware-wallet"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bips/blob/master/bip-0321.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les demandes de paiement et QR codes

## Questions couvertes

- Que contient un QR code de paiement Bitcoin ?

## Réponse courte

Une URI Bitcoin est un lien de demande de paiement, souvent placé dans un QR code. Elle peut transmettre une adresse, un montant et des informations complémentaires au portefeuille.

## Explication

La forme simple commence par bitcoin:. Un montant indiqué dans le paramètre amount s’exprime en BTC, avec un point décimal. Le lien évite de saisir chaque champ séparément ; le portefeuille interprète ensuite les instructions qu’il prend en charge.

Les notes corrigées distinguent BIP21, le format historique, et BIP321, qui précise notamment des instructions complémentaires et les formats modernes. Un standard documenté ne signifie pas que toutes ses possibilités fonctionnent dans tous les portefeuilles.

## Limites et confusions

Scanner un QR code ne prouve pas que son contenu est honnête. Le lien prépare une demande ; il ne remplace pas la vérification de la destination, du montant et des frais avant signature. Un nom ou un message dans le lien ne certifie pas l’identité du destinataire. Avec un hardware wallet, les informations de l’appareil doivent être confrontées à une destination connue de manière fiable.

## Approfondissements

- [[bitcoin-address.fr|Comprendre une adresse Bitcoin]].
- [[address-spoofing.fr|La substitution d’adresse]].
- [[hardware-wallet.fr|Le rôle d’un appareil de signature]].

## Références

- [Référence publique conservée de la note source](https://github.com/bitcoin/bips/blob/master/bip-0321.mediawiki).
- [Référence publique conservée de la note source](https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki).
