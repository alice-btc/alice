---
type: "project_note"
id: "secondary-lightning-lightning-private-channel"
title: "Unannounced Lightning channels"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Lightning Private Channel", "Les canaux Lightning non annoncés"]
parent_ids: ["lightning-channel", "lightning-privacy-tradeoff"]
related_ids: ["lightning-channel", "lightning-privacy-tradeoff"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB lnp404 — Navigating Your Node with Terminal"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Unannounced Lightning channels

## Questions covered

- Unannounced Lightning channels — what is the mechanism and what are its limits?

## Short answer

An unannounced Lightning channel is not broadcast as a public channel in the routing graph. This reduces some of the information published, without guaranteeing that the channel stays secret.

## Explanation

- The channel can be used to send or receive depending on the routing information available.
- Route hints can help a payer reach the recipient.
- The absence of a public announcement is not a guarantee of anonymity.

## Limits and confusions

Unannounced does not mean invisible or known only to the 2 peers. Route hints, payments and chain analysis can reveal its existence.

## Further reading

- [[lightning-channel.en|Lightning channels]] — to place this mechanism in context.
- [[lightning-privacy-tradeoff.en|Privacy on Lightning]] — to place this mechanism in context.

## References

- PlanB lnp404 — Navigating Your Node with Terminal
