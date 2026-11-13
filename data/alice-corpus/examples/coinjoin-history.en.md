---
type: "project_note"
id: "coinjoin-history"
title: "The history of CoinJoin"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Histoire de CoinJoin", "CoinJoin history", "Origine de CoinJoin", "Gregory Maxwell CoinJoin"]
parent_ids: []
related_ids: ["coinjoin", "secondary-bitcoin-joinmarket", "payjoin"]
reviewed_at: "2026-11-13"
review_due: null
sources: ["https://bitcointalk.org/index.php?topic=279249.0", "https://github.com/JoinMarket-Org/joinmarket-clientserver", "https://wasabiwallet.io/"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The history of CoinJoin

## Questions covered

- Who invented CoinJoin, and when?
- What is the history of CoinJoin?
- Which software offered CoinJoin?
- Where does the name CoinJoin come from?

## Short answer

CoinJoin was proposed by developer Gregory Maxwell on 22 August 2013, in a Bitcointalk forum post titled “CoinJoin: Bitcoin privacy for the real world”. The idea requires no change to the protocol.

## Explanation

The principle is to gather inputs belonging to several people in a single transaction, each signing only their own inputs. An observer can then no longer assume that all inputs have the same owner. Maxwell pointed out that this kind of transaction was already possible under Bitcoin's existing rules.

Software then made coordination accessible: JoinMarket, where participants pay other users to join their transaction, then wallets with a coordinator, such as Wasabi Wallet with its WabiSabi protocol, or Samourai Wallet with Whirlpool. Coordination, fees and guarantees differ between implementations.

## Limits and confusions

The availability of these services has changed over time, and some coordinators have stopped operating; the current state of a given software must be checked when using it. This note recommends no service. Alice App does not offer CoinJoin.

## Further reading

- [[coinjoin.en|Understanding CoinJoin]].
- [[secondary-bitcoin-joinmarket.en|How JoinMarket works]].
- [[payjoin.en|Understanding PayJoin]].

## References

- https://bitcointalk.org/index.php?topic=279249.0.
- https://github.com/JoinMarket-Org/joinmarket-clientserver.
- https://wasabiwallet.io/.
