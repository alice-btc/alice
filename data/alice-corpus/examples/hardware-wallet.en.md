---
type: "project_note"
id: "hardware-wallet"
title: "The role of a signing device"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Hardware Wallet", "Le rôle d’un appareil de signature"]
parent_ids: []
related_ids: ["address-spoofing", "wallet-recovery-phrase", "partially-signed-bitcoin-transaction", "secondary-bitcoin-attack-surface", "secondary-bitcoin-btcpay-hardware-wallet-integration"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://trezor.io/guides/trezor-devices/trezor-fundamentals/trezor-s-trusted-display-verify-every-address-on-your-device"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The role of a signing device

## Questions covered

- What does a hardware wallet protect?

## Short answer

A hardware wallet is a signing device that isolates the private keys from the computer or phone used to prepare payments. It reduces their exposure to malware on that host device.

## Explanation

The wallet on the computer prepares the data; the hardware wallet displays the information it is about to sign and asks for confirmation. For this check, its screen should serve as the reference rather than that of the PC or phone.

The full address and the amount shown on the device must be compared with the recipient's details obtained in a reliable way. This step makes it possible to spot a substitution by the computer. The device does not know the user's intention and cannot guess that an address already supplied is fraudulent.

## Limits and confusions

Isolation does not make the hardware or its software infallible. The backup remains sensitive and must allow recovery if the device is lost. A hardware wallet does not protect against a secret handed over voluntarily, a wrong destination that was approved, or every form of physical attack. It is one specific protection within a broader procedure.

## Further reading

- [[address-spoofing.en|Address substitution]].
- [[wallet-recovery-phrase.en|The recovery phrase]].
- [[partially-signed-bitcoin-transaction.en|Preparing and signing a transaction with PSBT]].

- [[secondary-bitcoin-attack-surface.en|The attack surface]].
- [[secondary-bitcoin-btcpay-hardware-wallet-integration.en|Signing BTCPay spends with a dedicated device]].

## References

- [Public reference kept from the source note](https://trezor.io/guides/trezor-devices/trezor-fundamentals/trezor-s-trusted-display-verify-every-address-on-your-device).
