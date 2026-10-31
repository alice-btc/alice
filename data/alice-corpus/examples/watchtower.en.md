---
type: "project_note"
id: "watchtower"
title: "The role of a watchtower"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Watchtower", "Le rôle d’une watchtower"]
parent_ids: []
related_ids: ["lightning-force-close", "lightning-node-backup", "secondary-lightning-revocation-key"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB lnp201 — Lightning Network Theory"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The role of a watchtower

## Questions covered

- What is a watchtower for?

## Short answer

A watchtower monitors the chain to detect certain fraudulent publications of old Lightning channel states and to react within the expected time window. It complements the monitoring done by the user's node.

## Explanation

In the penalty channel model, publishing a revoked state can unduly favor one participant. The wronged party has a window in which to react. A watchtower receives the information required by the mechanism provided by the software and can step in when the user is not following the chain themselves.

It can be self-hosted or provided by a third party. Its availability, its compatibility and the way it receives updates matter. Using the service requires a suitable configuration, not just knowing its address.

## Limits and confusions

A watchtower is not a general insurance against every Lightning loss. It does not solve a lack of liquidity, a compromised wallet or the absence of a backup. Nor does it make an offline node able to route normally.

The service has to actually receive the relevant information and be able to act in time. The guarantees and the metadata exposed depend on the implementation. Absolute protection must not be promised on the strength of the name "watchtower" alone.

## Further reading

- [[lightning-force-close.en|Force closing]] — locate the moment when monitoring comes into play
- [[lightning-node-backup.en|Lightning backups]] — distinguish protection from backup

- [[secondary-lightning-revocation-key.en|Reacting to a revoked channel state]].

## References

- PlanB lnp201 — Lightning Network Theory (reference from the source note, not re-consulted directly for this adaptation).
