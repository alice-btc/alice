---
type: "project_note"
id: "bitcoin-genesis-block"
title: "Le premier bloc"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["Histoire et évolution du protocole"]
aliases: ["Bitcoin Genesis Block"]
parent_ids: []
related_ids: ["satoshi-nakamoto", "cypherpunk-movement", "secondary-history-first-bitcoin-transaction"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bitcoin/blob/master/src/kernel/chainparams.cpp"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Le premier bloc

## Questions couvertes

- Qu’est-ce que le bloc genesis ?

## Réponse courte

Le bloc genesis est le premier bloc de Bitcoin, daté du 2009-01-03. Il contient une référence au journal The Times et aux difficultés du système bancaire de l’époque.

## Explication

Le texte exact intégré dans le champ scriptSig de l’entrée de sa transaction coinbase est :

> The Times 03/Jan/2009 Chancellor on brink of second bailout for banks

Cette référence fournit un repère historique et un contexte de date. Elle est souvent lue comme une critique des sauvetages bancaires. La chaîne part de ce bloc particulier, dont les paramètres sont conservés dans le logiciel. L’annonce du livre blanc avait précédé ce lancement.

## Limites et confusions

Le texte observé est un fait ; l’ensemble des motivations de Satoshi reste une interprétation. Il ne faut pas transformer cette phrase en preuve complète de son identité ou de ses positions sur chaque politique économique.

Le bloc genesis n’est pas une transaction ordinaire choisie dans une mempool moderne. Pour expliquer ses particularités techniques, consulter le code correspondant plutôt que déduire son fonctionnement de l’analogie avec les blocs suivants. La date d’un article constitue un indice contextuel, pas à elle seule une horloge parfaite de toutes les étapes de création.

## Approfondissements

- [[satoshi-nakamoto.fr|Satoshi Nakamoto]] — situer le créateur pseudonyme
- [[cypherpunk-movement.fr|Les origines cypherpunks]] — comprendre le contexte historique

- [[secondary-history-first-bitcoin-transaction.fr|Le premier transfert connu entre utilisateurs]].

## Références

- [Bitcoin Core, construction du bloc genesis](https://github.com/bitcoin/bitcoin/blob/master/src/kernel/chainparams.cpp).
