---
type: "project_note"
id: "threat-model"
title: "Matching protection to risks"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["security"]
aliases: ["Threat Model", "Adapter la protection aux risques"]
parent_ids: []
related_ids: ["wallet-backup", "hardware-wallet", "physical-security-for-bitcoiners", "secondary-bitcoin-attack-surface", "secondary-bitcoin-defense-in-depth", "secondary-lightning-lightning-remote-wallet-connection", "secondary-lightning-macaroon", "secondary-opsec-digital-hygiene", "secondary-privacy-browser-compartmentalization", "secondary-privacy-principle-of-least-privilege", "secondary-privacy-public-wi-fi-risk", "secondary-privacy-single-sign-on-risk"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB cyp302 — Modern Cryptography Fundamentals"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Matching protection to risks

## Questions covered

- How to choose proportionate protections?

## Short answer

A threat model specifies what is being protected, against whom and under what assumptions. It replaces the too-vague question "is it secure?" with concrete scenarios.

## Explanation

A person may want to avoid losing a device, having secrets stolen by software, a custodian going bankrupt or being unable to pass on their funds. These scenarios are not all handled with the same tool.

What the adversary can read, modify or control has to be identified, then which protection really acts on that capability has to be checked. A backup protects against certain losses; isolating keys limits certain computer attacks; a node makes it possible to verify rules.

## Limits and confusions

A measure that improves one aspect can complicate another. More secrets can reduce a dependency while increasing the risk of a failed recovery. Promises have to specify their scope, in particular for local encryption and unlocked devices. The model needs revisiting when the uses, the tools or the people involved change.

## Further reading

- [[wallet-backup.en|Preparing a backup]].
- [[hardware-wallet.en|The role of a signing device]].
- [[physical-security-for-bitcoiners.en|Physical security]].

- [[secondary-bitcoin-attack-surface.en|The attack surface]].
- [[secondary-bitcoin-defense-in-depth.en|Combining several protections]].
- [[secondary-lightning-lightning-remote-wallet-connection.en|Connecting an app to a remote node]].
- [[secondary-lightning-macaroon.en|LND's macaroon access tokens]].
- [[secondary-opsec-digital-hygiene.en|Digital security habits]].
- [[secondary-privacy-browser-compartmentalization.en|Separating your uses in the browser]].
- [[secondary-privacy-principle-of-least-privilege.en|Limiting application permissions]].
- [[secondary-privacy-public-wi-fi-risk.en|The risks of an untrusted Wi-Fi network]].
- [[secondary-privacy-single-sign-on-risk.en|Dependence on a centralized login]].

## References

- PlanB cyp302 — Modern Cryptography Fundamentals.
