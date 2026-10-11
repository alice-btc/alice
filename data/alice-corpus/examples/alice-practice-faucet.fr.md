---
type: "project_note"
id: "alice-practice-faucet"
title: "Obtenir des sats de test"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Alice App et apprentissage"]
aliases: ["docs/test-wallet-faucet.md"]
parent_ids: []
related_ids: ["playground-testnet-limits", "alice-playground", "secondary-history-bitcoin-faucet"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["alice-repo:46e2e9da:docs/test-wallet-faucet.md"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Obtenir des sats de test

## Questions couvertes

- Comment fonctionne la distribution de sats pour s’entraîner ?

## Réponse courte

Le faucet d’Alice fournit des sats de test pour apprendre dans le wallet playground. Ces unités appartiennent au réseau Mutinynet et ne sont pas des bitcoins utilisables sur le réseau principal.

## Explication

Dans la version documentaire relue au commit 46e2e9da, Alice distribue 2 100 sats depuis son propre portefeuille de test. Elle ne relaie pas automatiquement une demande au faucet public. La distribution est limitée à 1 demande par installation et à 100 distributions par jour pour la plateforme.

Ces limites protègent la réserve et répartissent son usage. La limite par installation n’est pas une preuve d’identité ; la documentation précise qu’effacer les données peut renouveler cet identifiant. La disponibilité dépend aussi du financement et de la configuration du service.

## Limites et confusions

Si le service ne peut pas distribuer, le parcours prévu ouvre le faucet public Mutinynet avec l’adresse de test à utiliser. Ce repli ne garantit pas que ce service externe acceptera immédiatement la demande.

Ne jamais utiliser de fonds réels ni une phrase de récupération d’un portefeuille réel dans ce parcours. Le montant et les limites décrivent la version consultée ; cette adaptation n’a pas exécuté de distribution ni vérifié le service déployé.

## Approfondissements

- [[playground-testnet-limits.fr|Ce que le playground permet de tester]] — Limites du test — distinguer exercice et argent réel
- [[alice-playground.fr|Le wallet playground d’Alice App]] — se repérer dans le playground

- [[secondary-history-bitcoin-faucet.fr|Le faucet historique de Gavin Andresen]].

## Références

- [Documentation du faucet au commit 46e2e9da](alice-repo:46e2e9da:docs/test-wallet-faucet.md).
