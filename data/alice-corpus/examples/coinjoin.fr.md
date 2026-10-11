---
type: "project_note"
id: "coinjoin"
title: "Comprendre CoinJoin"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["CoinJoin"]
parent_ids: []
related_ids: ["common-input-ownership-heuristic", "coin-control", "payjoin", "secondary-bitcoin-blind-signatures", "secondary-bitcoin-joinmarket", "secondary-bitcoin-privacy-by-obfuscation"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc204 — Privacy on Bitcoin", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Comprendre CoinJoin

## Questions couvertes

- Que fait un CoinJoin et que ne garantit-il pas ?

## Réponse courte

Un CoinJoin est une transaction construite par plusieurs participants. Il vise à rendre moins certaine l’association entre leurs entrées et leurs sorties, sans cacher l’existence de la transaction.

## Explication

La structure Bitcoin permet de réunir plusieurs entrées et sorties avec les autorisations nécessaires. Selon le protocole, certaines sorties présentent des caractéristiques communes qui rendent l’interprétation plus ambiguë. L’hypothèse selon laquelle toutes les entrées ont un propriétaire unique peut alors être fausse.

Les modalités de coordination, les frais et la confidentialité varient selon l’implémentation. Les usages ultérieurs des fonds peuvent aussi recréer des liens ; la transaction collaborative ne réinitialise pas magiquement tout l’historique.

## Limites et confusions

CoinJoin ne garantit pas un anonymat absolu et ne supprime pas les montants ni les transactions de la chaîne. Il ne faut pas confondre ce principe avec un service qui reçoit les fonds en garde et promet de les rendre. La disponibilité actuelle et les propriétés d’un produit précis exigent une vérification séparée ; les noms historiques de la source ne sont pas des recommandations.

## Approfondissements

- [[common-input-ownership-heuristic.fr|L’hypothèse des entrées communes]].
- [[coin-control.fr|Choisir les fonds à dépenser]].
- [[payjoin.fr|Comprendre PayJoin]].

- [[secondary-bitcoin-blind-signatures.fr|Les signatures aveugles]].
- [[secondary-bitcoin-joinmarket.fr|Le fonctionnement de JoinMarket]].
- [[secondary-bitcoin-privacy-by-obfuscation.fr|La confidentialité par ambiguïté des liens]].

## Références

- PlanB btc204 — Privacy on Bitcoin.
- PlanB Extraction — 2026-05-23.
