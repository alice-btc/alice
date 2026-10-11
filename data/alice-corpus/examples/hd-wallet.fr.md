---
type: "project_note"
id: "hd-wallet"
title: "Les portefeuilles déterministes"
language: "fr"
tier: "primary"
status: "reviewed"
topics: ["wallets"]
aliases: ["HD Wallet"]
parent_ids: []
related_ids: ["derivation-path", "wallet-backup", "extended-public-key", "secondary-bitcoin-extended-private-key"]
reviewed_at: "2026-10-11"
review_due: null
sources: ["https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki", "https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki"]
human_reviewed_in_full: false
review_method: "adapted_from_corrected_sources"
exhaustive_external_fact_check: false
---
# Les portefeuilles déterministes

## Questions couvertes

- Comment 1 sauvegarde retrouve-t-elle plusieurs adresses ?

## Réponse courte

Un portefeuille hiérarchique déterministe, ou HD, dérive de nombreuses clés depuis une seed. Il peut ainsi créer de nouvelles adresses sans demander une sauvegarde indépendante de chaque clé.

## Explication

L’organisation ressemble à un arbre. Des branches distinguent notamment les comptes et les usages ; des positions identifient les clés successives. Le chemin de dérivation indique où chercher dans cet arbre. Avec les mêmes données de départ et les mêmes règles, le calcul reproduit les mêmes clés.

Cette propriété rend les sauvegardes plus pratiques et facilite la séparation entre un outil d’observation et un appareil qui signe. Elle ne signifie pas que toutes les informations du portefeuille sont contenues dans les mots.

## Limites et confusions

La restauration peut demander la passphrase, les chemins, le type de scripts et, en multisig, la configuration des cosignataires. Les étiquettes et autres données d’usage peuvent nécessiter leur propre sauvegarde. Un portefeuille apparemment vide après restauration ne prouve donc pas immédiatement que les fonds ont disparu ou que la phrase est fausse.

## Approfondissements

- [[derivation-path.fr|Le chemin de dérivation]].
- [[wallet-backup.fr|Préparer une sauvegarde]].
- [[extended-public-key.fr|La clé publique étendue]].

- [[secondary-bitcoin-extended-private-key.fr|Les clés privées étendues]].

## Références

- [Référence publique conservée de la note source](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki).
- [Référence publique conservée de la note source](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki).
- [Référence publique conservée de la note source](https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki).
