---
type: "project_note"
id: "lightning-node-backup"
title: "Lightning backups"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Lightning Node Backup", "Les sauvegardes Lightning"]
parent_ids: []
related_ids: ["lightning-force-close", "watchtower", "secondary-lightning-lightning-node-implementation", "secondary-lightning-lightning-node-recovery-tradeoff", "secondary-lightning-lnd-aezeed", "secondary-lightning-static-channel-backup"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://docs.lightning.engineering/lightning-network-tools/lnd/recovery-planning-for-failure"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Lightning backups

## Questions covered

- Why does backing up Lightning require special attention?

## Short answer

Backing up Lightning requires taking into account the live state of the channels, not only the keys. The procedure depends on the software; a recipe designed for LND does not automatically apply to other nodes.

## Explanation

For LND, the seed alone is not enough to restore open channels. The static channel backup, or SCB, helps find the peers again and request a settlement of the channels during the recovery procedure. It does not put the node back into operation with all its old channels intact.

The channel.db database contains dynamic state. Restoring an old copy can lead to using an outdated commitment and put funds at risk. A backup consistent with the documentation of the version in use must be prepared before a failure occurs.

## Limits and confusions

An on-chain backup and a Lightning backup do not cover the same need. A watchtower does not replace recovery data.

Alice must ask which software is used before proposing a precise procedure. She must never ask the user to post their seed, keys or secret files in the conversation. A general explanation is not an actual, successful restore test.

## Further reading

- [[lightning-force-close.en|Force closing]] — understanding settlement during a recovery
- [[watchtower.en|The role of a watchtower]] — distinguishing monitoring from restoring

- [[secondary-lightning-lightning-node-implementation.en|Lightning implementations]].
- [[secondary-lightning-lightning-node-recovery-tradeoff.en|The recovery dependencies of a Lightning node]].
- [[secondary-lightning-lnd-aezeed.en|LND's aezeed recovery format]].
- [[secondary-lightning-static-channel-backup.en|LND's static channel backup]].

## References

- [Lightning Labs, LND recovery](https://docs.lightning.engineering/lightning-network-tools/lnd/recovery-planning-for-failure).
