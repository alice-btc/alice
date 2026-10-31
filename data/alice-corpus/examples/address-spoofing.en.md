---
type: "project_note"
id: "address-spoofing"
title: "Address substitution"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["security"]
aliases: ["Address Spoofing", "La substitution d’adresse"]
parent_ids: []
related_ids: ["hardware-wallet", "bitcoin-uri", "phishing-and-social-engineering"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://trezor.io/guides/trezor-devices/trezor-fundamentals/trezor-s-trusted-display-verify-every-address-on-your-device", "https://arxiv.org/abs/2501.16681", "https://arxiv.org/abs/2108.14004"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Address substitution

## Questions covered

- Why verify the destination address?

## Short answer

Address substitution diverts a payment to a destination controlled by an attacker. An address that looks like another one is not proof that it belongs to the intended recipient.

## Explanation

Malicious software can replace the contents of the clipboard. Another mechanism consists of making a similar-looking address appear in a history, in the hope that it will be copied. These attacks are distinct and are not solved simply by changing addresses often.

With a hardware wallet, its screen serves as the reference for what will be signed. The full address and the amount must be compared with information obtained reliably from the recipient, not only with the characters visible on the computer.

## Limits and confusions

The device does not guess human intent. A wrong address confirmed on its screen is still a wrong destination. The studies cited in the source note do not all measure how frequent these attacks are on Bitcoin; their results should not be carried over as Bitcoin statistics.

## Further reading

- [[hardware-wallet.en|The role of a signing device]].
- [[bitcoin-uri.en|Payment requests and QR codes]].
- [[phishing-and-social-engineering.en|Fake support and phishing]].

## References

- [Public reference kept from the source note](https://trezor.io/guides/trezor-devices/trezor-fundamentals/trezor-s-trusted-display-verify-every-address-on-your-device).
- [Public reference kept from the source note](https://arxiv.org/abs/2501.16681).
- [Public reference kept from the source note](https://arxiv.org/abs/2108.14004).
