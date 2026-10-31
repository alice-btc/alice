---
type: "project_note"
id: "secondary-lightning-nostr-wallet-connect"
title: "Nostr Wallet Connect connections"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["lightning"]
aliases: ["Nostr Wallet Connect", "Les connexions Nostr Wallet Connect"]
parent_ids: ["lightning-network", "custodial-lightning-wallet"]
related_ids: ["lightning-network", "custodial-lightning-wallet"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["https://github.com/nostr-protocol/nips/blob/master/47.md", "PlanB lnp202 — Set up Your First Lightning Node"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Nostr Wallet Connect connections

## Questions covered

- Nostr Wallet Connect connections — what is the mechanism and what are its limits?

## Short answer

Nostr Wallet Connect lets an application send encrypted requests to a wallet through Nostr relays. The wallet executes the authorized operations and sends back its responses.

## Explanation

- Messages are encrypted between the parties; the relays themselves are not what provides a custody guarantee.
- The connection URI contains an access secret that needs to be protected.
- The protocol avoids exposing a node API directly to each application.
- The connection replaces neither backups nor a review of the rights granted.

## Limits and confusions

NWC can connect a custodial service or a personal node. The effective permissions and limits depend on the wallet; relays can observe metadata.

## Further reading

- [[lightning-network.en|Understanding Lightning]] — to place this mechanism in context.
- [[custodial-lightning-wallet.en|Custody on Lightning]] — to place this mechanism in context.

## References

- [https://github.com/nostr-protocol/nips/blob/master/47.md](https://github.com/nostr-protocol/nips/blob/master/47.md)
- PlanB lnp202 — Set up Your First Lightning Node
