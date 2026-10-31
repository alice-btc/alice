---
type: "project_note"
id: "counterparty-risk"
title: "Counterparty risk"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Money and economics"]
aliases: ["Counterparty Risk", "Le risque de contrepartie"]
parent_ids: []
related_ids: ["custodial-lightning-wallet", "paper-bitcoin", "secondary-economics-gold-backed-paper-currency", "secondary-economics-layered-money", "secondary-economics-lender-of-last-resort", "secondary-economics-moral-hazard", "secondary-stablecoins-commodity-backed-stablecoin", "secondary-stablecoins-usdc-depeg-2023"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB biz101 — Bitcoin for Business"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Counterparty risk

## Questions covered

- What happens if the intermediary does not keep its promise?

## Short answer

Counterparty risk is the risk that an actor does not honour its commitment. A platform that holds funds can become unavailable, insolvent or refuse a withdrawal.

## Explanation

A balance displayed on a service is not always an asset the user controls directly. It may represent a claim on the operator. The operator can suffer an outage, a theft or an external constraint, or have made commitments it can no longer honour.

In Bitcoin, controlling the keys and being able to spend without the intermediary's authorization reduces some of these custody risks. It does, however, shift backup and security responsibilities to the user. The comparison must focus on the actual rights and the means of recovery.

## Limits and confusions

Not all intermediaries present the same risks, and not every dependency is custody. A provider of connectivity, liquidity or an interface can be necessary without directly holding the funds.

Declared transparency does not replace the actual ability to honour a promise. Ask who controls the assets, what happens in the event of an outage and what recourses remain. The brand name or the quality of the interface does not answer those questions.

## Further reading

- [[custodial-lightning-wallet.en|Custody on Lightning]] — see custody risk on Lightning
- [[paper-bitcoin.en|Held bitcoin and price exposure]] — distinguish direct control from price exposure

- [[secondary-economics-gold-backed-paper-currency.en|Claims convertible into metal]].
- [[secondary-economics-layered-money.en|Layers of monetary claims]].
- [[secondary-economics-lender-of-last-resort.en|The lender of last resort]].
- [[secondary-economics-moral-hazard.en|Moral hazard and guarantees]].
- [[secondary-stablecoins-commodity-backed-stablecoin.en|Tokens backed by a commodity]].
- [[secondary-stablecoins-usdc-depeg-2023.en|The USDC depeg episode of 2023]].

## References

- PlanB biz101 — Bitcoin for Business (reference from the source note, not re-consulted directly for this adaptation).
