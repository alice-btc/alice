---
type: "project_note"
id: "bitcoin-transaction-lifecycle"
title: "Le parcours d’une transaction"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["Bitcoin Transaction Lifecycle"]
parent_ids: []
related_ids: ["bitcoin-mempool", "bitcoin-transaction-confirmation", "replace-by-fee"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB btc101 — The Bitcoin Journey"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Le parcours d’une transaction

## Questions couvertes

- Que se passe-t-il entre l’envoi et la confirmation ?

## Réponse courte

Une transaction est préparée par un portefeuille, signée, diffusée puis éventuellement incluse dans un bloc. Elle obtient sa 1re confirmation lorsque ce bloc appartient à la chaîne retenue par les nœuds.

## Explication

Le portefeuille choisit des fonds à dépenser et les nouvelles sorties, dont une éventuelle monnaie rendue. Les signatures autorisent la dépense selon les conditions de ces fonds. Après diffusion, les nœuds vérifient la transaction et peuvent la transmettre à leurs pairs.

Un mineur sélectionne des transactions pour son bloc candidat. Si le bloc est trouvé et accepté, les sorties dépensées sont remplacées dans l’état du registre par les nouvelles sorties. Les blocs suivants ajoutent des confirmations.

## Limites et confusions

Signer ne signifie pas diffuser, et diffuser ne signifie pas confirmer. Les mempools ne sont pas identiques et une transaction peut être remplacée, évincée ou rester longtemps en attente. Un portefeuille affichant « envoyé » doit donc être interprété selon son indicateur réel. Une confirmation n’est pas une garantie absolue contre une réorganisation.

## Approfondissements

- [[bitcoin-mempool.fr|La file d’attente des transactions]].
- [[bitcoin-transaction-confirmation.fr|Les confirmations]].
- [[replace-by-fee.fr|Augmenter les frais avec RBF]].

## Références

- PlanB btc101 — The Bitcoin Journey.
