---
type: "project_note"
id: "alice-explorer"
title: "Understanding Explorer"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["alice-app", "privacy"]
aliases: ["explorateur d’Alice", "Comprendre Explorer"]
parent_ids: []
related_ids: ["alice-app-overview", "alice-learn", "alice-playground", "alice-offline-limits", "spark-trust-and-exits", "ark-implementations-bark-arkade"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["alice-repo:apps/app-web/src/components/ExplorerPanel.tsx", "alice-repo:apps/app-web/src/components/ExplorerIntroModal.tsx", "alice-repo:apps/app-web/src/lib/explorer/networks.ts", "alice-repo:apps/app-web/src/lib/explorer/provider.ts", "alice-repo:apps/app-web/src/lib/explorer/heuristics.ts"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Understanding Explorer

## Questions covered

- What can be observed in Explorer?
- Do its privacy indicators prove who owns bitcoins?

## Short answer

Explorer lets you look up blocks, transactions and addresses, then follow their relationships. It also shows privacy indicators. It can be used without asking the AI for an analysis.

## Explanation

On Bitcoin, a transaction shows inputs, outputs and, depending on the available data, its fees and its confirmation. An address lets you view the activity that is accessible from the chosen provider.

The Liquid, Arkade, Bark and Spark views show different information. Some of it comes from a chain, some from services or operators of those layers. Their coverage is therefore not identical to Bitcoin's.

The privacy indicators look in particular for address reuse or for an output likely to be the change. They help you understand what an observer could infer.

## Limits and confusions

An indicator computed by a reproducible rule sometimes remains a hypothesis. It does not prove a person's identity, nor common ownership of all the funds involved. Recent data requires a connection and depends on the information accessible to the provider. A confidential amount may remain unknown.

## Further reading

- [[alice-app-overview.en|Finding your way around Alice App]].
- [[alice-learn.en|Learning with Learn]].
- [[alice-playground.en|The Alice App playground wallet]].
- [[alice-offline-limits.en|The limits of offline mode]].
- [[spark-trust-and-exits.en|Spark, operators and exits to Bitcoin]].
- [[ark-implementations-bark-arkade.en|Ark, Bark and Arkade, understanding the differences]].

## References

- Interface `alice-repo:apps/app-web/src/components/ExplorerPanel.tsx` and `alice-repo:apps/app-web/src/components/ExplorerIntroModal.tsx`.
- Networks and data `alice-repo:apps/app-web/src/lib/explorer/networks.ts` and `alice-repo:apps/app-web/src/lib/explorer/provider.ts`.
- Indicators `alice-repo:apps/app-web/src/lib/explorer/heuristics.ts`.
- Private product references, version tracked in the provenance registry.
