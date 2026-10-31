---
type: "project_note"
id: "lightning-node-online-status"
title: "Node availability"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Lightning Node Online Status", "La disponibilité du nœud"]
parent_ids: []
related_ids: ["watchtower", "lightning-service-provider", "secondary-bitcoin-lightning-offline-receiving-problem", "secondary-lightning-lightning-remote-wallet-connection", "secondary-lightning-macaroon"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB lnp404 — Navigating Your Node with Terminal"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Node availability

## Questions covered

- Do I need to be online to use Lightning?

## Short answer

A Lightning node must be reachable to take part normally in payments and routing. Its availability also matters for monitoring the events that concern its channels.

## Explanation

A routing operator provides a service to the other participants. Outages make its paths less reliable and can cause failures or extra attempts. Monitoring the process, the connection and the synchronization helps distinguish a node that is switched on from a node that is actually operational.

For a mobile user, part of this availability can be organized by the wallet's architecture or by a provider. One needs to understand who stays connected and which information or functions are entrusted to them.

## Limits and confusions

Being briefly offline does not mean that all funds disappear. The consequences depend on payments in flight, channel timeouts and the protections available. A prolonged outage can, however, prevent acting within an important window.

A watchtower covers certain cheating attempts during settlement; it does not do all of the node's work. Likewise, an LSP can improve access to payments without removing every network dependency.

## Further reading

- [[watchtower.en|The role of a watchtower]] — understanding delegated monitoring
- [[lightning-service-provider.en|Lightning service providers]] — seeing the functions handled by a service

- [[secondary-bitcoin-lightning-offline-receiving-problem.en|Receiving on Lightning while offline]].
- [[secondary-lightning-lightning-remote-wallet-connection.en|Connecting an app to a remote node]].
- [[secondary-lightning-macaroon.en|LND's macaroon access tokens]].

## References

- PlanB lnp404 — Navigating Your Node with Terminal (reference from the source note, not re-consulted directly for this adaptation).
