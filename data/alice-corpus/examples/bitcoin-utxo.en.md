---
type: "project_note"
id: "bitcoin-utxo"
title: "Understanding UTXOs"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["UTXO", "sortie non dépensée", "Comprendre les UTXO"]
parent_ids: []
related_ids: ["coin-selection-tradeoffs", "change-privacy-linking", "secondary-bitcoin-utxo-vs-account-based-model"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/transactions.html", "https://developer.bitcoin.org/devguide/block_chain.html", "https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki", "https://github.com/bitcoin/bitcoin/blob/master/src/wallet/coinselection.cpp"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Understanding UTXOs

## Questions covered

- Why is my balance made up of several pieces?
- What is a UTXO?

## Short answer

A UTXO is a transaction output that has not yet been spent. A wallet's balance can gather several UTXOs, like several coins available to pay with.

## Explanation

To make an ordinary payment, a transaction consumes UTXOs and creates new outputs. Fictional example with 1 input of 10,000 sats: 6,000 sats go to the recipient, 3,500 sats come back as change and 500 sats make up the fee. The initial input is consumed in full. The fee is the difference between the total of the inputs and that of the outputs; it does not form 1 additional output in this transaction.

## Limits and confusions

The block's coinbase transaction is an exception. It creates the subsidy and assigns the fees to the miner without consuming any earlier UTXO.

Each UTXO spent adds an input and weight to the transaction. At the same fee rate, spending many small UTXOs generally costs more than spending a few large ones. When the rate rises, the extra cost of spending a very small UTXO can exceed its value; it remains present, but spending it becomes economically unfavourable.

This comparison with coins explains the mechanism, not privacy. An address does not necessarily represent the wallet's entire balance.

## Further reading

- [[coin-selection-tradeoffs.en|UTXO selection and trade-offs]] (coin-selection-tradeoffs) to understand the choice of inputs and its trade-offs.
- [[change-privacy-linking.en|Change and privacy links]] (change-privacy-linking) to understand what change can reveal.

- [[secondary-bitcoin-utxo-vs-account-based-model.en|UTXOs compared with accounts]].

## References

- [Bitcoin Developer Guide, transactions](https://developer.bitcoin.org/devguide/transactions.html).

- [Bitcoin Developer Guide, block chain](https://developer.bitcoin.org/devguide/block_chain.html).

- [BIP141, transaction weight and virtual size](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki).

- [Bitcoin Core, selection by value after fees and cost of change](https://github.com/bitcoin/bitcoin/blob/master/src/wallet/coinselection.cpp).
