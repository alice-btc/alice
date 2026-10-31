---
type: "project_note"
id: "channel-closure"
title: "Closing a channel"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Channel Closure", "Fermer un canal"]
parent_ids: []
related_ids: ["lightning-force-close", "lightning-node-backup", "secondary-lightning-static-channel-backup"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB lnp201 — Lightning Network Theory"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Closing a channel

## Questions covered

- How do the funds come back on-chain?

## Short answer

Closing a Lightning channel settles its funds on the Bitcoin chain. A cooperative close relies on the participants' agreement; a unilateral close broadcasts a commitment without obtaining that agreement at the same time.

## Explanation

During the life of the channel, the participants update the distribution of funds off-chain. Closing turns that settlement into Bitcoin outputs usable according to the applicable rules and delays. On-chain fees therefore become directly important again.

If the participants cooperate, they can negotiate the close. If a peer stops responding, the other has a unilateral recourse based on their channel transactions and data. Broadcasting an old revoked state is another case, which triggers the protection mechanisms against cheating.

## Limits and confusions

A force close is not in itself an attempt at theft. It may be necessary to recover funds when a peer is unavailable. It can, however, impose a delay and additional transactions.

The total capacity of the channel does not go to 1 single participant. The settlement depends on each one's share, on in-flight payments and on fees. To recover a channel, follow the software's procedure rather than restoring an old database at random.

## Further reading

- [[lightning-force-close.en|Force closing]] — understand the unilateral recourse
- [[lightning-node-backup.en|Lightning backups]] — prepare a recovery suited to the software

- [[secondary-lightning-static-channel-backup.en|LND's static channel backup]].

## References

- PlanB lnp201 — Lightning Network Theory (reference from the source note, not re-consulted directly for this adaptation).
