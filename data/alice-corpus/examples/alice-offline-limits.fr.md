---
type: "project_note"
id: "alice-offline-limits"
title: "Les limites du mode hors ligne"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["alice-app", "learning"]
aliases: ["Alice sans connexion", "fonctionnement hors ligne"]
parent_ids: []
related_ids: ["alice-app-overview", "alice-explorer", "alice-learn", "alice-playground"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["alice-repo:apps/app-web/src/components/settings/AiTab.tsx", "alice-repo:apps/app-web/src/lib/explorer/provider.ts", "alice-repo:apps/app-web/src/lib/explorer/networks.ts", "alice-repo:apps/app-web/src/lib/learn/packs.ts", "alice-repo:apps/app-web/src/lib/learn/packs-base.ts", "alice-repo:apps/app-web/src/lib/learn/language-downloads.ts", "alice-repo:apps/app-web/src/lib/playground.ts"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Les limites du mode hors ligne

## Questions couvertes

- Quelles fonctions nécessitent encore une connexion ?
- Une IA locale permet-elle de tout faire hors ligne ?

## Réponse courte

L’absence de connexion n’a pas le même effet sur chaque fonction. Des contenus déjà présents et une IA locale prête peuvent rester utilisables dans une application compatible. Les services distants, les données récentes et la diffusion des paiements nécessitent le réseau.

## Explication

L’IA locale dépend d’une application équipée et d’un modèle disponible. L’onglet navigateur ne propose pas cette IA locale. L’IA cloud demande une connexion.

Dans Learn, le français et l’anglais sont prévus comme contenus embarqués. Les autres langues peuvent venir d’une source distante. Leur téléchargement tente de récupérer les fichiers, mais ne garantit pas leur conservation complète hors ligne.

Explorer doit joindre ses fournisseurs pour obtenir des données récentes. Une donnée déjà consultée ne garantit pas l’accès à tout l’historique ni une information à jour.

Dans Playground, certains calculs et la signature sont locaux. Le parcours d’envoi peut néanmoins demander des informations du réseau ; actualiser les fonds, obtenir des sats au faucet et diffuser une transaction nécessitent une connexion.

## Limites et confusions

« Local » ne signifie pas « tout disponible hors ligne ». Cette fiche décrit les dépendances observées dans le code ; elle ne certifie pas un fonctionnement complet hors ligne sur chaque appareil ou installation.

## Approfondissements

- [[alice-app-overview.fr|Se repérer dans Alice App]].
- [[alice-explorer.fr|Comprendre Explorer]].
- [[alice-learn.fr|Apprendre avec Learn]].
- [[alice-playground.fr|Le wallet playground d’Alice App]].

## Références

- IA `alice-repo:apps/app-web/src/components/settings/AiTab.tsx`.
- Explorer `alice-repo:apps/app-web/src/lib/explorer/provider.ts` et `alice-repo:apps/app-web/src/lib/explorer/networks.ts`.
- Learn `alice-repo:apps/app-web/src/lib/learn/packs.ts`, `alice-repo:apps/app-web/src/lib/learn/packs-base.ts` et `alice-repo:apps/app-web/src/lib/learn/language-downloads.ts`.
- Pratique `alice-repo:apps/app-web/src/lib/playground.ts`.
- Références produit privées, version suivie dans le registre de provenance.
