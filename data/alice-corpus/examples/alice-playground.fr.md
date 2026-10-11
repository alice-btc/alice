---
type: "project_note"
id: "alice-playground"
title: "Le wallet playground d’Alice App"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["alice-app", "learning"]
aliases: ["playground", "wallet de test"]
parent_ids: []
related_ids: ["playground-testnet-limits", "alice-app-overview", "alice-offline-limits"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["alice-repo:apps/app-web/src/lib/playground.ts", "alice-repo:packages/practice-wallet/src/practice-keys.ts", "https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki", "https://github.com/MutinyWallet/mutiny-net"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Le wallet playground d’Alice App

## Questions couvertes

- À quoi sert le wallet playground d’Alice App ?
- Est-ce que j’y utilise de vrais bitcoins ?

## Réponse courte

Le wallet playground est l’espace de pratique d’Alice App. Il sert à expérimenter des opérations on-chain avec des sats de test sur Mutinynet.

## Explication

On peut y découvrir la préparation, la signature et la diffusion d’un paiement on-chain, puis consulter le solde, les UTXO et l’historique sur le réseau de test.

Le playground crée sur place sa propre phrase de récupération BIP39 de 12 mots. Le parcours actuel ne propose pas d’importer une phrase existante. La sauvegarde de ces mots fait partie de l’exercice ; ils contrôlent ce portefeuille de pratique. Les sats de test ne sont pas des bitcoins mainnet.

## Limites et confusions

Ne jamais saisir la phrase d’un portefeuille contenant des fonds réels dans un outil de test, un site ou une conversation. Le playground ne démontre pas à lui seul le comportement des frais ou délais du réseau principal.

## Approfondissements

- [[playground-testnet-limits.fr|Ce que le playground permet de tester]] (playground-testnet-limits) pour comprendre ce qu’une expérience de test permet de conclure.
- [[alice-app-overview.fr|Se repérer dans Alice App]].
- [[alice-offline-limits.fr|Les limites du mode hors ligne]].

## Références

- Référence du produit `alice-repo:apps/app-web/src/lib/playground.ts`. Voir le registre privé de provenance.
- Référence du produit `alice-repo:packages/practice-wallet/src/practice-keys.ts`. Voir le registre privé de provenance.

- [BIP39, phrases de récupération](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki).

- [Mutinynet, réseau et infrastructure de test](https://github.com/MutinyWallet/mutiny-net).
