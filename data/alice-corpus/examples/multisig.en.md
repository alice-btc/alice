---
type: "project_note"
id: "multisig"
title: "Multisig"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Multisig", "La signature multiple"]
parent_ids: []
related_ids: ["descriptor-wallet", "wallet-backup", "partially-signed-bitcoin-transaction", "secondary-bitcoin-defense-in-depth", "secondary-bitcoin-musig"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB pro202 — Programming Bitcoin"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Multisig

## Questions covered

- What does a 2-of-3 configuration mean?

## Short answer

A multisig configuration requires several signatures from a set of keys. In a 2-of-3 scheme, 2 distinct keys out of the 3 defined must authorize the spend.

## Explanation

This arrangement can distribute control across devices, locations or people. A single compromised key is then not enough to meet the threshold, and the loss of one key can remain tolerable if the other required means are available.

The backup must describe the exact conditions, the cosigners' public keys and the paths or descriptors. Keeping only the words of one device does not necessarily reconstruct the complete wallet.

## Limits and confusions

Multisig is not automatically safer. Placing the keys and their backups in the same place can cancel the benefit of separation. A procedure that is not understood complicates recovery and inheritance. The number of devices does not prove their independence. The signing threshold must be distinguished from the simple two-factor authentication of a centralized account.

## Further reading

- [[descriptor-wallet.en|Descriptor wallets]].
- [[wallet-backup.en|Preparing a backup]].
- [[partially-signed-bitcoin-transaction.en|Preparing and signing a transaction with PSBT]].

- [[secondary-bitcoin-defense-in-depth.en|Combining several protections]].
- [[secondary-bitcoin-musig.en|Joint signatures with MuSig]].

## References

- PlanB pro202 — Programming Bitcoin.
