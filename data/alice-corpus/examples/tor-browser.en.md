---
type: "project_note"
id: "tor-browser"
title: "The role and limits of Tor"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Tor Browser", "Le rôle et les limites de Tor"]
parent_ids: []
related_ids: ["bitcoin-p2p-privacy", "phishing-and-social-engineering", "threat-model", "secondary-privacy-private-browsing-mode", "secondary-privacy-vpn"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB scu101 — Update Your Online Security"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The role and limits of Tor

## Questions covered

- What can Tor protect in my Bitcoin usage?

## Short answer

Tor Browser routes browsing through the Tor network in order to hide the originating IP address from certain observers and to limit certain forms of tracking. It does not automatically make all Bitcoin activity anonymous.

## Explanation

The browser acts on the communications it handles. A separate wallet or node does not necessarily go through Tor just because the browser is open. Their connection has to be evaluated according to their own configuration.

The network can reduce the direct link between a user and the site visited. This can be useful for looking up information without immediately revealing one's IP address to the service. The behaviors and accounts used nonetheless remain sources of identification.

## Limits and confusions

Logging into a named account still reveals that identity to the service. Tor does not make a fake site legitimate, does not repair an infected device and does not hide the public data of the blockchain. Performance and operational limits vary. Network protection has to be distinguished from the privacy of transactions and of information voluntarily provided.

## Further reading

- [[bitcoin-p2p-privacy.en|Privacy on the network]].
- [[phishing-and-social-engineering.en|Fake support and phishing]].
- [[threat-model.en|Matching protection to risks]].

- [[secondary-privacy-private-browsing-mode.en|The limits of private browsing]].
- [[secondary-privacy-vpn.en|What a VPN protects]].

## References

- PlanB scu101 — Update Your Online Security.
