---
type: "project_note"
id: "password-manager"
title: "Password managers"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["security"]
aliases: ["Password Manager", "Les gestionnaires de mots de passe"]
parent_ids: []
related_ids: ["two-factor-authentication", "phishing-and-social-engineering", "wallet-recovery-phrase", "secondary-opsec-data-breach-monitoring", "secondary-privacy-digital-inheritance", "secondary-privacy-strong-password"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB scu202 — Improve Your Personal Digital Security", "PlanB Extraction — 2026-05-23 — scu101"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Password managers

## Questions covered

- What is a password manager for my accounts for?

## Short answer

A password manager helps create and store distinct passwords for each account. It notably reduces the risk that a leak at one service gives access to all the others.

## Explanation

The vault means each individual secret does not have to be memorized. Its protection and its recovery then become essential. Autofill tied to the right domain can help spot some imitations, but does not replace every check of a site's origin.

This protection concerns email accounts, exchanges and the services associated with using Bitcoin. It works together with a second factor and with the service's recovery procedures.

## Limits and confusions

The manager does not make a compromised device safe. Losing all access to the vault can also lock accounts if recovery has not been thought through. Application passwords and the Bitcoin recovery phrase do not play the same role; an online vault strategy should not be automatically transposed to the secrets used for custody of bitcoin.

## Further reading

- [[two-factor-authentication.en|Two-factor authentication]].
- [[phishing-and-social-engineering.en|Fake support and phishing]].
- [[wallet-recovery-phrase.en|The recovery phrase]].

- [[secondary-opsec-data-breach-monitoring.en|Responding to data breach alerts]].
- [[secondary-privacy-digital-inheritance.en|Preparing the handover of your digital accounts]].
- [[secondary-privacy-strong-password.en|Password strength and uniqueness]].

## References

- PlanB scu202 — Improve Your Personal Digital Security.
- PlanB Extraction — 2026-05-23 — scu101.
