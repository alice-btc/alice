---
type: "project_note"
id: "custodial-lightning-wallet"
title: "Custody on Lightning"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Lightning"]
aliases: ["Custodial Lightning Wallet", "La garde sur Lightning"]
parent_ids: []
related_ids: ["lightning-service-provider", "spark-trust-and-exits", "secondary-lightning-nostr-wallet-connect"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB lnp202 — Set up Your First Lightning Node"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Custody on Lightning

## Questions covered

- Who holds the keys, depending on the service used?

## Short answer

A custodial Lightning wallet displays a balance held by an operator who controls the keys and the channels. The user depends on that operator to execute their payments or recover their bitcoins.

## Explanation

The service takes care of liquidity, availability and routing. The experience can therefore be simple, but the balance corresponds to a claim or an entry at that service. A Lightning payment received by the operator does not automatically give the user control of on-chain bitcoins.

To identify the model, look at who signs the spends and how the funds would be recovered if the company stopped responding. The name of the application, the presence of a QR code or the use of the word "Lightning" is not enough.

## Limits and confusions

The operator can be unavailable, become insolvent or block an account. The autonomy is different from that of a wallet whose user controls the keys and the exit mechanisms.

The same application can offer several custody modes depending on its versions or regions. Check the mode actually enabled, without permanently classifying a brand. An LSP that assists a self-custodial wallet is not automatically the custodian of its funds.

## Further reading

- [[lightning-service-provider.en|Lightning service providers]] — distinguish a liquidity service from custody
- [[spark-trust-and-exits.en|Spark, operators and exits to Bitcoin]] — Spark — examine the assumptions of another model

- [[secondary-lightning-nostr-wallet-connect.en|Nostr Wallet Connect connections]].

## References

- PlanB lnp202 — Set up Your First Lightning Node (reference from the source note, not re-consulted directly for this adaptation).
