---
type: "project_note"
id: "alice-offline-limits"
title: "The limits of offline mode"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["alice-app", "learning"]
aliases: ["Alice sans connexion", "fonctionnement hors ligne", "Les limites du mode hors ligne"]
parent_ids: []
related_ids: ["alice-app-overview", "alice-explorer", "alice-learn", "alice-playground"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["alice-repo:apps/app-web/src/components/settings/AiTab.tsx", "alice-repo:apps/app-web/src/lib/explorer/provider.ts", "alice-repo:apps/app-web/src/lib/explorer/networks.ts", "alice-repo:apps/app-web/src/lib/learn/packs.ts", "alice-repo:apps/app-web/src/lib/learn/packs-base.ts", "alice-repo:apps/app-web/src/lib/learn/language-downloads.ts", "alice-repo:apps/app-web/src/lib/playground.ts"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The limits of offline mode

## Questions covered

- Which features still need a connection?
- Does a local AI make it possible to do everything offline?

## Short answer

Having no connection does not affect every feature in the same way. Content that is already present and a local AI that is ready can remain usable in a compatible application. Remote services, recent data and broadcasting payments require the network.

## Explanation

The local AI depends on an equipped application and an available model. The browser tab does not offer this local AI. The cloud AI requires a connection.

In Learn, French and English are planned as embedded content. Other languages may come from a remote source. Downloading them attempts to fetch the files, but does not guarantee that they are fully kept offline.

Explorer has to reach its providers to obtain recent data. Data that has already been viewed does not guarantee access to the whole history or to up-to-date information.

In Playground, some computations and signing are local. The sending flow may nevertheless request information from the network; refreshing funds, obtaining sats from the faucet and broadcasting a transaction require a connection.

## Limits and confusions

"Local" does not mean "everything available offline". This note describes the dependencies observed in the code; it does not certify full offline operation on every device or installation.

## Further reading

- [[alice-app-overview.en|Finding your way around Alice App]].
- [[alice-explorer.en|Understanding Explorer]].
- [[alice-learn.en|Learning with Learn]].
- [[alice-playground.en|The Alice App playground wallet]].

## References

- AI `alice-repo:apps/app-web/src/components/settings/AiTab.tsx`.
- Explorer `alice-repo:apps/app-web/src/lib/explorer/provider.ts` and `alice-repo:apps/app-web/src/lib/explorer/networks.ts`.
- Learn `alice-repo:apps/app-web/src/lib/learn/packs.ts`, `alice-repo:apps/app-web/src/lib/learn/packs-base.ts` and `alice-repo:apps/app-web/src/lib/learn/language-downloads.ts`.
- Practice `alice-repo:apps/app-web/src/lib/playground.ts`.
- Private product references, version tracked in the provenance registry.
