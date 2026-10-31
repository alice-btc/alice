---
type: "project_note"
id: "secondary-lightning-lightning-remote-wallet-connection"
title: "Connecting an app to a remote node"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Lightning Remote Wallet Connection", "Relier une application à un nœud distant"]
parent_ids: ["lightning-node-online-status", "threat-model"]
related_ids: ["lightning-node-online-status", "threat-model"]
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
# Connecting an app to a remote node

## Questions covered

- Connecting an app to a remote node — what is the mechanism and what are its limits?

## Short answer

A remote wallet connection makes it possible to use a mobile app while relying on one's own remote Lightning node.

## Explanation

- The goal is a mobile UX without giving up control of the node.
- Common methods include Tor, VPN/Tailscale or Nostr Wallet Connect.
- Each method has a different security and reliability model.
- Access secrets need to be limited and protected.

## Limits and confusions

The remote app acts according to the rights granted by the node or the service. The connection method alone does not prove that the funds are self-custodied.

## Further reading

- [[lightning-node-online-status.en|Node availability]] — to place this mechanism in context.
- [[threat-model.en|Matching protection to risks]] — to place this mechanism in context.

## References

- PlanB lnp202 — Set up Your First Lightning Node
