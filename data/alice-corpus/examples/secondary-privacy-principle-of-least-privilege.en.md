---
type: "project_note"
id: "secondary-privacy-principle-of-least-privilege"
title: "Limiting application permissions"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Principle of Least Privilege", "Limiter les droits des applications"]
parent_ids: ["threat-model", "malware"]
related_ids: ["threat-model", "malware"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB scu202 — Improve Your Personal Digital Security", "PlanB scu101 — Update Your Online Security"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Limiting application permissions

## Questions covered

- Limiting application permissions — what is the mechanism and what are its limits?

## Short answer

The principle of least privilege consists of giving each user, application or service only the permissions needed for its task. It limits the damage when an account, piece of software or process is compromised.

## Explanation

- Avoiding daily use of an administrator account reduces risk.
- Separating sessions or profiles limits the spread of an incident.
- Application permissions need to be reviewed regularly.
- The principle applies to operating systems, smartphones, browsers, servers and networks.

## Limits and confusions

Limiting permissions reduces the possible impact of a compromise; it does not make hostile software harmless or an administrator session impossible to attack.

## Further reading

- [[threat-model.en|Matching protection to risks]] — to place this mechanism in context.
- [[malware.en|Malware]] — to place this mechanism in context.

## References

- PlanB scu202 — Improve Your Personal Digital Security
- PlanB scu101 — Update Your Online Security
