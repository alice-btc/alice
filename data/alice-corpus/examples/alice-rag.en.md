---
type: "project_note"
id: "alice-rag"
title: "The knowledge Alice consults"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Alice App and learning"]
aliases: ["docs/RAG_EVALUATION.md", "Les connaissances consultées par Alice"]
parent_ids: []
related_ids: ["alice-app-overview", "alice-user-memory"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["alice-repo:46e2e9da:docs/RAG_EVALUATION.md"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The knowledge Alice consults

## Questions covered

- Why can an answer cite knowledge from the corpus?

## Short answer

RAG lets Alice search for passages in a documentary corpus before answering. It helps provide relevant context to the model, but does not guarantee that the answer will be correct.

## Explanation

Retrieval and writing are distinct steps. Alice can find the right note and still summarize it badly, omit a condition or invent a link between several passages. Evaluation must therefore check both the documents retained and the content produced.

The documentation at commit 46e2e9da describes question sets that separate development from acceptance. Automatic verdicts are a reproducible indicator according to the method used, not an exhaustive human validation. The results of one version and one model should not be attributed automatically to others.

## Limits and confusions

The corpus prepared with a core set and deeper notes expresses a documentary policy. Its presence in files does not prove that the active engine imports it, nor that it already applies the 2-level routing.

Alice must present sources as supporting material to be examined and keep their limits. A secondary note is not less true by definition; it is consulted to bring a useful detail without cluttering an introductory answer. The right passage must remain accessible as soon as a question requires it.

## Further reading

- [[alice-app-overview.en|Finding your way around Alice App]] — situate Alice's educational role
- [[alice-user-memory.en|Alice's personal memory]] — distinguish knowledge from personalization

## References

- [RAG evaluation at commit 46e2e9da](alice-repo:46e2e9da:docs/RAG_EVALUATION.md).
