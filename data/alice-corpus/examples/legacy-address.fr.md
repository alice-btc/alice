---
type: "project_note"
id: "legacy-address"
title: "Comparer les formats d’adresses Bitcoin"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["transactions"]
aliases: ["formats d’adresses", "adresse legacy", "P2PKH", "P2SH", "SegWit", "Taproot"]
parent_ids: []
related_ids: ["bitcoin-address", "segwit-address", "taproot", "bitcoin-address-scripts", "secondary-bitcoin-base58check-encoding"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/transactions.html", "https://github.com/bitcoin/bips/blob/master/bip-0013.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Comparer les formats d’adresses Bitcoin

## Questions couvertes

- Pourquoi les adresses Bitcoin n’ont-elles pas toutes le même début ?
- Quelle différence entre anciens formats, SegWit et Taproot ?
- Le format d’adresse change-t-il les frais ou la compatibilité ?

## Réponse courte

Une adresse encode une destination de paiement correspondant à des conditions de dépense. Les formats courants diffèrent selon le type de sortie et le réseau. Ils ne représentent pas des bitcoins différents ni des comptes distincts par nature.

## Explication

Sur le réseau principal, les principaux formats utilisés par les wallets se reconnaissent notamment aux débuts suivants.

| Début habituel | Format | Ce qu’il faut comprendre |
|---|---|---|
| `1…` | P2PKH, généralement appelé legacy | Format historique associé à une empreinte de clé publique. |
| `3…` | P2SH | Format associé à une empreinte de script. Il peut servir à plusieurs conditions de dépense, dont du multisig ou du SegWit imbriqué. Une adresse en `3` ne signifie donc pas nécessairement absence de SegWit. |
| `bc1q…` | SegWit natif de version 0, en Bech32 | Peut correspondre à une empreinte de clé publique ou de script. Il évite l’enveloppe P2SH du SegWit imbriqué. |
| `bc1p…` pour Taproot | P2TR, version 1 avec programme de 32 octets, en Bech32m | Permet une dépense par clé ou, selon la construction, par un script engagé dans la sortie. |

Un wallet doit prendre en charge le format pour créer correctement un paiement. La prise en charge des formats récents dépend du logiciel et de sa version.

Les frais dépendent du poids de la transaction et du taux choisi. Le type des entrées et des sorties intervient dans ce poids. SegWit peut réduire le poids facturé de certaines dépenses comparables ; Taproot ne garantit pas les frais les plus bas pour toute transaction. Une adresse de réception ne suffit pas à connaître le coût total du paiement.

## Limites et confusions

Ces repères concernent les formats courants sur mainnet, pas tous les scripts possibles ni toutes les futures versions de programmes witness. Le début d’une chaîne ne suffit pas à valider une adresse. Il faut contrôler son encodage, sa somme de contrôle, son réseau et la prise en charge de sa destination.

Les réseaux de test utilisent d’autres repères et peuvent partager certains préfixes. Un format ne prouve ni l’identité du destinataire, ni une configuration multisig, ni l’anonymat. Une Lightning Address est un autre mécanisme et n’est pas une adresse on-chain.

## Approfondissements

- [[bitcoin-address-scripts.fr|Adresses, scripts et conditions de dépense]] (bitcoin-address-scripts) pour distinguer les types techniques, le SegWit imbriqué et les limites de ce qu’une adresse révèle.

- [[secondary-bitcoin-base58check-encoding.fr|L’encodage Base58Check]].

## Références

- [Bitcoin Developer Guide, sorties et conditions de dépense](https://developer.bitcoin.org/devguide/transactions.html).
- [BIP 13, format des adresses P2SH](https://github.com/bitcoin/bips/blob/master/bip-0013.mediawiki).
- [BIP 141, SegWit natif et imbriqué, poids des transactions](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki).
- [BIP 173, Bech32 et adresses SegWit de version 0](https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki).
- [BIP 341, sorties Taproot](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki).
- [BIP 350, Bech32m pour les versions witness à partir de 1](https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki).
