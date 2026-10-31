---
type: "project_note"
id: "secondary-privacy-public-wi-fi-risk"
title: "The risks of an untrusted Wi-Fi network"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Public Wi-Fi Risk", "Les risques d’un réseau Wi-Fi non fiable"]
parent_ids: ["threat-model", "non-blockchain-privacy-leaks"]
related_ids: ["threat-model", "non-blockchain-privacy-leaks"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB scu101 — Update Your Online Security"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The risks of an untrusted Wi-Fi network

## Questions covered

- The risks of an untrusted Wi-Fi network — what is the mechanism and what are its limits?

## Short answer

On an untrusted Wi-Fi network, fake access points, captive portals and exposed local services add risks. The risk also depends on the encryption of connections and on the security of the device.

## Explanation

- Checking the domain and using a valid HTTPS connection.
- Avoiding software or certificate installations requested by a dubious portal.
- Disabling unnecessary local sharing and unwanted automatic connections.
- A VPN shifts part of the trust to its provider; it does not protect against every attack.

## Limits and confusions

A mobile network is not a guarantee of security. HTTPS protects transport to the right domain, but not against a fraudulent site or a compromised device.

## Further reading

- [[threat-model.en|Matching protection to risks]] — to place this mechanism in context.
- [[non-blockchain-privacy-leaks.en|Leaks outside the blockchain]] — to place this mechanism in context.

## References

- PlanB scu101 — Update Your Online Security
