---
type: "project_note"
id: "secondary-lightning-lnd-aezeed"
title: "LND's aezeed recovery format"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["LND aezeed", "Le format de récupération aezeed de LND"]
parent_ids: ["lightning-node-backup", "wallet-recovery-phrase"]
related_ids: ["lightning-node-backup", "wallet-recovery-phrase"]
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
# LND's aezeed recovery format

## Questions covered

- LND's aezeed recovery format — what is the mechanism and what are its limits?

## Short answer

aezeed is the LND-specific seed format used to derive the on-chain wallet associated with the Lightning node.

## Explanation

- It looks like a 24-word phrase but is not a classic BIP39 seed.
- It makes it possible to recover funds that have returned on-chain after channels are closed.
- It is not enough to restore the dynamic state of Lightning channels.
- It needs to be backed up as seriously as a wallet seed.

## Limits and confusions

This note concerns LND. The aezeed phrase is not interchangeable with BIP39 and does not, on its own, constitute a backup of the state of every channel.

## Further reading

- [[lightning-node-backup.en|Lightning backups]] — to place this mechanism in context.
- [[wallet-recovery-phrase.en|The recovery phrase]] — to place this mechanism in context.

## References

- PlanB lnp202 — Set up Your First Lightning Node
