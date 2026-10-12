---
type: "project_note"
id: "alice-explorer"
title: "Comprendre Explorer"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["alice-app", "privacy"]
aliases: ["explorateur d’Alice"]
parent_ids: []
related_ids: ["alice-app-overview", "alice-learn", "alice-playground", "alice-offline-limits", "spark-trust-and-exits", "ark-implementations-bark-arkade"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["alice-repo:apps/app-web/src/components/ExplorerPanel.tsx", "alice-repo:apps/app-web/src/components/ExplorerIntroModal.tsx", "alice-repo:apps/app-web/src/lib/explorer/networks.ts", "alice-repo:apps/app-web/src/lib/explorer/provider.ts", "alice-repo:apps/app-web/src/lib/explorer/heuristics.ts"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Comprendre Explorer

## Questions couvertes

- Que peut-on observer dans Explorer ?
- Ses indices de confidentialité prouvent-ils qui possède des bitcoins ?

## Réponse courte

Explorer permet de consulter des blocs, transactions et adresses, puis de suivre leurs relations. Il présente aussi des indices de confidentialité. On peut l’utiliser sans demander une analyse à l’IA.

## Explication

Sur Bitcoin, une transaction montre des entrées, des sorties et, selon les données disponibles, ses frais et sa confirmation. Une adresse permet de consulter son activité accessible auprès du fournisseur choisi.

Les vues Liquid, Arkade, Bark et Spark montrent des informations différentes. Certaines viennent d’une chaîne, d’autres de services ou d’opérateurs de ces couches. Leur couverture n’est donc pas identique à celle de Bitcoin.

Les indices de confidentialité cherchent notamment des réutilisations d’adresses ou une sortie susceptible d’être la monnaie rendue. Ils aident à comprendre ce qu’un observateur pourrait inférer.

## Limites et confusions

Un indice calculé selon une règle reproductible reste parfois une hypothèse. Il ne prouve pas l’identité d’une personne ni la propriété commune de tous les fonds concernés. Les données récentes nécessitent une connexion et dépendent des informations accessibles au fournisseur. Un montant confidentiel peut rester inconnu.

## Approfondissements

- [[alice-app-overview.fr|Se repérer dans Alice App]].
- [[alice-learn.fr|Apprendre avec Learn]].
- [[alice-playground.fr|Le wallet playground d’Alice App]].
- [[alice-offline-limits.fr|Les limites du mode hors ligne]].
- [[spark-trust-and-exits.fr|Spark, opérateurs et sorties vers Bitcoin]].
- [[ark-implementations-bark-arkade.fr|Ark, Bark et Arkade, comprendre les différences]].

## Références

- Interface `alice-repo:apps/app-web/src/components/ExplorerPanel.tsx` et `alice-repo:apps/app-web/src/components/ExplorerIntroModal.tsx`.
- Réseaux et données `alice-repo:apps/app-web/src/lib/explorer/networks.ts` et `alice-repo:apps/app-web/src/lib/explorer/provider.ts`.
- Indices `alice-repo:apps/app-web/src/lib/explorer/heuristics.ts`.
- Références produit privées, version suivie dans le registre de provenance.
