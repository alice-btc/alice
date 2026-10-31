---
type: "project_note"
id: "secure-backups"
title: "The risks that threaten a backup"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["security"]
aliases: ["Secure Backups", "Les risques qui menacent une sauvegarde"]
parent_ids: []
related_ids: ["wallet-backup", "wallet-backup-test", "bitcoin-inheritance-plan", "secondary-privacy-backup-3-2-1-method", "secondary-privacy-file-encryption", "secondary-privacy-ransomware"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB scu202 et scu101, sécurité numérique et sauvegardes"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The risks that threaten a backup

## Questions covered

- How to think about the loss, theft and destruction of a backup?

## Short answer

A useful backup has to survive the loss of the original while remaining recoverable by the right people. For Bitcoin, it also has to avoid exposing the secrets that authorize a spend.

## Explanation

Synchronization propagates changes; it can also propagate a deletion or a mistake. A version history on the same disk does not protect against the loss of that disk. An independent copy and a verified restore meet different needs.

What needs protecting depends on the wallet. It can include words, a passphrase, descriptors and a recovery procedure. Keeping copies apart can limit a shared disaster, but multiplying the accessible secrets also creates points of exposure.

## Limits and confusions

A general rule of computer backups does not apply mechanically to Bitcoin keys. Encryption adds its own secret to preserve. A correct checksum does not prove that a full restore is possible. The best arrangement is the one whose risks of loss, theft and misunderstanding have been explicitly considered.

## Further reading

- [[wallet-backup.en|Preparing a backup]].
- [[wallet-backup-test.en|Testing your backup]].
- [[bitcoin-inheritance-plan.en|Preparing the handover]].

- [[secondary-privacy-backup-3-2-1-method.en|The 3-2-1 backup method]].
- [[secondary-privacy-file-encryption.en|Encrypting sensitive files]].
- [[secondary-privacy-ransomware.en|Ransomware and the limits of backups]].

## References

- PlanB scu202 and scu101, digital security and backups.
