---
type: "project_note"
id: "watch-only-wallet"
title: "Observer sans pouvoir dépenser"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Watch-Only Wallet"]
parent_ids: []
related_ids: ["extended-public-key", "wallet-backup-test", "wallet-node-connection", "secondary-bitcoin-non-hardened-derivation"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Observer sans pouvoir dépenser

## Questions couvertes

- Peut-on suivre un portefeuille sans ses clés privées ?

## Réponse courte

Un portefeuille en lecture seule suit des adresses, des transactions et un solde sans posséder les clés privées nécessaires à la dépense. Il sépare l’observation de la signature.

## Explication

Il peut utiliser une clé publique étendue ou des descripteurs pour retrouver les sorties concernées. Cela permet de consulter les fonds sur un appareil connecté alors que les secrets restent ailleurs. Selon le logiciel, il peut aussi préparer des transactions à faire signer par un autre outil.

Cette séparation aide à organiser une conservation hors ligne, mais impose de savoir où se trouvent les moyens réels d’autorisation. Voir ses bitcoins ne signifie pas détenir les secrets qui permettent de les récupérer.

## Limites et confusions

Lecture seule n’est pas synonyme de données sans sensibilité. Les informations utilisées peuvent révéler beaucoup d’adresses et d’historique. Un écran de solde peut aussi être trompé si ses sources sont malveillantes. Un test de restauration limité à cet écran ne valide donc ni la capacité de signature ni nécessairement la vérification indépendante de la chaîne.

## Approfondissements

- [[extended-public-key.fr|La clé publique étendue]].
- [[wallet-backup-test.fr|Vérifier sa sauvegarde]].
- [[wallet-node-connection.fr|Relier un portefeuille à son nœud]].

- [[secondary-bitcoin-non-hardened-derivation.fr|La dérivation publique des clés enfants]].

## Références

- PlanB cyp201 — Bitcoin Wallet Architecture.
