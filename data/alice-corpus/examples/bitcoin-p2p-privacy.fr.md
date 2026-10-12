---
type: "project_note"
id: "bitcoin-p2p-privacy"
title: "La confidentialité sur le réseau"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["privacy"]
aliases: ["Bitcoin P2P Privacy"]
parent_ids: []
related_ids: ["tor-browser", "wallet-node-connection", "non-blockchain-privacy-leaks", "secondary-privacy-vpn"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bips/blob/master/bip-0324.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0156.mediawiki"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# La confidentialité sur le réseau

## Questions couvertes

- Mon adresse IP peut-elle être associée à une transaction ?

## Réponse courte

La confidentialité Bitcoin dépend aussi des connexions réseau. Un observateur peut recueillir des indices sur l’adresse IP et le moment où une transaction est diffusée, même si la chaîne ne contient pas de nom.

## Explication

Les protections ne répondent pas toutes au même problème. Tor masque l’adresse d’origine vis-à-vis de certains interlocuteurs. Le transport P2P v2 chiffre les échanges entre pairs, mais ne cache pas leurs adresses IP ni toutes les informations de taille et de temps.

Des propositions comme Dandelion portent sur la propagation initiale. Leur présence dans un document de spécification ne signifie pas que le logiciel utilisé les applique. Il faut distinguer un principe, une proposition et une fonction réellement disponible.

## Limites et confusions

Aucun de ces outils n’efface les liens déjà publiés dans les transactions ou transmis à une plateforme. La 1re observation d’une transaction donne un indice, pas automatiquement une preuve de son auteur. Les propriétés doivent être rapportées à la configuration, aux pairs et à l’adversaire considéré, sans promesse générale d’anonymat.

## Approfondissements

- [[tor-browser.fr|Le rôle et les limites de Tor]].
- [[wallet-node-connection.fr|Relier un portefeuille à son nœud]].
- [[non-blockchain-privacy-leaks.fr|Les fuites hors de la blockchain]].

- [[secondary-privacy-vpn.fr|Ce que protège un VPN]].

## Références

- [Référence publique conservée de la note source](https://github.com/bitcoin/bips/blob/master/bip-0324.mediawiki).
- [Référence publique conservée de la note source](https://github.com/bitcoin/bips/blob/master/bip-0156.mediawiki).
