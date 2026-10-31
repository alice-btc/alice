---
type: "project_note"
id: "secondary-privacy-vpn"
title: "What a VPN protects"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["privacy"]
aliases: ["VPN", "Ce que protège un VPN"]
parent_ids: ["bitcoin-p2p-privacy", "tor-browser"]
related_ids: ["bitcoin-p2p-privacy", "tor-browser"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB scu202 — Improve Your Personal Digital Security", "PlanB scu101 — Update Your Online Security"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# What a VPN protects

## Questions covered

- What a VPN protects — what is the mechanism and what are its limits?

## Short answer

A VPN encrypts traffic between the device and a VPN provider, hiding some information from the local network or the ISP but shifting part of the trust to the VPN provider.

## Explanation

- A VPN does not magically make you anonymous.
- It can protect on untrusted Wi-Fi networks or get around certain restrictions.
- The VPN provider can become a central observation point.
- For Bitcoin, it has to be thought through together with Tor, a personal node and the threat model.

## Limits and confusions

The VPN protects the path up to the provider and shifts part of the trust. It does not remove the links created by accounts, transactions or a compromised device.

## Further reading

- [[bitcoin-p2p-privacy.en|Privacy on the network]] — to place this mechanism in context.
- [[tor-browser.en|The role and limits of Tor]] — to place this mechanism in context.

## References

- PlanB scu202 — Improve Your Personal Digital Security
- PlanB scu101 — Update Your Online Security
