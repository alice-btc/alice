---
type: "project_note"
id: "secondary-privacy-full-disk-encryption"
title: "What disk encryption protects"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Full Disk Encryption", "Ce que protège le chiffrement du disque"]
parent_ids: ["encryption", "physical-security-for-bitcoiners"]
related_ids: ["encryption", "physical-security-for-bitcoiners"]
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
# What disk encryption protects

## Questions covered

- What disk encryption protects — what is the mechanism and what are its limits?

## Short answer

Full disk encryption protects data at rest if a computer, phone or external drive is lost or stolen. It requires a strong password and sound management of recovery.

## Explanation

- It mainly protects against physical access when the encrypted volume is closed and its keys are not accessible.
- It does not protect against malware that is active while the machine is unlocked.
- External drives and backups also need to be encrypted if they are sensitive.
- Losing the recovery phrase or password can make the data unrecoverable.

## Limits and confusions

This protection mainly concerns a closed volume, typically when the device is powered off. Simply locking the screen does not necessarily offer the same protection. An open session, or malicious software allowed to read the data, changes the threat model.

## Further reading

- [[encryption.en|Encryption and signatures]] — to place this mechanism in context.
- [[physical-security-for-bitcoiners.en|Physical security]] — to place this mechanism in context.

## References

- PlanB scu202 — Improve Your Personal Digital Security
- PlanB scu101 — Update Your Online Security
