---
type: "project_note"
id: "bitcoin-address-scripts"
title: "Adresses, scripts et conditions de dépense"
language: "fr"
tier: "secondary"
status: "reviewed"
topics: ["transactions"]
aliases: ["types de sorties", "SegWit imbriqué", "P2WPKH", "P2WSH", "P2TR"]
parent_ids: ["legacy-address", "bitcoin-address", "segwit-address", "taproot"]
related_ids: []
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://developer.bitcoin.org/devguide/transactions.html", "https://github.com/bitcoin/bips/blob/master/bip-0013.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki"]
human_reviewed_in_full: false
review_method: "targeted_source_review_and_corrections"
exhaustive_external_fact_check: false
---
# Adresses, scripts et conditions de dépense

## Questions couvertes

- Une adresse en `3` utilise-t-elle forcément un ancien type de dépense ?
- Quelle différence entre P2WPKH, P2WSH et P2TR ?
- Que peut-on déduire d’une adresse, et qu’est-ce qui reste caché ?

## Réponse courte

Il faut distinguer l’encodage de l’adresse, le type de sortie et les conditions qui permettront de la dépenser. Plusieurs constructions peuvent partager le même début d’adresse. Une adresse n’est pas une description complète du wallet ni de toutes ses clés.

## Explication

| Type de sortie ou construction | Repère courant sur mainnet | Principe |
|---|---|---|
| P2PKH | `1…` | La dépense fournit une clé publique correspondant à l’empreinte et une signature valide. |
| P2SH | `3…` | La sortie engage une empreinte de script. La dépense révèle le script et satisfait les conditions applicables. |
| P2SH-P2WPKH ou P2SH-P2WSH | `3…` | Un programme SegWit de version 0 est enveloppé dans P2SH. Le préfixe P2SH seul ne révèle pas cette construction. |
| P2WPKH | `bc1q…` | SegWit natif de version 0 avec programme de 20 octets, correspondant à une empreinte de clé publique. |
| P2WSH | `bc1q…` | SegWit natif de version 0 avec programme de 32 octets, correspondant à une empreinte de script. La dépense révèle et satisfait ce script. |
| P2TR | `bc1p…` | Taproot utilise un programme witness de version 1 de 32 octets. Une dépense peut passer par la clé de sortie ou par un chemin de script engagé dans cette clé. |

Une dépense Taproot par clé ne révèle pas les éventuels scripts alternatifs. Une dépense par script révèle le script utilisé et les éléments nécessaires pour vérifier son engagement, sans devoir révéler tous les autres scripts. Cela ne rend pas automatiquement les transactions anonymes.

Bech32 est utilisé pour la version witness 0. Bech32m est utilisé pour les versions 1 à 16. Le préfixe `bc1p` indique la version 1 ; la longueur et les autres règles permettent de reconnaître une sortie Taproot valide. Les versions supplémentaires prévues par l’encodage ne sont pas toutes des mécanismes de dépense déjà déployés.

Le poids facturé dépend de la transaction réelle. SegWit applique un traitement distinct aux données witness. L’enveloppe P2SH ajoute des données par rapport à une construction native comparable. Pour Taproot, le chemin utilisé et les conditions satisfaites comptent aussi. Comparer seulement les préfixes ne donne donc pas un classement universel des frais.

## Limites et confusions

Cette liste couvre les principaux types adressables utilisés par les wallets. Des sorties telles que P2PK ou certaines sorties de données n’utilisent pas nécessairement un format d’adresse de réception usuel. Une transaction Bitcoin peut donc contenir des sorties qui ne correspondent pas à une ligne de ce tableau.

P2SH et P2WSH peuvent représenter du multisig, mais leur adresse ne suffit pas à prouver que c’est le cas. Une clé Taproot peut également résulter d’une construction impliquant plusieurs participants. Le format ne remplace pas les informations nécessaires à une sauvegarde ou à une restauration.

Les repères du tableau concernent mainnet. Sur les réseaux de test, les préfixes changent et certains sont partagés. La compatibilité d’un wallet doit être vérifiée pour le réseau et le type de sortie concernés.

## Approfondissements

- [[legacy-address.fr|Comparer les formats d’adresses Bitcoin]] (legacy-address) pour revenir à la comparaison destinée aux débutants.

## Références

- [Bitcoin Developer Guide, transactions et scripts usuels](https://developer.bitcoin.org/devguide/transactions.html).
- [BIP 13, adresses P2SH](https://github.com/bitcoin/bips/blob/master/bip-0013.mediawiki).
- [BIP 141, programmes witness et constructions natives ou imbriquées](https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki).
- [BIP 173, encodage des adresses SegWit de version 0](https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki).
- [BIP 341, conditions de dépense Taproot](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki).
- [BIP 350, distinction Bech32 et Bech32m](https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki).
