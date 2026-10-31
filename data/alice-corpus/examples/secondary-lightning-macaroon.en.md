---
type: "project_note"
id: "secondary-lightning-macaroon"
title: "LND's macaroon access tokens"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Macaroon", "Les jetons d’accès macaroon de LND"]
parent_ids: ["threat-model", "lightning-node-online-status"]
related_ids: ["threat-model", "lightning-node-online-status"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB lnp202 — Set up Your First Lightning Node"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# LND's macaroon access tokens

## Questions covered

- LND's macaroon access tokens — what is the mechanism and what are its limits?

## Short answer

In LND, a macaroon is a token that authorizes certain operations on the node. An application that holds it can exercise the rights it has been granted.

## Explanation

- The rights should match only the operations that are needed.
- An admin token gives far broader powers than read-only access.
- Budgets or other restrictions need to be checked in the mechanism in use, not assumed to be universal.
- The token needs to be transmitted and stored as an access secret.

## Limits and confusions

A macaroon is not a recovery phrase. Some rights nonetheless allow payments to be triggered; the token has to be protected and its permissions limited.

## Further reading

- [[threat-model.en|Matching protection to risks]] — to place this mechanism in context.
- [[lightning-node-online-status.en|Node availability]] — to place this mechanism in context.

## References

- PlanB lnp202 — Set up Your First Lightning Node
