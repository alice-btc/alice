---
type: "project_note"
id: "two-factor-authentication"
title: "Two-factor authentication"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["security"]
aliases: ["Two-Factor Authentication", "La double authentification"]
parent_ids: []
related_ids: ["sim-swap", "password-manager", "phishing-and-social-engineering", "secondary-bitcoin-btcpay-security", "secondary-bitcoin-lnurl-auth", "secondary-privacy-passkeys", "secondary-privacy-secure-email-account", "secondary-privacy-single-sign-on-risk", "secondary-privacy-totp"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB scu202 — Improve Your Personal Digital Security", "PlanB Extraction — 2026-05-23 — scu101"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Two-factor authentication

## Questions covered

- What does an account's second factor protect?

## Short answer

Two-factor authentication asks for an additional proof beyond the password. It protects access to an account; it does not change the protocol's spending conditions for bitcoins.

## Explanation

Common forms include app codes, SMS and hardware authentication keys. Their resistance differs, in particular against the theft of a phone number and against fake sites. The fallback methods also deserve protection, because they can allow the usual factor to be bypassed.

The account recovery path has to be examined as much as the daily login. A vulnerable email or a hijacked number can remain a weak point depending on the service.

## Limits and confusions

A disclosed Bitcoin recovery phrase does not become protected by the two-factor authentication of the associated account. A hardware authentication key and a hardware wallet for signing do not necessarily have the same function. Temporary codes can be requested by fake support; their temporary nature does not make handing them over safe.

## Further reading

- [[sim-swap.en|SIM card hijacking]].
- [[password-manager.en|Password managers]].
- [[phishing-and-social-engineering.en|Fake support and phishing]].

- [[secondary-bitcoin-btcpay-security.en|Securing a BTCPay installation]].
- [[secondary-bitcoin-lnurl-auth.en|Authenticating with LNURL-AUTH]].
- [[secondary-privacy-passkeys.en|Passkeys and their recovery]].
- [[secondary-privacy-secure-email-account.en|The role of email in account recovery]].
- [[secondary-privacy-single-sign-on-risk.en|Dependence on a centralized login]].
- [[secondary-privacy-totp.en|TOTP authentication codes]].

## References

- PlanB scu202 — Improve Your Personal Digital Security.
- PlanB Extraction — 2026-05-23 — scu101.
