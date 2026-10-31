---
type: "project_note"
id: "coin-selection-tradeoffs"
title: "UTXO selection and trade-offs"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["transactions", "privacy"]
aliases: ["coin selection", "choix des entrées", "Sélection des UTXO et compromis"]
parent_ids: ["bitcoin-utxo"]
related_ids: ["change-privacy-linking"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/transactions.html", "https://github.com/bitcoin/bips/blob/master/bip-0078.mediawiki", "https://github.com/bitcoin/bitcoin/blob/master/src/wallet/coinselection.cpp", "https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# UTXO selection and trade-offs

## Questions covered

- Why not always choose the smallest UTXOs?
- Why do 2 transactions of the same amount have different fees?

## Short answer

UTXO selection chooses the inputs used to pay. It must cover the amount and the fees while taking into account the size of the transaction and the links it makes public.

## Explanation

Systematically choosing the smallest UTXOs often multiplies the inputs. Each input generally increases the transaction's weight and therefore the fees at the same rate. This strategy can, however, avoid having to spend those small UTXOs later, at a possibly higher rate. The choice therefore also depends on the future fees envisaged.

Adding inputs generally increases the amount of data to sign and transmit. Combining funds received in distinct contexts can also suggest common control. A selection that avoids change can be worthwhile in some cases, but is not a universal rule.

## Limits and confusions

Fees depend on the transaction's virtual size, influenced by the types of inputs and outputs, and on the rate chosen in sats/vB. Fictional example with a 200 vB transaction at 5 sats/vB — the fee is 1,000 sats, whatever the amount sent. A small payment can therefore cost more than a large payment if its transaction is heavier.

Collaborative transactions show that common inputs do not always prove a single owner.

## Further reading

- [[change-privacy-linking.en|Change and privacy links]] (change-privacy-linking) to examine the traces left by change.

## References

- [Bitcoin Developer Guide, transactions](https://developer.bitcoin.org/devguide/transactions.html).
- [BIP 78, privacy heuristics and PayJoin](https://github.com/bitcoin/bips/blob/master/bip-0078.mediawiki).

- [Bitcoin Core, selection algorithms and immediate or future costs](https://github.com/bitcoin/bitcoin/blob/master/src/wallet/coinselection.cpp).

- [BIP141, virtual size](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki).
