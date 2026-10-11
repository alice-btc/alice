---
type: "project_note"
id: "hardware-wallet"
title: "Le rôle d’un appareil de signature"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Hardware Wallet"]
parent_ids: []
related_ids: ["address-spoofing", "wallet-recovery-phrase", "partially-signed-bitcoin-transaction", "secondary-bitcoin-attack-surface", "secondary-bitcoin-btcpay-hardware-wallet-integration"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://trezor.io/guides/trezor-devices/trezor-fundamentals/trezor-s-trusted-display-verify-every-address-on-your-device"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Le rôle d’un appareil de signature

## Questions couvertes

- Que protège un hardware wallet ?

## Réponse courte

Un hardware wallet est un appareil de signature qui isole les clés privées de l’ordinateur ou du téléphone utilisé pour préparer les paiements. Il réduit leur exposition aux logiciels malveillants de cet appareil hôte.

## Explication

Le portefeuille sur ordinateur prépare les données ; le hardware wallet affiche les informations qu’il va signer et demande une confirmation. Pour cette vérification, son écran doit servir de référence plutôt que celui du PC ou du téléphone.

L’adresse entière et le montant affichés sur l’appareil doivent être comparés aux informations du destinataire obtenues de manière fiable. Cette étape permet de repérer une substitution par l’ordinateur. L’appareil ne connaît pas l’intention de l’utilisateur et ne peut pas deviner qu’une adresse déjà fournie est frauduleuse.

## Limites et confusions

L’isolation ne rend pas le matériel ou son logiciel infaillible. La sauvegarde reste sensible et doit permettre la récupération si l’appareil est perdu. Un hardware wallet ne protège pas contre un secret volontairement communiqué, une mauvaise destination approuvée ou toutes les formes d’attaque physique. Il constitue une protection particulière dans une procédure plus large.

## Approfondissements

- [[address-spoofing.fr|La substitution d’adresse]].
- [[wallet-recovery-phrase.fr|La phrase de récupération]].
- [[partially-signed-bitcoin-transaction.fr|Préparer et signer une transaction avec PSBT]].

- [[secondary-bitcoin-attack-surface.fr|La surface d’attaque]].
- [[secondary-bitcoin-btcpay-hardware-wallet-integration.fr|Signer les dépenses BTCPay avec un appareil dédié]].

## Références

- [Référence publique conservée de la note source](https://trezor.io/guides/trezor-devices/trezor-fundamentals/trezor-s-trusted-display-verify-every-address-on-your-device).
