---
type: "project_note"
id: "secondary-lightning-lightning-node-recovery-tradeoff"
title: "The recovery dependencies of a Lightning node"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Lightning Node Recovery Tradeoff", "Les dépendances de récupération d’un nœud Lightning"]
parent_ids: ["lightning-node-backup", "lightning-service-provider"]
related_ids: ["lightning-node-backup", "lightning-service-provider"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB dev303 — Learning Rust with Bitcoin"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The recovery dependencies of a Lightning node

## Questions covered

- The recovery dependencies of a Lightning node — what is the mechanism and what are its limits?

## Short answer

The recovery trade-off of a Lightning node measures how hard it is to recover its funds and channel states if the infrastructure or the wallet disappears.

## Explanation

- Keeping the keys is not always enough if the channel state is complex.
- A cloud model simplifies day-to-day use but can make an independent exit harder.
- Providers need to plan for migration, backup and recovery procedures.
- Non-technical users may be dependent on the wallet ecosystem.

## Limits and confusions

Recovery depends on the data kept, the peers available and the software. Holding a recovery phrase does not guarantee that every channel state can be reconstructed.

## Further reading

- [[lightning-node-backup.en|Lightning backups]] — to place this mechanism in context.
- [[lightning-service-provider.en|Lightning service providers]] — to place this mechanism in context.

## References

- PlanB dev303 — Learning Rust with Bitcoin
