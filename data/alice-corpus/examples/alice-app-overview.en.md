---
type: "project_note"
id: "alice-app-overview"
title: "Finding your way around Alice App"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["alice-app", "learning"]
aliases: ["les espaces d’Alice", "navigation dans Alice", "Se repérer dans Alice App"]
parent_ids: []
related_ids: ["alice-explorer", "alice-learn", "alice-playground", "alice-offline-limits"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["alice-repo:apps/app-web/src/components/Sidebar.tsx", "alice-repo:apps/app-web/src/components/ExplorerPanel.tsx", "alice-repo:apps/app-web/src/components/LearnPanel.tsx", "alice-repo:apps/app-web/src/lib/playground.ts", "alice-repo:apps/app-web/src/components/settings/AiTab.tsx"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Finding your way around Alice App

## Questions covered

- What are Chat, Explorer, Learn and Playground for?
- Where to start when discovering Bitcoin with Alice?

## Short answer

Alice App offers 4 complementary spaces. Chat is for asking questions, Explorer for observing data, Learn for following courses and Playground for practising with test sats.

## Explanation

In Chat, you talk with the assistant to ask for an explanation or to go deeper into a concept.

Explorer lets you search for transactions, addresses or blocks, and observe certain privacy indicators. AI guidance there is optional.

Learn gathers courses and tutorials, with chapters, quizzes when they are available and progress tracking. You can ask Alice to clarify a passage.

Playground offers a practice wallet on Mutinynet. It lets you discover on-chain operations without using bitcoins from the main network.

## Limits and confusions

The features do not all have the same connectivity needs. Having a local AI does not make recent chain data available offline. An answer from the assistant may also need to be verified.

## Further reading

- [[alice-explorer.en|Understanding Explorer]].
- [[alice-learn.en|Learning with Learn]].
- [[alice-playground.en|The Alice App playground wallet]].
- [[alice-offline-limits.en|The limits of offline mode]].

## References

- Navigation `alice-repo:apps/app-web/src/components/Sidebar.tsx`.
- Spaces `alice-repo:apps/app-web/src/components/ExplorerPanel.tsx`, `alice-repo:apps/app-web/src/components/LearnPanel.tsx` and `alice-repo:apps/app-web/src/lib/playground.ts`.
- AI `alice-repo:apps/app-web/src/components/settings/AiTab.tsx`.
- Private product references, version tracked in the provenance registry.
