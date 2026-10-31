---
type: "project_note"
id: "lightning-force-close"
title: "Force closing"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Lightning Force Close", "La fermeture forcée"]
parent_ids: []
related_ids: ["lightning-node-backup", "watchtower", "secondary-lightning-commitment-transaction"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB lnp202 — Set up Your First Lightning Node"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Force closing

## Questions covered

- Why can a close impose a waiting period?

## Short answer

A force close publishes a commitment transaction of the channel on Bitcoin without the immediate cooperation of the other participant. It is a useful fallback, but its funds can remain locked during security delays.

## Explanation

The channel holds signed commitments that make it possible to return to the chain. Publishing a valid commitment does not assume that the peer agrees to a new close. After confirmation, some outputs can require a wait and additional recovery operations.

This mechanism is notably used when the peer no longer cooperates or in certain restore procedures. On-chain fees must be planned for and the necessary data must be available. The details of the delay and of the spends depend on the channel and the software.

## Limits and confusions

Forcing a close means neither recovering all funds instantly nor automatically losing ownership of them. The published transaction, its confirmations and the final availability of the outputs must be distinguished.

Publishing an old, revoked state can be dangerous and expose one to a penalty. An old copy of the database must therefore not be restarted as if it were up to date. A watchtower watches for certain cheating attempts, but does not replace a backup or every recovery step.

## Further reading

- [[lightning-node-backup.en|Lightning backups]] — avoiding dangerous restores
- [[watchtower.en|The role of a watchtower]] — understanding the monitoring of old states

- [[secondary-lightning-commitment-transaction.en|Lightning commitment transactions]].

## References

- PlanB lnp202 — Set up Your First Lightning Node (reference from the source note, not re-consulted directly for this adaptation).
