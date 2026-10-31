---
type: "project_note"
id: "alice-user-memory"
title: "Alice's personal memory"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Alice App and learning"]
aliases: ["docs/ALICE_USER_MEMORY.md", "La mémoire personnelle d’Alice"]
parent_ids: []
related_ids: ["alice-local-encryption", "alice-private-cloud"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["alice-repo:46e2e9da:docs/ALICE_USER_MEMORY.md"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Alice's personal memory

## Questions covered

- What does Alice's memory mean, and how is it distinguished from the Bitcoin corpus?

## Short answer

Alice's personal memory is used to adapt her explanations to preferences or to elements declared by the user. It is distinct from the Bitcoin knowledge corpus and from the conversation history.

## Explanation

The reviewed documentation distinguishes a memory of small personal facts from a learning profile by concept. This information adjusts the vocabulary, the prerequisites and the depth of the answer; it does not constitute evidence about Bitcoin and must not replace the current request.

The "What Alice remembers" screen lets you view, edit or delete items. Disabling personal memory is not the same as deleting conversations, nor as disabling every trace of learning. The deletion commands have different scopes.

## Limits and confusions

The filters try to exclude secrets, amounts and identifiers, but they can be wrong. Do not give Alice a recovery phrase or a private key while relying on this filter.

Local storage does not mean that the context always stays on the device. The selected items may accompany the request to the chosen engine; in Private Cloud, they travel in the encrypted body. In local mode, inference is local. This note describes the documentation at commit 46e2e9da, without a new functional test.

## Further reading

- [[alice-local-encryption.en|Local data in Alice App]] — understand local storage and its limits
- [[alice-private-cloud.en|Understanding Private Cloud mode]] — understand the path of the context that is sent

## References

- [User memory, documentation at commit 46e2e9da](alice-repo:46e2e9da:docs/ALICE_USER_MEMORY.md).
