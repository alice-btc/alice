---
type: "project_note"
id: "software-integrity-verification"
title: "Verifying a download"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["security"]
aliases: ["Software Integrity Verification", "PGP Signature Verification", "Vérifier un téléchargement"]
parent_ids: []
related_ids: ["software-download-hygiene", "bitcoin-core", "malware", "secondary-bitcoin-kerckhoffs-principle", "secondary-bitcoin-message-integrity", "secondary-bitcoin-open-source-security-review"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB scu202 — Improve Your Personal Digital Security", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Verifying a download

## Questions covered

- What are a software checksum and a signature for?

## Short answer

A checksum helps verify that a file matches a reference. A signature helps verify that a given key signed this file or its checksum. These are different checks.

## Explanation

If the file is modified, its checksum must change. But an attacker who replaces both the file and the checksum on a fake page can make this comparison misleading. The reference therefore has to come from a trustworthy origin.

A signature adds a cryptographic link to a key. It still has to be established that this key really belongs to the expected publisher. Checking only that some signature is correct does not solve this identity problem.

## Limits and confusions

An authentic file can contain flaws. Verifying the origin is not an audit of the program and does not guarantee that the system running it is clean. The exact procedures vary by project and platform. This note explains their usefulness; it does not provide a universal command applicable to every download.

## Further reading

- [[software-download-hygiene.en|Downloading the right software]].
- [[bitcoin-core.en|The Bitcoin Core software]].
- [[malware.en|Malware]].

- [[secondary-bitcoin-kerckhoffs-principle.en|Kerckhoffs's principle]].
- [[secondary-bitcoin-message-integrity.en|Message integrity]].
- [[secondary-bitcoin-open-source-security-review.en|Security review of open-source code]].

## References

- PlanB scu202 — Improve Your Personal Digital Security.
- PlanB Extraction — 2026-05-23.
