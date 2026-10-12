---
type: "project_note"
id: "bitcoin-seed"
title: "De la phrase aux clés"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["Bitcoin Seed"]
parent_ids: []
related_ids: ["wallet-recovery-phrase", "hd-wallet", "derivation-path", "secondary-bitcoin-pbkdf2", "secondary-bitcoin-random-number-generation"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# De la phrase aux clés

## Questions couvertes

- Quelle différence entre phrase, seed et clé privée ?

## Réponse courte

La seed est un secret binaire servant à construire l’arbre de clés d’un portefeuille déterministe. Dans BIP39, elle est dérivée de la phrase de récupération et de l’éventuelle passphrase.

## Explication

Les mots sont une représentation pratique pour la sauvegarde humaine ; la seed est une donnée utilisée par les calculs. BIP32 organise ensuite la dérivation de nombreuses clés à partir de ce point de départ. La phrase, la seed et chaque clé privée remplissent donc des rôles différents.

Cela explique pourquoi 1 sauvegarde peut permettre de retrouver beaucoup d’adresses, et pourquoi le même ensemble de mots associé à une autre passphrase conduit à un autre portefeuille.

## Limites et confusions

BIP32 n’impose pas d’utiliser BIP39. Une seed ne provient donc pas forcément d’une phrase de récupération. Posséder le secret de départ ne suffit pas toujours à retrouver les fonds dans n’importe quel logiciel ; les chemins, types de scripts et informations de coordination peuvent compter. La compromission du secret de départ affecte l’ensemble des clés qu’il permet de dériver.

## Approfondissements

- [[wallet-recovery-phrase.fr|La phrase de récupération]].
- [[hd-wallet.fr|Les portefeuilles déterministes]].
- [[derivation-path.fr|Le chemin de dérivation]].

- [[secondary-bitcoin-pbkdf2.fr|La dérivation BIP39 avec PBKDF2]].
- [[secondary-bitcoin-random-number-generation.fr|La génération de secrets aléatoires]].

## Références

- [Référence publique conservée de la note source](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki).
- [Référence publique conservée de la note source](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki).
