---
type: "project_note"
id: "secondary-bitcoin-btcpay-security"
title: "Securing a BTCPay installation"
language: "en"
source_language: "fr"
translation_status: "machine"
tier: "secondary"
status: "reviewed"
topics: ["bitcoin"]
aliases: ["BTCPay Security", "Sécuriser une installation BTCPay"]
parent_ids: ["btcpay-server", "two-factor-authentication"]
related_ids: ["btcpay-server", "two-factor-authentication"]
reviewed_at: "2026-10-11"
review_due: null
review_method: "semantic_light"
external_fact_check: false
sources: ["PlanB pos305 — Mastering BTC Pay Server"]
human_reviewed_in_full: false
exhaustive_external_fact_check: false
---
# Securing a BTCPay installation

## Questions covered

- What needs protecting besides the BTCPay account password?

## Short answer

BTCPay security covers the accounts, permissions, integration tokens, the server and the wallet keys all at once.

## Explanation

- 2FA protects user access but does not replace good management of the Bitcoin keys.
- Access tokens should be limited in scope and revocable.
- Roles should follow the principle of least privilege.
- Hot wallets and payouts call for particular care.

## Limits and confusions

2FA on an account does not by itself protect private keys exposed on the server.

## Further reading

- [[btcpay-server.en|Understanding BTCPay Server]] — back to the basic concept.
- [[two-factor-authentication.en|Two-factor authentication]] — back to the basic concept.

## References

- PlanB pos305 — Mastering BTC Pay Server
