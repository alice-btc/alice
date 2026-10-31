---
type: "project_note"
id: "mining-centralization"
title: "Mining centralization"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Mining and energy"]
aliases: ["Mining Centralization", "La concentration du minage"]
parent_ids: []
related_ids: ["mining-pool", "51-attack", "secondary-bitcoin-open-source-mining-hardware"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/mining.html"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Mining centralization

## Questions covered

- What risks does the concentration of miners or pools pose?

## Short answer

Mining centralization can concern the machines, the pools, the manufacturers or the operating locations. A single percentage does not describe all of these dependencies.

## Explanation

A pool can select many blocks without owning the machines that compute for it. Conversely, a hardware owner can spread their machines across several pools. The physical production of hashrate and the choice of which transactions to include therefore need to be distinguished.

Geographic concentration exposes facilities to shared constraints, such as electricity, a regulation or a local outage. Industrial concentration creates other dependencies, notably for buying or repairing ASICs. These dimensions can reinforce each other, but they are not interchangeable.

## Limits and confusions

Dispersing the machines reduces some points of concentration. It does not guarantee each miner the choice of transactions if their pool builds the blocks. The effect of home mining on censorship resistance also depends on its actual weight and on the jurisdictions involved.

This production power must not be confused with the power to change the rules alone. Nodes keep verifying the validity of the blocks they receive.

## Further reading

- [[mining-pool.en|Mining pools]] — understanding the role of operators
- [[51-attack.en|The majority attack]] — delimiting the powers of a hashrate majority

- [[secondary-bitcoin-open-source-mining-hardware.en|Open-source mining hardware]].

## References

- [Developer guide, pool mining](https://developer.bitcoin.org/devguide/mining.html).
