---
type: "project_note"
id: "secondary-bitcoin-privacy-by-obfuscation"
title: "Privacy through ambiguous links"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Privacy by Obfuscation", "La confidentialité par ambiguïté des liens"]
parent_ids: ["coinjoin", "bitcoin-chain-analysis"]
related_ids: ["coinjoin", "bitcoin-chain-analysis"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro101 — Bitcoin Development Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Privacy through ambiguous links

## Questions covered

- How does a collaborative transaction complicate chain analysis?

## Short answer

Some privacy techniques make the link between inputs, outputs and users more ambiguous.

## Explanation

- A collaborative transaction can offer several plausible pairings between inputs and outputs.
- Choices of amounts or timing, or external identity information, can reduce that ambiguity.

## Limits and confusions

Observed ambiguity does not guarantee anonymity; outside metadata can re-establish a link.

## Further reading

- [[coinjoin.en|Understanding CoinJoin]] — back to the basic concept.
- [[bitcoin-chain-analysis.en|Chain analysis]] — back to the basic concept.

## References

- PlanB pro101 — Bitcoin Development Fundamentals
