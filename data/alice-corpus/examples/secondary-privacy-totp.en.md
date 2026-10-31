---
type: "project_note"
id: "secondary-privacy-totp"
title: "TOTP authentication codes"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["privacy"]
aliases: ["TOTP", "Les codes d’authentification TOTP"]
parent_ids: ["two-factor-authentication"]
related_ids: ["two-factor-authentication"]
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
# TOTP authentication codes

## Questions covered

- TOTP authentication codes — what is the mechanism and what are its limits?

## Short answer

TOTP generates a temporary code from a shared secret and the current time. The service computes the expected codes to verify the one the user presents.

## Explanation

- The code is generated locally, with no delivery by SMS.
- Protecting the TOTP secret and the recovery methods remains essential.
- A separate authentication device can limit some exposure.
- TOTP does not benefit from the binding to the site that correctly used FIDO authentication offers.

## Limits and confusions

A TOTP code can be relayed by a phishing site in real time. Its backup has to be protected; a copy of the secret can generate the same codes.

## Further reading

- [[two-factor-authentication.en|Two-factor authentication]] — to place this mechanism in context.

## References

- PlanB scu101 — Update Your Online Security
