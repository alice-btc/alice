---
type: "project_note"
id: "secondary-privacy-single-sign-on-risk"
title: "Dependence on a centralized login"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Single Sign-On Risk", "La dépendance à une connexion centralisée"]
parent_ids: ["threat-model", "two-factor-authentication"]
related_ids: ["threat-model", "two-factor-authentication"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB scu101 — Update Your Online Security"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Dependence on a centralized login

## Questions covered

- Dependence on a centralized login — what is the mechanism and what are its limits?

## Short answer

Single Sign-On simplifies access through a central provider, but creates a point of dependence and censorship: if the central account goes down, many services become vulnerable or inaccessible.

## Explanation

- It reduces the number of passwords but concentrates the risk.
- The provider's availability and policy become critical.
- For sensitive services, separate accounts, passkeys or hardware keys are worth evaluating.
- Tying one's entire digital identity to a single actor is best avoided.

## Limits and confusions

The concentration of access has to be weighed against the possible advantages of well-protected centralized authentication. Poorly secured separate accounts are not automatically safer.

## Further reading

- [[threat-model.en|Matching protection to risks]] — to place this mechanism in context.
- [[two-factor-authentication.en|Two-factor authentication]] — to place this mechanism in context.

## References

- PlanB scu101 — Update Your Online Security
