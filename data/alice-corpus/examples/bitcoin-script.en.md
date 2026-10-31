---
type: "project_note"
id: "bitcoin-script"
title: "Spending conditions"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Cryptography and protocol limits"]
aliases: ["Bitcoin Script", "Les conditions de dépense"]
parent_ids: []
related_ids: ["bitcoin-address-scripts", "legacy-address", "secondary-addresses-hashlock", "secondary-bitcoin-bitcoin-covenants", "secondary-bitcoin-dlc", "secondary-bitcoin-op-return"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture", "PlanB his203 — Bitcoin’s Pioneering Era"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Spending conditions

## Questions covered

- What does a Bitcoin script verify?

## Short answer

Bitcoin Script expresses conditions that must be satisfied to spend an output. It ties funds to proofs, such as signatures, rather than to a person's name.

## Explanation

A transaction creates UTXOs associated with spending conditions. A later transaction must provide the necessary elements. Depending on the construction, this may be a signature, several signatures or conditions including a timelock.

An address is generally a representation intended for the wallet to build a certain type of output. It is not an account containing an identity and all of its owner's transactions. Address formats correspond to different ways of expressing or committing to these conditions.

## Limits and confusions

Knowing an address does not give the power to spend. Conversely, holding 1 key is not always enough if the output requires several signatures or another condition.

Taproot changes the representation and the use of certain conditions, without making all spends identical. The condition chosen for an output must not be confused with a central restriction on purchases. The protocol verifies the spending data; it does not know the user's commercial intent.

## Further reading

- [[bitcoin-address-scripts.en|Addresses, scripts and spending conditions]] — Addresses and scripts — compare the conditions
- [[legacy-address.en|Comparing Bitcoin address formats]] — compare the main address formats

- [[secondary-addresses-hashlock.en|Secret-based spending conditions]].
- [[secondary-bitcoin-bitcoin-covenants.en|Restrictions on future spending]].
- [[secondary-bitcoin-dlc.en|DLC contracts and their oracles]].
- [[secondary-bitcoin-op-return.en|OP_RETURN outputs]].

## References

- PlanB cyp201 — Bitcoin Wallet Architecture (reference from the source note, not re-consulted directly for this adaptation).
- PlanB his203 — Bitcoin’s Pioneering Era (reference from the source note, not re-consulted directly for this adaptation).
