---
type: "project_note"
id: "secondary-bitcoin-compact-block-filters"
title: "Compact block filters"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["Compact Block Filters", "Les filtres compacts de blocs"]
parent_ids: ["spv-node", "wallet-node-connection"]
related_ids: ["spv-node", "wallet-node-connection"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pro202 — Programming Bitcoin"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Compact block filters

## Questions covered

- How does a light wallet look for its transactions without revealing all its addresses?

## Short answer

Compact filters help a wallet identify locally which blocks may contain its transactions, without directly sending out all its addresses.

## Explanation

- The wallet compares its scripts against the filters locally and fetches the blocks that may concern it.
- False positives lead to extra downloads; reliable peers and data remain necessary.

## Limits and confusions

The guarantees assume well-formed data; a malicious peer or correlated requests can still be a problem.

## Further reading

- [[spv-node.en|Lightweight verification]] — back to the basic concept.
- [[wallet-node-connection.en|Connecting a wallet to your node]] — back to the basic concept.

## References

- PlanB pro202 — Programming Bitcoin
