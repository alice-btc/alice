---
type: "project_note"
id: "child-pays-for-parent"
title: "Child pays for parent"
language: "en"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["CPFP", "Child Pays For Parent"]
parent_ids: []
related_ids: ["replace-by-fee", "transaction-fees", "bitcoin-mempool-policy"]
reviewed_at: "2026-11-06"
review_due: null
sources: ["https://github.com/bitcoin/bitcoin/blob/master/doc/policy/packages.md", "https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
source_language: "fr"
translation_status: "machine"
---
# Child pays for parent

## Questions covered

- Who can use CPFP to help an unconfirmed transaction?
- How does it differ from RBF?

## Short answer

CPFP means Child Pays For Parent. A child transaction spends an unconfirmed output of the parent transaction, with fees that may make the parent-child package more attractive to miners.

## Explanation

A recipient can construct this child if they control a spendable parent output. They sign the child with their own keys, without needing the sender’s keys. A sender can also use a change output they control.

CPFP does not replace the parent and does not require the parent to signal RBF. Replacing the parent through RBF instead requires authorization for the replacement’s inputs.

Miners evaluate the parent and the child together: the package rate is (parent fee + child fee) ÷ (parent size + child size). The child’s fee must lift that combined rate; it therefore also pays for the parent’s size and cannot exceed the value of the output it spends.

## Limits and confusions

The output must be spendable, its value must cover the fees, the wallet must support the spend, and relay/mining policies must accept the transactions or package. Package support varies. Inclusion and timing are not guaranteed; if the parent becomes invalid, that child cannot confirm as constructed.

## Further reading

- [[replace-by-fee.en|Raising fees with RBF]].

## References

- [Bitcoin Core, package relay](https://github.com/bitcoin/bitcoin/blob/master/doc/policy/packages.md).
- [BIP125, replacement policy](https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki).
