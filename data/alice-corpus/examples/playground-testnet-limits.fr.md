---
type: "project_note"
id: "playground-testnet-limits"
title: "Ce que le playground permet de tester"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["alice-app", "learning"]
aliases: ["Mutinynet", "réseau de test"]
parent_ids: ["alice-playground"]
related_ids: []
reviewed_at: "2026-10-11"
review_due: null
sources: ["alice-repo:apps/app-web/src/lib/playground.ts", "alice-repo:packages/practice-wallet/src/practice-keys.ts", "https://github.com/MutinyWallet/mutiny-net", "https://github.com/bitcoin/bips/blob/master/bip-0325.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki", "https://github.com/bitcoin/bitcoin/blob/master/src/kernel/chainparams.cpp"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Ce que le playground permet de tester

## Questions couvertes

- Si un paiement marche sur Mutinynet, fonctionnera-t-il de la même façon sur mainnet ?
- Le préfixe d’adresse suffit-il pour identifier le réseau ?

## Réponse courte

Le playground permet de pratiquer un parcours de transaction sur un réseau de test. Il ne garantit pas les mêmes frais, délais ou conditions d’utilisation sur mainnet.

## Explication

Mutinynet est un signet personnalisé, un réseau de test où les blocs doivent porter les signatures autorisées par sa configuration. Sa documentation annonce une cadence d’environ 30 secondes par bloc, contre environ 10 minutes en moyenne sur Bitcoin mainnet. Cela ne garantit pas une confirmation dans les 30 secondes. Ses sats sont destinés aux essais et n’ont pas de valeur monétaire.

Pour les formats usuels, les préfixes distinguent mainnet (`bc1`, `1`, `3`) des réseaux de test (`tb1`, `m`, `n`, `2`). En revanche, plusieurs réseaux de test partagent leurs préfixes. Une adresse `tb1` ne suffit donc pas à identifier Mutinynet ; il faut vérifier le réseau choisi et le service interrogé.

Le playground dépend d’une infrastructure tierce pour consulter et diffuser les transactions. Une indisponibilité de ces services peut interrompre l’exercice, sans signifier une panne de Bitcoin mainnet.

## Limites et confusions

Un résultat observé sur Mutinynet reste un résultat de test. Les frais, la cadence des blocs, les conditions de validation et la disponibilité des services peuvent différer de mainnet. Réussir un paiement ici ne suffit pas à prévoir ses conditions sur le réseau principal.

## Approfondissements

- [[alice-playground.fr|Le wallet playground d’Alice App]] (alice-playground) pour revenir au périmètre de l’espace de pratique.

## Références

- Référence du produit `alice-repo:apps/app-web/src/lib/playground.ts`. Voir le registre privé de provenance.
- Référence du produit `alice-repo:packages/practice-wallet/src/practice-keys.ts`. Voir le registre privé de provenance.

- [Mutinynet, signet personnalisé et cadence annoncée de 30 secondes](https://github.com/MutinyWallet/mutiny-net).

- [BIP325, règles des signets](https://github.com/bitcoin/bips/blob/master/bip-0325.mediawiki).

- [BIP173, préfixes Bech32 des réseaux](https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki).

- [Bitcoin Core, paramètres et préfixes des réseaux](https://github.com/bitcoin/bitcoin/blob/master/src/kernel/chainparams.cpp).
