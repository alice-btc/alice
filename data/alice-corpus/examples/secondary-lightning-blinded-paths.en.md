---
type: "project_note"
id: "secondary-lightning-blinded-paths"
title: "Blinded paths on Lightning"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Blinded Paths", "Les chemins aveuglés sur Lightning"]
parent_ids: ["bolt12-offers", "lightning-privacy-tradeoff"]
related_ids: ["bolt12-offers", "lightning-privacy-tradeoff"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro101 — Bitcoin Development Fundamentals"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Blinded paths on Lightning

## Questions covered

- How can the path to the recipient of a Lightning payment be hidden?

## Short answer

Blinded paths hide part of the path to the recipient in order to improve receiver privacy on Lightning.

## Explanation

- The sender does not necessarily know the exact final node.
- Each intermediary keeps a limited view of the routing.
- They are useful for BOLT12 and for more private payments.
- They mainly address the recipient's privacy.

## Limits and confusions

Hiding a path does not remove every timing, amount or network clue.

## Further reading

- [[bolt12-offers.en|BOLT12 offers]] — to go back to the basic notion.
- [[lightning-privacy-tradeoff.en|Privacy on Lightning]] — to go back to the basic notion.

## References

- PlanB pro101 — Bitcoin Development Fundamentals
