---
type: "project_note"
id: "secondary-lightning-static-channel-backup"
title: "LND's static channel backup"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Static Channel Backup", "La sauvegarde statique des canaux LND"]
parent_ids: ["lightning-node-backup", "channel-closure"]
related_ids: ["lightning-node-backup", "channel-closure"]
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
# LND's static channel backup

## Questions covered

- LND's static channel backup — what is the mechanism and what are its limits?

## Short answer

An LND Static Channel Backup keeps information that makes it possible to find the peers again and request a channel close after local data is lost. It is used to recover the funds on Bitcoin, not to resume the node as it was.

## Explanation

- It does not contain the full dynamic state of the channels.
- Recovery uses the backup information and the appropriate keys.
- Peers are asked to publish their closing transaction.
- The backup has to reflect channel changes according to LND's procedure.

## Limits and confusions

This procedure concerns LND and depends on the cooperation and availability of the peers. It does not restore open channels to their latest state and does not replace the required keys.

## Further reading

- [[lightning-node-backup.en|Lightning backups]] — to place this mechanism in context.
- [[channel-closure.en|Closing a channel]] — to place this mechanism in context.

## References

- PlanB lnp202 — Set up Your First Lightning Node
