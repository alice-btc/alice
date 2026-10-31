---
type: "project_note"
id: "programmable-money"
title: "Programmable money"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Money and economics"]
aliases: ["Programmable Money", "La monnaie programmable"]
parent_ids: []
related_ids: ["bitcoin-script", "cbdc"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/transactions.html", "https://developer.bitcoin.org/devguide/contracts.html"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Programmable money

## Questions covered

- What can programming a currency or a payment mean?

## Short answer

Programmable money can refer to conditional payments or to restrictions imposed on the use of funds. Who writes the conditions and who can change them must be specified.

## Explanation

Participants can choose rules for an operation, such as requiring several signatures or waiting for a delay. In another architecture, a central issuer can limit the recipients or the categories of spending. These mechanisms do not distribute the same power.

Bitcoin Script allows spending conditions set when an output is created. This does not mean that a central authority of the protocol decides which purchases each user can make. A service used around Bitcoin can nonetheless impose its own rules on its customers.

## Limits and confusions

Automating a payment does not necessarily amount to making each monetary unit usable only in certain shops. The general expression "programmable" sometimes hides this difference.

A feature can facilitate a legitimate use and at the same time increase the possibilities of control. The assessment should describe the concrete powers, the accessible data and the remedies. The restrictions of a CBDC or a stablecoin must be related to the system concerned, without being assumed identical everywhere.

## Further reading

- [[bitcoin-script.en|Spending conditions]] — understanding spending conditions
- [[cbdc.en|Central bank digital currencies]] — examining institutional programming

## References

- [Bitcoin Developer Guide, Transactions](https://developer.bitcoin.org/devguide/transactions.html).
- [Contracts](https://developer.bitcoin.org/devguide/contracts.html).
