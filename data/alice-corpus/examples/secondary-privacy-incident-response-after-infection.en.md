---
type: "project_note"
id: "secondary-privacy-incident-response-after-infection"
title: "Responding to a potentially compromised device"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Incident Response After Infection", "Réagir à un appareil potentiellement compromis"]
parent_ids: ["malware", "wallet-backup"]
related_ids: ["malware", "wallet-backup"]
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
# Responding to a potentially compromised device

## Questions covered

- Responding to a potentially compromised device — what is the mechanism and what are its limits?

## Short answer

A suspected infection requires limiting the spread and no longer entering secrets on the device. Password changes and recovery have to be done from a trusted environment.

## Explanation

- Isolating the suspect device from the network limits some malicious exchanges.
- Compromised sessions and access are revoked from another, trusted device.
- A reinstall or a clean restore may be necessary; an antivirus does not guarantee the absence of compromise.
- Recovering an account is distinct from recovering a wallet whose keys may have been copied.

## Limits and confusions

A scan with no alert does not prove that the device is clean. A key or phrase that has already been disclosed remains compromised after the computer is cleaned.

## Further reading

- [[malware.en|Malware]] — to place this mechanism in context.
- [[wallet-backup.en|Preparing a backup]] — to place this mechanism in context.

## References

- PlanB scu101 — Update Your Online Security
