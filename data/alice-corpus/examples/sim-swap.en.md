---
type: "project_note"
id: "sim-swap"
title: "SIM card hijacking"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["security"]
aliases: ["SIM Swap", "Le détournement de carte SIM"]
parent_ids: []
related_ids: ["two-factor-authentication", "exchange-custody-risk", "threat-model"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB scu101 — Update Your Online Security"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# SIM card hijacking

## Questions covered

- Why do SMS codes have limits?

## Short answer

A SIM swap redirects a phone number to a card or an access controlled by the attacker. The attacker can then receive SMS messages and calls meant for the victim.

## Explanation

A service that uses SMS to log in or recover an account thus depends on control of the number. The hijacking can allow the attacker to get past that step, even without possessing the usual phone.

Possession of the number, possession of the device and real identity therefore have to be distinguished. Codes from a local app or certain authentication keys reduce the dependence on the telephone circuit, subject to the account's configuration and its recovery.

## Limits and confusions

Changing the usual factor is not enough if SMS remains a fallback path that allows the account to be taken over. A loss of network signal is not, on its own, proof of a SIM swap. This attack does not automatically give access to a Bitcoin phrase kept separately, but it can compromise services and information used around the wallet.

## Further reading

- [[two-factor-authentication.en|Two-factor authentication]].
- [[exchange-custody-risk.en|The risk of leaving funds on an exchange]].
- [[threat-model.en|Matching protection to risks]].

## References

- PlanB scu101 — Update Your Online Security.
