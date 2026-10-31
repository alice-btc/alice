---
type: "project_note"
id: "bitcoin-genesis-block"
title: "The first block"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["History and evolution of the protocol"]
aliases: ["Bitcoin Genesis Block", "Le premier bloc"]
parent_ids: []
related_ids: ["satoshi-nakamoto", "cypherpunk-movement", "secondary-history-first-bitcoin-transaction"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bitcoin/blob/master/src/kernel/chainparams.cpp"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The first block

## Questions covered

- What is the genesis block?

## Short answer

The genesis block is Bitcoin's first block, dated 2009-01-03. It contains a reference to the newspaper The Times and to the difficulties of the banking system at the time.

## Explanation

The exact text embedded in the scriptSig field of the input of its coinbase transaction is:

> The Times 03/Jan/2009 Chancellor on brink of second bailout for banks

This reference provides a historical marker and a date context. It is often read as a criticism of bank bailouts. The chain starts from this particular block, whose parameters are kept in the software. The announcement of the white paper had preceded this launch.

## Limits and confusions

The observed text is a fact; the full set of Satoshi's motivations remains an interpretation. This sentence must not be turned into complete proof of Satoshi's identity or of positions on every economic policy.

The genesis block is not an ordinary transaction picked from a modern mempool. To explain its technical particularities, consult the corresponding code rather than inferring its behaviour by analogy with later blocks. The date of an article is a contextual clue, not by itself a perfect clock for every step of creation.

## Further reading

- [[satoshi-nakamoto.en|Satoshi Nakamoto]] — situate the pseudonymous creator
- [[cypherpunk-movement.en|The cypherpunk origins]] — understand the historical context

- [[secondary-history-first-bitcoin-transaction.en|The first known transfer between users]].

## References

- [Bitcoin Core, construction of the genesis block](https://github.com/bitcoin/bitcoin/blob/master/src/kernel/chainparams.cpp).
