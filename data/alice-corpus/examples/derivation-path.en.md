---
type: "project_note"
id: "derivation-path"
title: "The derivation path"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Derivation Path", "Le chemin de dérivation"]
parent_ids: []
related_ids: ["hd-wallet", "wallet-backup", "descriptor-wallet", "secondary-bitcoin-hardened-derivation"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The derivation path

## Questions covered

- Why do 2 pieces of software not always find the same addresses?

## Short answer

The derivation path indicates the position of a key in the tree of an HD wallet. It helps find the same accounts and addresses in compatible software.

## Explanation

Conventions organize the tree by type of use, network or asset, account, receiving addresses and change. The path is a description of this organization, distinct from the secret used to compute the keys.

During a restore, 2 pieces of software can use the same words but look at different branches. They then do not display the same addresses. The expected output type also has to match.

## Limits and confusions

The path alone does not make it possible to spend funds. Conversely, the words alone do not guarantee automatic recovery in every application. Technical notations and hardened derivations should be taken from the documentation of the wallet concerned. This note explains compatibility; it does not invite anyone to test secrets at random on unknown sites or software.

## Further reading

- [[hd-wallet.en|Deterministic wallets]].
- [[wallet-backup.en|Preparing a backup]].
- [[descriptor-wallet.en|Descriptor wallets]].

- [[secondary-bitcoin-hardened-derivation.en|Hardened key derivation]].

## References

- PlanB cyp201 — Bitcoin Wallet Architecture.
