---
type: "project_note"
id: "51-attack"
title: "The majority attack"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["Mining and energy"]
aliases: ["51% Attack", "L’attaque majoritaire"]
parent_ids: []
related_ids: ["mining-centralization", "bitcoin-consensus"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://econinfosec.org/archive/weis2013/papers/KrollDaveyFeltenWEIS2013.pdf", "https://bitcoin.org/bitcoin.pdf"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# The majority attack

## Questions covered

- What can a 51% attack do, and what can it not do?

## Short answer

A majority attack uses a malicious majority of the computing power to compete with the chain the network follows. It can aim at double spends or at censoring transactions.

## Explanation

The attacker tries to produce a valid chain with more accumulated work. A reorganization can then remove confirmations from transactions and let the attacker replace their own payments. The further back the reorganization reaches, the more work has to be redone; no general rule limits it to only the most recent blocks.

Computing power does not give access to other users' private keys. Nor does it allow the attacker to impose a forbidden subsidy on nodes that enforce their rules. The practical cost depends on hardware, energy, duration and the depth of the attack.

## Limits and confusions

In the work of Kroll, Davey and Felten, the term "Goldfinger" refers to a sabotage motivation aimed at a benefit outside the system. A majority attack can serve that motivation, but the two expressions are not synonyms.

This description does not quantify the current risk, nor does it guarantee advance detection. A competing chain can be prepared without being published immediately.

## Further reading

- [[mining-centralization.en|Mining centralization]] — examine concentrations of power
- [[bitcoin-consensus.en|Consensus]] — understand the validity rules

## References

- [Kroll, Davey and Felten, The Economics of Bitcoin Mining (2013)](https://econinfosec.org/archive/weis2013/papers/KrollDaveyFeltenWEIS2013.pdf).
- [Bitcoin white paper](https://bitcoin.org/bitcoin.pdf).
