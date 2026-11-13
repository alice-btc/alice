---
type: "project_note"
id: "third-party-seed-backup"
title: "Entrusting a recovery phrase to a third-party service"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["security"]
aliases: ["Ledger Recover", "Sauvegarde de seed par un tiers", "Third-party seed backup", "Seed backup service"]
parent_ids: []
related_ids: ["seed-phrase-backup", "wallet-recovery-phrase", "secure-backups"]
reviewed_at: "2026-11-13"
review_due: null
sources: ["https://shop.ledger.com/pages/ledger-recover"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Entrusting a recovery phrase to a third-party service

## Questions covered

- Does Ledger Recover send my recovery phrase to the cloud?
- With a seed backup service, does my secret leave the device?
- Who do I have to trust with Ledger Recover?
- Is it a good idea to entrust my seed to a company?

## Short answer

Yes, with a service such as Ledger Recover, an encrypted version of the secret leaves the device. The service is optional, paid by subscription, and relies on trust in the companies that keep the fragments.

## Explanation

According to the service's page, the device's secure chip encrypts the secret, splits it into 3 fragments and hands them to 3 separate companies: Coincover, Ledger and EscrowTech. 2 fragments out of 3 are enough to restore, after an online identity verification.

One must therefore trust these companies not to collude and not to be compelled to cooperate, the identity verification process, and the device software that performs the encryption and the split. It is a trade-off: a way out in case of loss, at the cost of a dependency and a link between one's identity and one's backup.

A phrase written by hand on paper or stamped on metal, kept in several copies, sends nothing anywhere.

## Limits and confusions

Technical details and price belong to the provider's current documentation and can change. This note neither recommends nor discourages a product. Alice App neither stores nor recovers any recovery phrase.

## Further reading

- [[seed-phrase-backup.en|Backing up a recovery phrase]].
- [[wallet-recovery-phrase.en|The recovery phrase]].
- [[secure-backups.en|Secure backups]].

## References

- https://shop.ledger.com/pages/ledger-recover.
