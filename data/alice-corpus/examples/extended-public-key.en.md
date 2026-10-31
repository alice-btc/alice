---
type: "project_note"
id: "extended-public-key"
title: "The extended public key"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Extended Public Key", "La clé publique étendue"]
parent_ids: []
related_ids: ["watch-only-wallet", "derivation-path", "descriptor-wallet", "secondary-bitcoin-btcpay-extended-public-key", "secondary-bitcoin-hardened-derivation", "secondary-bitcoin-non-hardened-derivation"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture", "PlanB Extraction — 2026-05-23"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The extended public key

## Questions covered

- What does an xpub reveal?

## Short answer

An extended public key, often called an xpub, makes it possible to derive a set of public keys within a wallet branch. It makes tracking easier without, by itself, giving the ability to sign.

## Explanation

A viewing or receiving tool can use it, with the appropriate parameters, to produce addresses and look up their transactions. It does not need to receive the corresponding private keys. This separation is notably used with watch-only wallets.

Sharing it, however, goes beyond a single address. Depending on the branch transmitted, it can expose a history and future addresses. A server that receives this information therefore gets a lasting view of part of the wallet.

## Limits and confusions

An xpub must be protected as privacy-sensitive information. It does not necessarily represent the whole wallet or all of its accounts. It does not replace the script type and the path needed to find the right addresses. Its interaction with a leak of certain private keys is an additional technical risk to be covered in a further reading note.

## Further reading

- [[watch-only-wallet.en|Watching without being able to spend]].
- [[derivation-path.en|The derivation path]].
- [[descriptor-wallet.en|Descriptor wallets]].

- [[secondary-bitcoin-btcpay-extended-public-key.en|Receiving with an extended public key in BTCPay]].
- [[secondary-bitcoin-hardened-derivation.en|Hardened key derivation]].
- [[secondary-bitcoin-non-hardened-derivation.en|Public derivation of child keys]].

## References

- PlanB cyp201 — Bitcoin Wallet Architecture.
- PlanB Extraction — 2026-05-23.
