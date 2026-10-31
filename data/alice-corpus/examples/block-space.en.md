---
type: "project_note"
id: "block-space"
title: "The space available in blocks"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Cryptography and protocol limits"]
aliases: ["Block Space", "La place disponible dans les blocs"]
parent_ids: []
related_ids: ["bitcoin-scalability-problem", "bitcoin-layered-architecture"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://bitcoincore.org/en/2015/12/07/roadmap/", "https://bitcoincore.org/en/2016/10/28/segwit-costs/"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The space available in blocks

## Questions covered

- Why can't everything be recorded immediately?

## Short answer

Space in Bitcoin blocks is limited. When many transactions are seeking confirmation, they compete, and fees influence their priority for inclusion.

## Explanation

Nodes must receive and verify blocks. Increasing capacity can increase the resources required; reducing it excessively can make direct access to the chain more expensive. The discussion is therefore about a trade-off between uses, validation costs and autonomy.

Transactions do not all take up the same useful space. Their structure and their virtual size count in the cost paid at a given fee rate. Grouping payments or using layers such as Lightning can reduce some demand for individual records on the chain.

## Limits and confusions

A high fee rate is not a guarantee of confirmation at an exact time. Miners choose their transactions, and the pace of blocks remains probabilistic.

A block limit does not by itself measure decentralization. Hardware resources, software and practices also count. Comparing Bitcoin with a card network solely by a number of transactions ignores the differences between recording on the chain, settlement and payments organized elsewhere.

## Further reading

- [[bitcoin-scalability-problem.en|Capacity limits]] — understand the capacity limits
- [[bitcoin-layered-architecture.en|Bitcoin's layers]] — see the layered solutions

## References

- [Gregory Maxwell, 2015 roadmap](https://bitcoincore.org/en/2015/12/07/roadmap/).
- [Bitcoin Core, costs and risks of SegWit, 2016](https://bitcoincore.org/en/2016/10/28/segwit-costs/).
