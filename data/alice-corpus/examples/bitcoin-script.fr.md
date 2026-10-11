---
type: "project_note"
id: "bitcoin-script"
title: "Les conditions de dépense"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Cryptographie et limites du protocole"]
aliases: ["Bitcoin Script"]
parent_ids: []
related_ids: ["bitcoin-address-scripts", "legacy-address", "secondary-addresses-hashlock", "secondary-bitcoin-bitcoin-covenants", "secondary-bitcoin-dlc", "secondary-bitcoin-op-return"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["PlanB cyp201 — Bitcoin Wallet Architecture", "PlanB his203 — Bitcoin’s Pioneering Era"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les conditions de dépense

## Questions couvertes

- Que vérifie un script Bitcoin ?

## Réponse courte

Bitcoin Script exprime des conditions qui doivent être satisfaites pour dépenser une sortie. Il relie les fonds à des preuves, comme des signatures, plutôt qu’à un nom de personne.

## Explication

Une transaction crée des UTXO associés à des conditions de dépense. Une transaction ultérieure doit fournir les éléments nécessaires. Selon la construction, il peut s’agir d’une signature, de plusieurs signatures ou de conditions comprenant un délai.

Une adresse est généralement une représentation destinée au portefeuille pour construire un certain type de sortie. Elle n’est pas un compte contenant une identité et toutes les transactions de son propriétaire. Les formats d’adresses correspondent à différentes manières d’exprimer ou d’engager ces conditions.

## Limites et confusions

Connaître une adresse ne donne pas le pouvoir de dépenser. À l’inverse, posséder 1 clé ne suffit pas toujours si la sortie demande plusieurs signatures ou une autre condition.

Taproot modifie la représentation et l’usage de certaines conditions, sans rendre toutes les dépenses identiques. Il faut éviter de confondre condition choisie pour une sortie et restriction centrale sur les achats. Le protocole vérifie les données de dépense ; il ne connaît pas l’intention commerciale de l’utilisateur.

## Approfondissements

- [[bitcoin-address-scripts.fr|Adresses, scripts et conditions de dépense]] — Adresses et scripts — comparer les conditions
- [[legacy-address.fr|Comparer les formats d’adresses Bitcoin]] — comparer les principaux formats d’adresses

- [[secondary-addresses-hashlock.fr|Les conditions de dépense par secret]].
- [[secondary-bitcoin-bitcoin-covenants.fr|Les restrictions de dépenses futures]].
- [[secondary-bitcoin-dlc.fr|Les contrats DLC et leurs oracles]].
- [[secondary-bitcoin-op-return.fr|Les sorties OP_RETURN]].

## Références

- PlanB cyp201 — Bitcoin Wallet Architecture (référence de la note source, non reconsultée directement pour cette adaptation).
- PlanB his203 — Bitcoin’s Pioneering Era (référence de la note source, non reconsultée directement pour cette adaptation).
