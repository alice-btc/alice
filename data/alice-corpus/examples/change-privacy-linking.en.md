---
type: "project_note"
id: "change-privacy-linking"
title: "Change and privacy links"
language: "en"
tier: "secondary"
status: "reviewed"
topics: ["privacy", "transactions"]
aliases: ["change", "monnaie rendue", "Monnaie rendue et liens de confidentialité"]
parent_ids: ["bitcoin-utxo"]
related_ids: ["coin-selection-tradeoffs"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bips/blob/master/bip-0078.mediawiki", "https://github.com/bitcoin/bitcoin/pull/23789"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Change and privacy links

## Questions covered

- How can change be recognized?
- Does a new address erase the history?

## Short answer

Change creates a new output, but remains publicly linked to the transaction that created it. Changing addresses does not remove that link.

## Explanation

An observer can try to identify the change from the output type, the amounts or later spends. These are hypotheses. Later combining that change with other funds can provide additional clues.

To limit certain clues, a wallet can create the change with the same address type as a payment output. Bitcoin Core integrated this principle in a change merged on 2021-12-20. This reduces a clue tied to the format of the outputs, without erasing the transaction's links nor guaranteeing that the change is undetectable.

## Limits and confusions

The risk to privacy depends on the context and on subsequent spends. None of these observations proves an identity on its own. Visible information must be distinguished from interpretation.

## Further reading

- [[coin-selection-tradeoffs.en|UTXO selection and trade-offs]] (coin-selection-tradeoffs) to return to the choices made before the transaction.

## References

- [BIP 78, privacy heuristics and PayJoin](https://github.com/bitcoin/bips/blob/master/bip-0078.mediawiki).

- [Bitcoin Core, matching the change type to a destination](https://github.com/bitcoin/bitcoin/pull/23789).
