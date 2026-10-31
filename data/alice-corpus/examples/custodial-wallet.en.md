---
type: "project_note"
id: "custodial-wallet"
title: "Custodial wallets"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Custodial Wallet", "La garde déléguée"]
parent_ids: []
related_ids: ["self-custody", "exchange-custody-risk", "two-factor-authentication"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc102 — Getting your first bitcoins", "PlanB Extraction — 2026-05-23 — eco104"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Custodial wallets

## Questions covered

- Who controls the funds held by a custodial service?

## Short answer

In a custodial service, a third party controls the keys, or the effective ability to spend the funds. The user accesses an account and depends on the service to make a withdrawal.

## Explanation

The displayed balance then represents what the service acknowledges it owes or makes available. A transfer between customers can be processed in its internal accounting without a Bitcoin transaction for each one. A password or two-factor authentication protects access to the account, not direct control of the custodian's keys.

This arrangement can simplify usage and access recovery. It does, however, add a dependency on the operator's security, solvency and rules.

## Limits and confusions

Ease of use does not remove the risks of frozen funds, bankruptcy, hacking or withdrawal restrictions. A proof of bitcoin holdings does not by itself show all of a service's obligations. The distinction from self-custody needs to be explained before treating an app account as funds controlled by one's own keys.

## Further reading

- [[self-custody.en|Self-custody of keys]].
- [[exchange-custody-risk.en|The risk of leaving funds on an exchange]].
- [[two-factor-authentication.en|Two-factor authentication]].

## References

- PlanB btc102 — Getting your first bitcoins.
- PlanB Extraction — 2026-05-23 — eco104.
